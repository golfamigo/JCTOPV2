import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStatisticsService } from './event-statistics.service';
import { Registration } from '../../registrations/entities/registration.entity';
import { Event } from '../../../entities/event.entity';
import { EventStatisticsResponseDto } from '../dto/event-statistics.dto';

describe('EventStatisticsService', () => {
  let service: EventStatisticsService;
  let registrationRepository: jest.Mocked<Repository<Registration>>;
  let eventRepository: jest.Mocked<Repository<Event>>;

  const mockEventId = 'test-event-id';
  const mockEvent = {
    id: mockEventId,
    title: 'Test Event',
    organizerId: 'test-organizer-id',
  } as Event;

  beforeEach(async () => {
    const mockRegistrationRepository = {
      count: jest.fn(),
    };

    const mockEventRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventStatisticsService,
        {
          provide: getRepositoryToken(Registration),
          useValue: mockRegistrationRepository,
        },
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
      ],
    }).compile();

    service = module.get<EventStatisticsService>(EventStatisticsService);
    registrationRepository = module.get(getRepositoryToken(Registration));
    eventRepository = module.get(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventStatistics', () => {
    it('should return event statistics successfully', async () => {
      // Arrange
      const totalRegistrations = 100;
      const checkedInCount = 75;
      
      eventRepository.findOne.mockResolvedValue(mockEvent);
      registrationRepository.count
        .mockResolvedValueOnce(totalRegistrations) // total registrations
        .mockResolvedValueOnce(checkedInCount); // checked in count

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result).toBeInstanceOf(EventStatisticsResponseDto);
      expect(result.eventId).toBe(mockEventId);
      expect(result.totalRegistrations).toBe(totalRegistrations);
      expect(result.checkedInCount).toBe(checkedInCount);
      expect(result.attendanceRate).toBe(75.0);
      expect(result.lastUpdated).toBeDefined();

      // Verify repository calls
      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockEventId }
      });
      expect(registrationRepository.count).toHaveBeenCalledTimes(2);
      expect(registrationRepository.count).toHaveBeenNthCalledWith(1, {
        where: {
          eventId: mockEventId,
          status: ['paid', 'checkedIn']
        }
      });
      expect(registrationRepository.count).toHaveBeenNthCalledWith(2, {
        where: {
          eventId: mockEventId,
          status: 'checkedIn'
        }
      });
    });

    it('should calculate correct attendance rate with zero registrations', async () => {
      // Arrange
      eventRepository.findOne.mockResolvedValue(mockEvent);
      registrationRepository.count
        .mockResolvedValueOnce(0) // total registrations
        .mockResolvedValueOnce(0); // checked in count

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.totalRegistrations).toBe(0);
      expect(result.checkedInCount).toBe(0);
      expect(result.attendanceRate).toBe(0);
    });

    it('should calculate correct attendance rate with partial check-ins', async () => {
      // Arrange
      const totalRegistrations = 150;
      const checkedInCount = 45;
      
      eventRepository.findOne.mockResolvedValue(mockEvent);
      registrationRepository.count
        .mockResolvedValueOnce(totalRegistrations)
        .mockResolvedValueOnce(checkedInCount);

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.attendanceRate).toBe(30.0); // 45/150 * 100
    });

    it('should throw error when event not found', async () => {
      // Arrange
      eventRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getEventStatistics(mockEventId))
        .rejects.toThrow('Event not found');
      
      expect(registrationRepository.count).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      eventRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

      // Act & Assert
      await expect(service.getEventStatistics(mockEventId))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('refreshStatistics', () => {
    it('should call getEventStatistics', async () => {
      // Arrange
      const spy = jest.spyOn(service, 'getEventStatistics');
      const mockStats = new EventStatisticsResponseDto(mockEventId, 100, 75);
      spy.mockResolvedValue(mockStats);

      // Act
      const result = await service.refreshStatistics(mockEventId);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockEventId);
      expect(result).toBe(mockStats);
    });
  });
});