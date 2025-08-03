import { Test, TestingModule } from '@nestjs/testing';
import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';
import { EventResponseDto } from '../events/dto';

describe('OrganizerController', () => {
  let controller: OrganizerController;
  let organizerService: jest.Mocked<OrganizerService>;

  const mockUser = { id: 'test-organizer-id' };
  const mockEvents = [
    new EventResponseDto({
      id: 'event-1',
      title: 'Event 1',
      organizerId: mockUser.id,
      status: 'published',
    } as any),
    new EventResponseDto({
      id: 'event-2',
      title: 'Event 2',
      organizerId: mockUser.id,
      status: 'draft',
    } as any),
  ];

  beforeEach(async () => {
    const mockOrganizerService = {
      getOrganizerEvents: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizerController],
      providers: [
        { provide: OrganizerService, useValue: mockOrganizerService },
      ],
    }).compile();

    controller = module.get<OrganizerController>(OrganizerController);
    organizerService = module.get(OrganizerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrganizerEvents', () => {
    it('should return events for the authenticated organizer', async () => {
      // Arrange
      const mockRequest = { user: mockUser };
      organizerService.getOrganizerEvents.mockResolvedValue(mockEvents);

      // Act
      const result = await controller.getOrganizerEvents(mockRequest);

      // Assert
      expect(result).toBe(mockEvents);
      expect(organizerService.getOrganizerEvents).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return empty array when organizer has no events', async () => {
      // Arrange
      const mockRequest = { user: mockUser };
      organizerService.getOrganizerEvents.mockResolvedValue([]);

      // Act
      const result = await controller.getOrganizerEvents(mockRequest);

      // Assert
      expect(result).toEqual([]);
      expect(organizerService.getOrganizerEvents).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const mockRequest = { user: mockUser };
      const serviceError = new Error('Service unavailable');
      organizerService.getOrganizerEvents.mockRejectedValue(serviceError);

      // Act & Assert
      await expect(controller.getOrganizerEvents(mockRequest))
        .rejects.toThrow('Service unavailable');

      expect(organizerService.getOrganizerEvents).toHaveBeenCalledWith(mockUser.id);
    });
  });
});