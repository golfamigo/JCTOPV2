import { Controller, Post, Body, HttpStatus, Get, Put, UseGuards, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto, AuthResponseDto, LoginUserDto, LoginResponseDto, UpdateUserDto, ProfileResponseDto } from './dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { ResetPasswordResponseDto } from './dto/reset-password-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async register(@Body() registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    const user = await this.authService.register(registerUserDto);
    
    return {
      user,
      message: 'Registration successful',
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully logged in',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    const result = await this.authService.login(loginUserDto);
    
    return {
      accessToken: result.accessToken,
      user: result.user,
      message: 'Login successful',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  async getProfile(@Request() req): Promise<ProfileResponseDto> {
    const user = await this.authService.getProfile(req.user.sub);
    
    return {
      user,
      message: 'Profile retrieved successfully',
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile updated successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto): Promise<ProfileResponseDto> {
    const user = await this.authService.updateProfile(req.user.sub, updateUserDto);
    
    return {
      user,
      message: 'Profile updated successfully',
    };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth flow' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirects to Google OAuth consent screen',
  })
  async googleAuth() {
    // This route initiates the Google OAuth flow
    // The actual redirect to Google is handled by the GoogleAuthGuard
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Handle Google OAuth callback' })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description: 'Redirects to mobile app with authentication token',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Google OAuth authentication failed',
  })
  async googleAuthRedirect(@Request() req, @Res() res): Promise<void> {
    try {
      const accessToken = await this.authService.generateJwt(req.user);
      
      // Check if this is a web or mobile request based on user agent or query param
      const userAgent = req.headers['user-agent'] || '';
      const isWeb = req.query.platform === 'web' || 
                    userAgent.includes('Mozilla') || 
                    userAgent.includes('Chrome') || 
                    userAgent.includes('Safari');
      
      if (isWeb) {
        // For web apps, redirect to the web callback URL
        const webCallbackUrl = process.env.WEB_APP_URL || 'https://jctop-web.zeabur.app';
        const callbackUrl = `${webCallbackUrl}/auth/callback?token=${accessToken}&success=true`;
        res.redirect(callbackUrl);
      } else {
        // For mobile apps, redirect to a deep link with the access token
        const deepLinkUrl = `com.jctopevent.client://auth/callback?token=${accessToken}&success=true`;
        res.redirect(deepLinkUrl);
      }
    } catch {
      // Check platform for error redirect
      const userAgent = req.headers['user-agent'] || '';
      const isWeb = req.query.platform === 'web' || 
                    userAgent.includes('Mozilla') || 
                    userAgent.includes('Chrome') || 
                    userAgent.includes('Safari');
      
      if (isWeb) {
        const webCallbackUrl = process.env.WEB_APP_URL || 'https://jctop-web.zeabur.app';
        const errorUrl = `${webCallbackUrl}/auth/callback?error=authentication_failed&success=false`;
        res.redirect(errorUrl);
      } else {
        const errorDeepLink = `com.jctopevent.client://auth/callback?error=authentication_failed&success=false`;
        res.redirect(errorDeepLink);
      }
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset request processed',
    type: ForgotPasswordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded - too many password reset requests',
  })
  // TODO: Add @Throttle(3, 60) decorator when @nestjs/throttler is installed
  // Rate limit: 3 requests per 60 seconds per IP
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    
    return {
      message: 'If an account with that email address exists, we have sent you a password reset link.',
    };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password successfully reset',
    type: ResetPasswordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.password);
    
    return {
      message: 'Your password has been successfully reset. You can now log in with your new password.',
    };
  }
}