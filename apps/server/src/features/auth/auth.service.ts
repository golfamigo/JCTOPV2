import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository, MoreThan, LessThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../../entities/user.entity';
import { PasswordResetToken } from '../../entities/password-reset-token.entity';
import { EmailService } from '../../services/email.service';
import { RegisterUserDto, LoginUserDto, UpdateUserDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private resetTokensRepository: Repository<PasswordResetToken>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<Omit<User, 'passwordHash'>> {
    const { name, email, password } = registerUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = this.usersRepository.create({
      name,
      email,
      passwordHash,
      authProvider: 'email',
    });

    const savedUser = await this.usersRepository.save(user);
    return this.serializeUser(savedUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; user: Omit<User, 'passwordHash'> }> {
    const { email, password } = loginUserDto;

    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: this.serializeUser(user),
    };
  }

  async getProfile(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.serializeUser(user);
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.update(userId, updateUserDto);
    
    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
    });

    return this.serializeUser(updatedUser);
  }

  async findOrCreateGoogleUser(profile: any): Promise<Omit<User, 'passwordHash'>> {
    const { id: googleId, emails, displayName } = profile;
    const email = emails[0]?.value;

    if (!email) {
      throw new UnauthorizedException('Google profile must include email');
    }

    // First, try to find user by Google ID
    let user = await this.usersRepository.findOne({
      where: { googleId },
    });

    if (user) {
      return this.serializeUser(user);
    }

    // If not found by Google ID, try to find by email
    user = await this.usersRepository.findOne({
      where: { email },
    });

    if (user) {
      // SECURITY: Only link Google account if user doesn't have a password
      // This prevents account takeover attacks
      if (user.passwordHash) {
        throw new ConflictException(
          'An account with this email already exists. Please sign in with your password first, then link your Google account from settings.'
        );
      }
      
      // Safe to link Google account for passwordless users
      user.googleId = googleId;
      user.authProvider = 'google';
      const updatedUser = await this.usersRepository.save(user);
      return this.serializeUser(updatedUser);
    }

    // Create new user
    const newUser = this.usersRepository.create({
      name: displayName || 'Google User',
      email,
      googleId,
      authProvider: 'google',
      // No password hash for Google users
    });

    const savedUser = await this.usersRepository.save(newUser);
    return this.serializeUser(savedUser);
  }

  async generateJwt(user: Omit<User, 'passwordHash'>): Promise<string> {
    const payload = { 
      sub: user.id, 
      email: user.email,
      name: user.name
    };

    return await this.jwtService.signAsync(payload);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // Clean up expired tokens for this user before creating new one
    await this.cleanupExpiredTokens();

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token
    await this.resetTokensRepository.save({
      userId: user.id,
      token,
      expiresAt,
    });

    // Send email with reset link
    await this.emailService.sendPasswordResetEmail(user.email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find valid, non-expired token
    const resetToken = await this.resetTokensRepository.findOne({
      where: { 
        token, 
        expiresAt: MoreThan(new Date()) 
      },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    await this.usersRepository.update(resetToken.userId, { 
      passwordHash 
    });

    // Delete the used token (single-use)
    await this.resetTokensRepository.delete({ token });

    // Clean up expired tokens after successful reset
    await this.cleanupExpiredTokens();
  }

  /**
   * Clean up expired password reset tokens
   * This prevents token accumulation and maintains database performance
   */
  private async cleanupExpiredTokens(): Promise<void> {
    try {
      await this.resetTokensRepository.delete({
        expiresAt: LessThan(new Date()),
      });
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Failed to cleanup expired password reset tokens:', error);
    }
  }

  private serializeUser(user: User): Omit<User, 'passwordHash'> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      googleId: user.googleId,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}