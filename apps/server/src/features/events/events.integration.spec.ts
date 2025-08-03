import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventsModule } from './events.module';
import { Event } from '../../entities/event.entity';
import { Registration } from '../registrations/entities/registration.entity';
import { User } from '../../entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('Events Statistics Integration', () => {
  let app: INestApplication;
  let eventRepository: Repository<Event>;
  let registrationRepository: Repository<Registration>;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockEvent = {
    id: 'test-event-id',
    title: 'Test Event',
    description: 'Test Description',
    organizerId: mockUser.id,
    status: 'published',
    startDate: new Date('2024-06-01T10:00:00Z'),
    endDate: new Date('2024-06-01T18:00:00Z'),
    location: 'Test Location',
    categoryId: 'test-category-id',
    venueId: 'test-venue-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockEventRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const mockRegistrationRepository = {
      count: jest.fn(),
    };

    const mockUserRepository = {
      findOne: jest.fn(),
    };

    // Mock the JWT guard to automatically authenticate
    const mockJwtGuard = {
      canActivate: jest.fn(() => true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    })
      .overrideProvider(getRepositoryToken(Event))
      .useValue(mockEventRepository)
      .overrideProvider(getRepositoryToken(Registration))
      .useValue(mockRegistrationRepository)
      .overrideProvider(getRepositoryToken(User))
      .useValue(mockUserRepository)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    eventRepository = moduleFixture.get<Repository<Event>>(getRepositoryToken(Event));
    registrationRepository = moduleFixture.get<Repository<Registration>>(getRepositoryToken(Registration));
    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /events/:eventId/statistics', () => {
    it('should return event statistics for valid event', async () => {
      // Arrange
      (eventRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockEvent) // For access check
        .mockResolvedValueOnce(mockEvent); // For statistics

      (registrationRepository.count as jest.Mock)
        .mockResolvedValueOnce(100) // Total registrations
        .mockResolvedValueOnce(75); // Checked in count

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/v1/events/${mockEvent.id}/statistics`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Assert
      expect(response.body).toEqual({
        eventId: mockEvent.id,
        totalRegistrations: 100,
        checkedInCount: 75,
        attendanceRate: 75.0,
        lastUpdated: expect.any(String),
      });

      expect(eventRepository.findOne).toHaveBeenCalledTimes(2);
      expect(registrationRepository.count).toHaveBeenCalledTimes(2);
    });

    it('should return 401 without authentication', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/events/${mockEvent.id}/statistics`)
        .expect(401);
    });

    it('should return 404 for non-existent event', async () => {
      // Arrange
      (eventRepository.findOne as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/v1/events/non-existent-id/statistics')
        .set('Authorization', 'Bearer mock-token')
        .expect(404);
    });

    it('should handle zero registrations correctly', async () => {
      // Arrange
      (eventRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce(mockEvent);

      (registrationRepository.count as jest.Mock)
        .mockResolvedValueOnce(0) // Total registrations
        .mockResolvedValueOnce(0); // Checked in count

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/v1/events/${mockEvent.id}/statistics`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Assert
      expect(response.body.attendanceRate).toBe(0);
    });

    it('should calculate partial attendance correctly', async () => {
      // Arrange
      (eventRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce(mockEvent);

      (registrationRepository.count as jest.Mock)
        .mockResolvedValueOnce(150) // Total registrations
        .mockResolvedValueOnce(45); // Checked in count

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/v1/events/${mockEvent.id}/statistics`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Assert
      expect(response.body.attendanceRate).toBe(30.0); // 45/150 * 100
    });
  });

  describe('Statistics Data Validation', () => {
    it('should have correct registration count query parameters', async () => {
      // Arrange
      (eventRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce(mockEvent);

      (registrationRepository.count as jest.Mock)
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(75);

      // Act
      await request(app.getHttpServer())
        .get(`/api/v1/events/${mockEvent.id}/statistics`)
        .set('Authorization', 'Bearer mock-token')
        .expect(200);

      // Assert
      expect(registrationRepository.count).toHaveBeenNthCalledWith(1, {
        where: {
          eventId: mockEvent.id,
          status: ['paid', 'checkedIn']
        }
      });

      expect(registrationRepository.count).toHaveBeenNthCalledWith(2, {
        where: {
          eventId: mockEvent.id,
          status: 'checkedIn'
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      (eventRepository.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/api/v1/events/${mockEvent.id}/statistics`)
        .set('Authorization', 'Bearer mock-token')
        .expect(500);
    });
  });
});