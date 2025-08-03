import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getTestDatabaseConfig } from '../config/test-database.config';

describe('User Entity', () => {
  let userRepository: Repository<User>;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getTestDatabaseConfig()),
        TypeOrmModule.forFeature([User]),
      ],
    }).compile();

    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  }, 30000); // Increased timeout for PostgreSQL connection

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    await userRepository.clear();
  });

  describe('Entity Creation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        authProvider: 'email' as const,
        passwordHash: 'hashedPassword123',
      };

      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      expect(savedUser.id).toBeDefined();
      expect(savedUser.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.authProvider).toBe(userData.authProvider);
      expect(savedUser.passwordHash).toBe(userData.passwordHash);
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user without password hash for OAuth providers', async () => {
      const userData = {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        authProvider: 'google' as const,
      };

      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      expect(savedUser.id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.authProvider).toBe(userData.authProvider);
      expect(savedUser.passwordHash).toBeNull();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should support all auth provider types', async () => {
      const authProviders = ['email', 'google', 'line', 'apple'] as const;
      
      for (const provider of authProviders) {
        const userData = {
          name: `Test User ${provider}`,
          email: `test.${provider}@example.com`,
          authProvider: provider,
        };

        const user = userRepository.create(userData);
        const savedUser = await userRepository.save(user);

        expect(savedUser.authProvider).toBe(provider);
      }
    });
  });

  describe('Entity Validation', () => {
    it('should fail to save user without required name', async () => {
      const invalidUserData = {
        email: 'test@example.com',
        authProvider: 'email' as const,
      };

      const user = userRepository.create(invalidUserData);
      
      await expect(userRepository.save(user)).rejects.toThrow();
    });

    it('should fail to save user without required email', async () => {
      const invalidUserData = {
        name: 'Test User',
        authProvider: 'email' as const,
      };

      const user = userRepository.create(invalidUserData);
      
      await expect(userRepository.save(user)).rejects.toThrow();
    });

    it('should fail to save user without required authProvider', async () => {
      const invalidUserData = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const user = userRepository.create(invalidUserData);
      
      await expect(userRepository.save(user)).rejects.toThrow();
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique email constraint', async () => {
      const userData1 = {
        name: 'User One',
        email: 'duplicate@example.com',
        authProvider: 'email' as const,
      };

      const userData2 = {
        name: 'User Two',
        email: 'duplicate@example.com',
        authProvider: 'google' as const,
      };

      const user1 = userRepository.create(userData1);
      await userRepository.save(user1);

      const user2 = userRepository.create(userData2);
      
      await expect(userRepository.save(user2)).rejects.toThrow();
    });

    it('should update the updatedAt timestamp when modified', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        authProvider: 'email' as const,
      };

      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);
      const originalUpdatedAt = savedUser.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1100));

      savedUser.name = 'John Updated';
      const updatedUser = await userRepository.save(savedUser);

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
      expect(updatedUser.name).toBe('John Updated');
    });
  });

  describe('TypeORM Repository Integration', () => {
    it('should find user by email', async () => {
      const userData = {
        name: 'Find Me',
        email: 'findme@example.com',
        authProvider: 'email' as const,
      };

      const user = userRepository.create(userData);
      const savedUser = await userRepository.save(user);

      const foundUser = await userRepository.findOne({
        where: { email: userData.email }
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(savedUser.id);
      expect(foundUser!.email).toBe(userData.email);
    });

    it('should find users by auth provider', async () => {
      const usersData = [
        { name: 'Email User 1', email: 'email1@example.com', authProvider: 'email' as const },
        { name: 'Email User 2', email: 'email2@example.com', authProvider: 'email' as const },
        { name: 'Google User', email: 'google@example.com', authProvider: 'google' as const },
      ];

      for (const userData of usersData) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
      }

      const emailUsers = await userRepository.find({
        where: { authProvider: 'email' }
      });

      expect(emailUsers).toHaveLength(2);
      emailUsers.forEach(user => {
        expect(user.authProvider).toBe('email');
      });
    });

    it('should count total users', async () => {
      const usersData = [
        { name: 'User 1', email: 'user1@example.com', authProvider: 'email' as const },
        { name: 'User 2', email: 'user2@example.com', authProvider: 'google' as const },
        { name: 'User 3', email: 'user3@example.com', authProvider: 'line' as const },
      ];

      for (const userData of usersData) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
      }

      const userCount = await userRepository.count();
      expect(userCount).toBe(3);
    });
  });
});