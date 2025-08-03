import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { EventStatisticsService } from './services/event-statistics.service';
import { EventStatisticsResponseDto } from './dto/event-statistics.dto';
import { Event } from '../../entities/event.entity';

describe('EventsController - Statistics', () => {
  let controller: EventsController;
  let eventsService: jest.Mocked<EventsService>;
  let eventStatisticsService: jest.Mocked<EventStatisticsService>;

  const mockUser = { id: 'test-user-id' };
  const mockEventId = 'test-event-id';
  const mockEvent = {
    id: mockEventId,
    title: 'Test Event',
    organizerId: mockUser.id,
    description: 'Test Description',
    startDate: new Date(),
    endDate: new Date(),
    location: 'Test Location',
    status: 'published',
    categoryId: 'test-category',
    venueId: 'test-venue',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Event;

  beforeEach(async () => {
    const mockEventsService = {
      findEventByIdForUser: jest.fn(),
    };

    const mockEventStatisticsService = {
      getEventStatistics: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: EventsService, useValue: mockEventsService },
        { provide: EventStatisticsService, useValue: mockEventStatisticsService },
        // Mock other required services
        { provide: 'AttendeeManagementService', useValue: {} },
        { provide: 'AttendeeSearchService', useValue: {} },
        { provide: 'AttendeeExportService', useValue: {} },
        { provide: 'CheckInService', useValue: {} },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    eventsService = module.get(EventsService);
    eventStatisticsService = module.get(EventStatisticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventStatistics', () => {
    it('should return event statistics for authorized organizer', async () => {
      // Arrange
      const mockStatistics = new EventStatisticsResponseDto(mockEventId, 100, 75);
      const mockRequest = { user: mockUser };

      eventsService.findEventByIdForUser.mockResolvedValue(mockEvent);
      eventStatisticsService.getEventStatistics.mockResolvedValue(mockStatistics);

      // Act
      const result = await controller.getEventStatistics(mockEventId, mockRequest);

      // Assert
      expect(result).toBe(mockStatistics);
      expect(eventsService.findEventByIdForUser).toHaveBeenCalledWith(mockEventId, mockUser.id);
      expect(eventStatisticsService.getEventStatistics).toHaveBeenCalledWith(mockEventId);
    });

    it('should throw error if user does not have access to event', async () => {
      // Arrange
      const mockRequest = { user: mockUser };
      const accessError = new Error('Access denied');

      eventsService.findEventByIdForUser.mockRejectedValue(accessError);

      // Act & Assert
      await expect(controller.getEventStatistics(mockEventId, mockRequest))
        .rejects.toThrow('Access denied');

      expect(eventsService.findEventByIdForUser).toHaveBeenCalledWith(mockEventId, mockUser.id);
      expect(eventStatisticsService.getEventStatistics).not.toHaveBeenCalled();
    });

    it('should handle statistics service errors', async () => {
      // Arrange
      const mockRequest = { user: mockUser };
      const statisticsError = new Error('Statistics service unavailable');

      eventsService.findEventByIdForUser.mockResolvedValue(mockEvent);
      eventStatisticsService.getEventStatistics.mockRejectedValue(statisticsError);

      // Act & Assert
      await expect(controller.getEventStatistics(mockEventId, mockRequest))
        .rejects.toThrow('Statistics service unavailable');

      expect(eventsService.findEventByIdForUser).toHaveBeenCalledWith(mockEventId, mockUser.id);
      expect(eventStatisticsService.getEventStatistics).toHaveBeenCalledWith(mockEventId);
    });
  });
});