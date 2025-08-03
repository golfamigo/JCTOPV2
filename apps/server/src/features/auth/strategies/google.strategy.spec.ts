import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './google.strategy';
import { AuthService } from '../auth.service';
import { User } from '../../../entities/user.entity';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let authService: AuthService;
  let configService: ConfigService;

  const mockUser: Omit<User, 'passwordHash'> = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: null,
    googleId: 'google123',
    authProvider: 'google',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GOOGLE_CLIENT_ID') return 'test-client-id';
              if (key === 'GOOGLE_CLIENT_SECRET') return 'test-client-secret';
              return null;
            }),
          },
        },
        {
          provide: AuthService,
          useValue: {
            findOrCreateGoogleUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate Google profile and return user', async () => {
    const profile = {
      id: 'google123',
      displayName: 'John Doe',
      emails: [{ value: 'john@example.com' }],
    };

    jest.spyOn(authService, 'findOrCreateGoogleUser').mockResolvedValue(mockUser);

    const done = jest.fn();
    await strategy.validate('access-token', 'refresh-token', profile, done);

    expect(authService.findOrCreateGoogleUser).toHaveBeenCalledWith(profile);
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('should handle authentication errors', async () => {
    const profile = {
      id: 'google123',
      displayName: 'John Doe',
      emails: [{ value: 'john@example.com' }],
    };

    const error = new Error('Authentication failed');
    jest.spyOn(authService, 'findOrCreateGoogleUser').mockRejectedValue(error);

    const done = jest.fn();
    await strategy.validate('access-token', 'refresh-token', profile, done);

    expect(done).toHaveBeenCalledWith(error, null);
  });

  it('should use correct configuration', () => {
    expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_ID');
    expect(configService.get).toHaveBeenCalledWith('GOOGLE_CLIENT_SECRET');
  });
});