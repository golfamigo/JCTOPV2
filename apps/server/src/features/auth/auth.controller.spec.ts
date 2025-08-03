import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  describe('register', () => {
    const registerDto: RegisterUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123',
    };

    const mockUser = {
      id: 'uuid-123',
      name: registerDto.name,
      email: registerDto.email,
      authProvider: 'email' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully register a user', async () => {
      authService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        user: mockUser,
        message: 'Registration successful',
      });
    });

    it('should return proper response structure', async () => {
      authService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Registration successful');
      expect(result.user).toEqual(mockUser);
    });

    it('should handle duplicate email error', async () => {
      authService.register.mockRejectedValue(new ConflictException('User with this email already exists'));

      await expect(controller.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(controller.register(registerDto)).rejects.toThrow('User with this email already exists');
    });

    it('should validate input data', async () => {
      const invalidDto = {
        name: '',
        email: 'invalid-email',
        password: '123',
      };

      authService.register.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.register(invalidDto as RegisterUserDto)).rejects.toThrow('Validation failed');
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
      email: loginDto.email,
      authProvider: 'email' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockLoginResponse = {
      accessToken: 'jwt.token.here',
      user: mockUser,
    };

    it('should successfully login a user', async () => {
      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        accessToken: mockLoginResponse.accessToken,
        user: mockLoginResponse.user,
        message: 'Login successful',
      });
    });

    it('should return proper response structure', async () => {
      authService.login.mockResolvedValue(mockLoginResponse);

      const result = await controller.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Login successful');
      expect(result.accessToken).toBe(mockLoginResponse.accessToken);
      expect(result.user).toEqual(mockLoginResponse.user);
    });

    it('should handle invalid credentials error', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(controller.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should validate input data', async () => {
      const invalidDto = {
        email: 'invalid-email',
        password: '',
      };

      authService.login.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.login(invalidDto as LoginUserDto)).rejects.toThrow('Validation failed');
    });
  });

  describe('getProfile', () => {
    const mockUser = {
      id: 'uuid-123',
      name: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      authProvider: 'email' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRequest = {
      user: { sub: mockUser.id },
    };

    it('should successfully get user profile', async () => {
      authService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(authService.getProfile).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        user: mockUser,
        message: 'Profile retrieved successfully',
      });
    });

    it('should return proper response structure', async () => {
      authService.getProfile.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Profile retrieved successfully');
      expect(result.user).toEqual(mockUser);
    });

    it('should handle user not found error', async () => {
      authService.getProfile.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.getProfile(mockRequest)).rejects.toThrow(NotFoundException);
      await expect(controller.getProfile(mockRequest)).rejects.toThrow('User not found');
    });
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: 'uuid-123',
      name: 'Updated User',
      email: 'test@example.com',
      phone: '+9876543210',
      authProvider: 'email' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockRequest = {
      user: { sub: mockUser.id },
    };

    const updateDto: UpdateUserDto = {
      name: 'Updated User',
      phone: '+9876543210',
    };

    it('should successfully update user profile', async () => {
      authService.updateProfile.mockResolvedValue(mockUser);

      const result = await controller.updateProfile(mockRequest, updateDto);

      expect(authService.updateProfile).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result).toEqual({
        user: mockUser,
        message: 'Profile updated successfully',
      });
    });

    it('should return proper response structure', async () => {
      authService.updateProfile.mockResolvedValue(mockUser);

      const result = await controller.updateProfile(mockRequest, updateDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message');
      expect(result.message).toBe('Profile updated successfully');
      expect(result.user).toEqual(mockUser);
    });

    it('should handle user not found error', async () => {
      authService.updateProfile.mockRejectedValue(new NotFoundException('User not found'));

      await expect(controller.updateProfile(mockRequest, updateDto)).rejects.toThrow(NotFoundException);
      await expect(controller.updateProfile(mockRequest, updateDto)).rejects.toThrow('User not found');
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto: UpdateUserDto = { name: 'Only Name Update' };
      const partiallyUpdatedUser = { ...mockUser, name: 'Only Name Update' };
      
      authService.updateProfile.mockResolvedValue(partiallyUpdatedUser);

      const result = await controller.updateProfile(mockRequest, partialUpdateDto);

      expect(authService.updateProfile).toHaveBeenCalledWith(mockUser.id, partialUpdateDto);
      expect(result.user.name).toBe('Only Name Update');
    });

    it('should validate input data', async () => {
      const invalidDto = {
        name: '', // Too short
        phone: 'invalid-phone',
      };

      authService.updateProfile.mockRejectedValue(new Error('Validation failed'));

      await expect(controller.updateProfile(mockRequest, invalidDto as UpdateUserDto)).rejects.toThrow('Validation failed');
    });
  });
});