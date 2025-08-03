import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { EmailService } from '../../services/email.service';
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from './dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<Repository<User>>;
  let resetTokenRepository: jest.Mocked<Repository<PasswordResetToken>>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const mockRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const mockResetTokenRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

    const mockEmailService = {
      sendPasswordResetEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useValue: mockResetTokenRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    resetTokenRepository = module.get(getRepositoryToken(PasswordResetToken));
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);

    // Clear any existing spies
    jest.restoreAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        id: 'uuid-123',
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: hashedPassword,
        authProvider: 'email',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      userRepository.create.mockReturnValue(savedUser as User);
      userRepository.save.mockResolvedValue(savedUser as User);

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: hashedPassword,
        authProvider: 'email',
      });
      expect(userRepository.save).toHaveBeenCalledWith(savedUser);
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe(registerDto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = {
        id: 'existing-uuid',
        email: registerDto.email,
      };

      userRepository.findOne.mockResolvedValue(existingUser as User);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('User with this email already exists');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should hash password before saving', async () => {
      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        id: 'uuid-123',
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: hashedPassword,
        authProvider: 'email',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      userRepository.create.mockReturnValue(savedUser as User);
      userRepository.save.mockResolvedValue(savedUser as User);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: hashedPassword,
        authProvider: 'email',
      });
    });

    it('should set authProvider to "email"', async () => {
      const hashedPassword = 'hashedPassword123';
      const savedUser = {
        id: 'uuid-123',
        name: registerDto.name,
        email: registerDto.email,
        passwordHash: hashedPassword,
        authProvider: 'email',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      userRepository.create.mockReturnValue(savedUser as User);
      userRepository.save.mockResolvedValue(savedUser as User);

      await service.register(registerDto);

      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          authProvider: 'email',
        })
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginUserDto = {
      email: 'test@example.com',
      password: 'Password123',
    };

    const mockUser = {
      id: 'uuid-123',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedPassword123',
      authProvider: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully login with valid credentials', async () => {
      const expectedToken = 'jwt.token.here';
      
      userRepository.findOne.mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result.accessToken).toBe(expectedToken);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcryptCompareSpy).not.toHaveBeenCalled();
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.passwordHash);
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });

    it('should generate JWT token with correct payload', async () => {
      const expectedToken = 'jwt.token.here';
      
      userRepository.findOne.mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jwtService.signAsync.mockResolvedValue(expectedToken);

      await service.login(loginDto);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
    });

    it('should return user without password hash', async () => {
      const expectedToken = 'jwt.token.here';
      
      userRepository.findOne.mockResolvedValue(mockUser as User);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.login(loginDto);

      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        authProvider: mockUser.authProvider,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result.user).not.toHaveProperty('passwordHash');
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      id: 'uuid-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      passwordHash: 'hashedPassword123',
      authProvider: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    it('should successfully get user profile', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        authProvider: mockUser.authProvider,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('non-existent-id')).rejects.toThrow(NotFoundException);
      await expect(service.getProfile('non-existent-id')).rejects.toThrow('User not found');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: 'uuid-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      passwordHash: 'hashedPassword123',
      authProvider: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    const updateDto: UpdateUserDto = {
      name: 'Updated Name',
      phone: '+9876543210',
    };

    it('should successfully update user profile', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      
      userRepository.findOne
        .mockResolvedValueOnce(mockUser) // First call for existence check
        .mockResolvedValueOnce(updatedUser); // Second call for updated data
      userRepository.update.mockResolvedValue(undefined);

      const result = await service.updateProfile(mockUser.id, updateDto);

      expect(userRepository.findOne).toHaveBeenCalledTimes(2);
      expect(userRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: mockUser.id },
      });
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(userRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: mockUser.id },
      });
      expect(result).toEqual({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        authProvider: updatedUser.authProvider,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException if user not found during update', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.updateProfile('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.updateProfile('non-existent-id', updateDto)).rejects.toThrow('User not found');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
      expect(userRepository.update).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto: UpdateUserDto = { name: 'Only Name Update' };
      const updatedUser = { ...mockUser, name: partialUpdateDto.name };
      
      userRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      userRepository.update.mockResolvedValue(undefined);

      const result = await service.updateProfile(mockUser.id, partialUpdateDto);

      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, partialUpdateDto);
      expect(result.name).toBe(partialUpdateDto.name);
      expect(result.phone).toBe(mockUser.phone); // Should remain unchanged
    });

    it('should handle empty phone field update', async () => {
      const updateDtoWithEmptyPhone: UpdateUserDto = { phone: undefined };
      const updatedUser = { ...mockUser, phone: undefined };
      
      userRepository.findOne
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updatedUser);
      userRepository.update.mockResolvedValue(undefined);

      const result = await service.updateProfile(mockUser.id, updateDtoWithEmptyPhone);

      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, updateDtoWithEmptyPhone);
      expect(result.phone).toBeUndefined();
    });
  });

  describe('findOrCreateGoogleUser', () => {
    const googleProfile = {
      id: 'google123',
      displayName: 'John Doe',
      emails: [{ value: 'john@example.com' }],
    };

    const mockGoogleUser = {
      id: 'uuid-123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: null,
      googleId: 'google123',
      passwordHash: null,
      authProvider: 'google' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    it('should return existing user if found by Google ID', async () => {
      userRepository.findOne.mockResolvedValue(mockGoogleUser);

      const result = await service.findOrCreateGoogleUser(googleProfile);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { googleId: 'google123' },
      });
      expect(result).toEqual({
        id: mockGoogleUser.id,
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        phone: mockGoogleUser.phone,
        googleId: mockGoogleUser.googleId,
        authProvider: mockGoogleUser.authProvider,
        createdAt: mockGoogleUser.createdAt,
        updatedAt: mockGoogleUser.updatedAt,
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should update existing passwordless user with Google ID if found by email', async () => {
      const existingUser = {
        ...mockGoogleUser,
        googleId: null,
        passwordHash: null, // No password - safe to link
        authProvider: 'email' as const,
      } as User;

      const updatedUser = {
        ...existingUser,
        googleId: 'google123',
        authProvider: 'google' as const,
      } as User;

      userRepository.findOne
        .mockResolvedValueOnce(null) // Not found by Google ID
        .mockResolvedValueOnce(existingUser); // Found by email
      userRepository.save.mockResolvedValue(updatedUser);

      const result = await service.findOrCreateGoogleUser(googleProfile);

      expect(userRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { googleId: 'google123' },
      });
      expect(userRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { email: 'john@example.com' },
      });
      expect(userRepository.save).toHaveBeenCalledWith({
        ...existingUser,
        googleId: 'google123',
        authProvider: 'google',
      });
      expect(result.googleId).toBe('google123');
      expect(result.authProvider).toBe('google');
    });

    it('should throw ConflictException if user exists with password', async () => {
      const existingUserWithPassword = {
        ...mockGoogleUser,
        googleId: null,
        passwordHash: 'hashedPassword123', // Has password - security risk to link
        authProvider: 'email' as const,
      } as User;

      userRepository.findOne
        .mockResolvedValueOnce(null) // Not found by Google ID
        .mockResolvedValueOnce(existingUserWithPassword); // Found by email

      await expect(service.findOrCreateGoogleUser(googleProfile)).rejects.toThrow(ConflictException);
      
      // Reset mocks and test again for the specific error message
      userRepository.findOne
        .mockResolvedValueOnce(null) // Not found by Google ID
        .mockResolvedValueOnce(existingUserWithPassword); // Found by email
        
      await expect(service.findOrCreateGoogleUser(googleProfile)).rejects.toThrow(
        'An account with this email already exists. Please sign in with your password first, then link your Google account from settings.'
      );

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should create new user if not found by Google ID or email', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(null) // Not found by Google ID
        .mockResolvedValueOnce(null); // Not found by email
      userRepository.create.mockReturnValue(mockGoogleUser);
      userRepository.save.mockResolvedValue(mockGoogleUser);

      const result = await service.findOrCreateGoogleUser(googleProfile);

      expect(userRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { googleId: 'google123' },
      });
      expect(userRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { email: 'john@example.com' },
      });
      expect(userRepository.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        googleId: 'google123',
        authProvider: 'google',
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockGoogleUser);
      expect(result).toEqual({
        id: mockGoogleUser.id,
        name: mockGoogleUser.name,
        email: mockGoogleUser.email,
        phone: mockGoogleUser.phone,
        googleId: mockGoogleUser.googleId,
        authProvider: mockGoogleUser.authProvider,
        createdAt: mockGoogleUser.createdAt,
        updatedAt: mockGoogleUser.updatedAt,
      });
    });

    it('should throw UnauthorizedException if profile has no email', async () => {
      const profileWithoutEmail = {
        id: 'google123',
        displayName: 'John Doe',
        emails: [], // Empty emails array
      };

      await expect(service.findOrCreateGoogleUser(profileWithoutEmail)).rejects.toThrow(UnauthorizedException);
      await expect(service.findOrCreateGoogleUser(profileWithoutEmail)).rejects.toThrow(
        'Google profile must include email'
      );

      expect(userRepository.findOne).not.toHaveBeenCalled();
    });

    it('should handle missing displayName gracefully', async () => {
      const profileWithoutDisplayName = {
        id: 'google123',
        displayName: undefined,
        emails: [{ value: 'john@example.com' }],
      };

      userRepository.findOne
        .mockResolvedValueOnce(null) // Not found by Google ID
        .mockResolvedValueOnce(null); // Not found by email
      userRepository.create.mockReturnValue({
        ...mockGoogleUser,
        name: 'Google User', // Default name
      });
      userRepository.save.mockResolvedValue({
        ...mockGoogleUser,
        name: 'Google User',
      });

      const result = await service.findOrCreateGoogleUser(profileWithoutDisplayName);

      expect(userRepository.create).toHaveBeenCalledWith({
        name: 'Google User', // Should use default name
        email: 'john@example.com',
        googleId: 'google123',
        authProvider: 'google',
      });
      expect(result.name).toBe('Google User');
    });
  });

  describe('generateJwt', () => {
    const mockUser = {
      id: 'uuid-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: null,
      googleId: 'google123',
      authProvider: 'google' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should generate JWT token with correct payload', async () => {
      const expectedToken = 'jwt.token.here';
      jwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await service.generateJwt(mockUser);

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      });
      expect(result).toBe(expectedToken);
    });
  });

  describe('forgotPassword', () => {
    const mockUser = {
      id: 'uuid-123',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedPassword123',
      authProvider: 'email',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    it('should send password reset email for existing user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      resetTokenRepository.save.mockResolvedValue({} as PasswordResetToken);
      emailService.sendPasswordResetEmail.mockResolvedValue();

      await service.forgotPassword('test@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(resetTokenRepository.save).toHaveBeenCalledWith({
        userId: mockUser.id,
        token: expect.any(String),
        expiresAt: expect.any(Date),
      });
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String)
      );
    });

    it('should not reveal if user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await service.forgotPassword('nonexistent@example.com');

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
      expect(resetTokenRepository.save).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should generate secure token with correct expiration', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      resetTokenRepository.save.mockResolvedValue({} as PasswordResetToken);
      emailService.sendPasswordResetEmail.mockResolvedValue();

      const beforeCall = Date.now();
      await service.forgotPassword('test@example.com');
      const afterCall = Date.now();

      expect(resetTokenRepository.save).toHaveBeenCalledWith({
        userId: mockUser.id,
        token: expect.stringMatching(/^[a-f0-9]{64}$/), // 32 bytes = 64 hex chars
        expiresAt: expect.any(Date),
      });

      // Check that expiration is approximately 24 hours from now
      const saveCall = resetTokenRepository.save.mock.calls[0][0];
      const expirationTime = (saveCall.expiresAt as Date).getTime();
      const expectedExpiration = beforeCall + 24 * 60 * 60 * 1000; // 24 hours
      const toleranceMs = 1000; // 1 second tolerance

      expect(expirationTime).toBeGreaterThanOrEqual(expectedExpiration - toleranceMs);
      expect(expirationTime).toBeLessThanOrEqual(afterCall + 24 * 60 * 60 * 1000 + toleranceMs);
    });
  });

  describe('resetPassword', () => {
    const validToken = 'valid-reset-token';
    const newPassword = 'NewPassword123';
    const hashedPassword = 'hashedNewPassword123';
    
    const mockResetToken = {
      id: 'reset-token-id',
      userId: 'user-id',
      token: validToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      createdAt: new Date(),
    } as PasswordResetToken;

    beforeEach(() => {
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword as never));
    });

    it('should successfully reset password with valid token', async () => {
      resetTokenRepository.findOne.mockResolvedValue(mockResetToken);
      userRepository.update.mockResolvedValue({} as any);
      resetTokenRepository.delete.mockResolvedValue({} as any);

      await service.resetPassword(validToken, newPassword);

      expect(resetTokenRepository.findOne).toHaveBeenCalledWith({
        where: { 
          token: validToken, 
          expiresAt: expect.any(Object) // MoreThan(new Date())
        },
        relations: ['user'],
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(userRepository.update).toHaveBeenCalledWith(mockResetToken.userId, {
        passwordHash: hashedPassword,
      });
      expect(resetTokenRepository.delete).toHaveBeenCalledWith({ token: validToken });
    });

    it('should throw BadRequestException for invalid token', async () => {
      resetTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', newPassword)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword('invalid-token', newPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(resetTokenRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for expired token', async () => {
      // Expired tokens won't be found due to MoreThan condition in the query
      resetTokenRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });

    it('should handle password hashing errors', async () => {
      resetTokenRepository.findOne.mockResolvedValue(mockResetToken);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.reject(new Error('Hashing failed')));

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow('Hashing failed');

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(resetTokenRepository.delete).not.toHaveBeenCalled();
    });

    it('should delete token even if database update fails', async () => {
      resetTokenRepository.findOne.mockResolvedValue(mockResetToken);
      userRepository.update.mockRejectedValue(new Error('Database error'));
      resetTokenRepository.delete.mockResolvedValue({} as any);

      await expect(service.resetPassword(validToken, newPassword)).rejects.toThrow('Database error');

      expect(resetTokenRepository.delete).not.toHaveBeenCalled(); // Should not delete token if update fails
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens when called during forgotPassword', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
      };

      userRepository.findOne.mockResolvedValue(mockUser as User);
      resetTokenRepository.save.mockResolvedValue({} as PasswordResetToken);
      resetTokenRepository.delete.mockResolvedValue({} as any);
      emailService.sendPasswordResetEmail.mockResolvedValue();

      await service.forgotPassword('test@example.com');

      // Verify cleanup was called (delete with LessThan condition)
      expect(resetTokenRepository.delete).toHaveBeenCalledWith({
        expiresAt: expect.any(Object), // LessThan(new Date())
      });
    });

    it('should delete expired tokens when called during resetPassword', async () => {
      const validToken = 'valid-reset-token';
      const newPassword = 'NewPassword123';
      const mockResetToken = {
        id: 'token-uuid',
        userId: 'user-uuid',
        token: validToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        createdAt: new Date(),
        user: {} as any, // Mock user relation
      };

      resetTokenRepository.findOne.mockResolvedValue(mockResetToken);
      userRepository.update.mockResolvedValue({} as any);
      resetTokenRepository.delete.mockResolvedValue({} as any);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedPassword'));

      await service.resetPassword(validToken, newPassword);

      // Verify cleanup was called after successful reset
      expect(resetTokenRepository.delete).toHaveBeenCalledTimes(2);
      // First call: delete the used token
      expect(resetTokenRepository.delete).toHaveBeenCalledWith({ token: validToken });
      // Second call: cleanup expired tokens
      expect(resetTokenRepository.delete).toHaveBeenCalledWith({
        expiresAt: expect.any(Object), // LessThan(new Date())
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      const mockUser = {
        id: 'uuid-123',
        email: 'test@example.com',
      };

      userRepository.findOne.mockResolvedValue(mockUser as User);
      resetTokenRepository.save.mockResolvedValue({} as PasswordResetToken);
      resetTokenRepository.delete.mockRejectedValueOnce(new Error('Cleanup failed'));
      emailService.sendPasswordResetEmail.mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Should not throw even if cleanup fails
      await expect(service.forgotPassword('test@example.com')).resolves.not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to cleanup expired password reset tokens:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});