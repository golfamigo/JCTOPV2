import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizerService } from './organizer.service';
import { Event } from '../../entities/event.entity';
import { EventResponseDto } from '../events/dto';

describe('OrganizerService', () => {
  let service: OrganizerService;
  let eventRepository: jest.Mocked<Repository<Event>>;

  const mockOrganizerId = 'test-organizer-id';
  const mockEvents = [
    {
      id: 'event-1',
      title: 'Event 1',
      organizerId: mockOrganizerId,
      status: 'published',
      createdAt: new Date('2024-01-01'),
      category: { id: 'cat-1', name: 'Category 1' },
      venue: { id: 'venue-1', name: 'Venue 1' },
    },
    {
      id: 'event-2',
      title: 'Event 2',
      organizerId: mockOrganizerId,
      status: 'draft',
      createdAt: new Date('2024-01-02'),
      category: { id: 'cat-2', name: 'Category 2' },
      venue: { id: 'venue-2', name: 'Venue 2' },
    },
  ] as Event[];

  beforeEach(async () => {
    const mockEventRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizerService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
      ],
    }).compile();

    service = module.get<OrganizerService>(OrganizerService);
    eventRepository = module.get(getRepositoryToken(Event));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrganizerEvents', () => {
    it('should return events for the organizer ordered by creation date', async () => {
      // Arrange
      eventRepository.find.mockResolvedValue(mockEvents);

      // Act
      const result = await service.getOrganizerEvents(mockOrganizerId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(EventResponseDto);
      expect(result[0].id).toBe('event-1');
      expect(result[1].id).toBe('event-2');

      expect(eventRepository.find).toHaveBeenCalledWith({
        where: { organizerId: mockOrganizerId },
        relations: ['category', 'venue'],
        order: { createdAt: 'DESC' }
      });
    });

    it('should return empty array when organizer has no events', async () => {
      // Arrange
      eventRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.getOrganizerEvents(mockOrganizerId);

      // Assert
      expect(result).toEqual([]);
      expect(eventRepository.find).toHaveBeenCalledWith({
        where: { organizerId: mockOrganizerId },
        relations: ['category', 'venue'],
        order: { createdAt: 'DESC' }
      });
    });

    it('should handle database errors gracefully', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      eventRepository.find.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.getOrganizerEvents(mockOrganizerId))
        .rejects.toThrow('Database connection failed');

      expect(eventRepository.find).toHaveBeenCalledWith({
        where: { organizerId: mockOrganizerId },
        relations: ['category', 'venue'],
        order: { createdAt: 'DESC' }
      });
    });
  });
});