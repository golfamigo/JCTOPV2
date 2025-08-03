import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AttendeeSearchService } from './attendee-search.service';
import { Event } from '../../../entities/event.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { User } from '../../../entities/user.entity';
import { TicketType } from '../../../entities/ticket-type.entity';
import { AttendeeSearchQueryDto } from '../dto/attendee-search.dto';

describe('AttendeeSearchService', () => {
  let service: AttendeeSearchService;
  let eventRepository: jest.Mocked<Repository<Event>>;
  let registrationRepository: jest.Mocked<Repository<Registration>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let ticketTypeRepository: jest.Mocked<Repository<TicketType>>;

  const mockQueryBuilder = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    clone: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendeeSearchService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Registration),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TicketType),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttendeeSearchService>(AttendeeSearchService);
    eventRepository = module.get(getRepositoryToken(Event));
    registrationRepository = module.get(getRepositoryToken(Registration));
    userRepository = module.get(getRepositoryToken(User));
    ticketTypeRepository = module.get(getRepositoryToken(TicketType));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchAttendees', () => {
    const eventId = 'event-123';
    const organizerId = 'organizer-123';
    const searchQuery: AttendeeSearchQueryDto = {
      query: 'John',
      limit: 20,
      offset: 0,
    };

    const mockEvent = {
      id: eventId,
      organizerId,
      title: 'Test Event',
    };

    const mockRegistrations = [
      {
        id: 'reg-1',
        eventId,
        status: 'paid',
        checkedInAt: null,
        ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 1, price: 50 }],
        user: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      {
        id: 'reg-2',
        eventId,
        status: 'checkedIn',
        checkedInAt: new Date(),
        ticketSelections: [{ ticketTypeId: 'ticket-2', quantity: 1, price: 100 }],
        user: {
          id: 'user-2',
          name: 'John Smith',
          email: 'johnsmith@example.com',
        },
      },
    ];

    const mockTicketTypes = [
      { 
        id: 'ticket-1', 
        name: 'General Admission',
        eventId: 'event-123',
        price: 50,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        event: null
      },
      { 
        id: 'ticket-2', 
        name: 'VIP',
        eventId: 'event-123',
        price: 100,
        quantity: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        event: null
      },
    ];

    it('should return search results for valid query', async () => {
      eventRepository.findOne.mockResolvedValue(mockEvent as any);
      mockQueryBuilder.getCount.mockResolvedValue(2);
      mockQueryBuilder.getMany.mockResolvedValue(mockRegistrations);
      ticketTypeRepository.find.mockResolvedValue(mockTicketTypes as any);

      const result = await service.searchAttendees(eventId, organizerId, searchQuery);

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId, organizerId },
      });
      expect(result.attendees).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.offset).toBe(0);
      expect(result.attendees[0].name).toBe('John Doe');
      expect(result.attendees[1].name).toBe('John Smith');
      expect(result.attendees[0].ticketType).toBe('General Admission');
      expect(result.attendees[1].ticketType).toBe('VIP');
    });

    it('should throw NotFoundException if event not found', async () => {
      eventRepository.findOne.mockResolvedValue(null);

      await expect(
        service.searchAttendees(eventId, organizerId, searchQuery)
      ).rejects.toThrow(NotFoundException);
    });

    it('should apply search term correctly', async () => {
      eventRepository.findOne.mockResolvedValue(mockEvent as any);
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);
      ticketTypeRepository.find.mockResolvedValue([]);

      await service.searchAttendees(eventId, organizerId, searchQuery);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(user.name) LIKE :searchTerm'),
        { searchTerm: '%john%' }
      );
    });

    it('should apply pagination correctly', async () => {
      const paginatedQuery = { ...searchQuery, limit: 10, offset: 20 };
      eventRepository.findOne.mockResolvedValue(mockEvent as any);
      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getMany.mockResolvedValue([mockRegistrations[0]]);
      ticketTypeRepository.find.mockResolvedValue([mockTicketTypes[0]] as any);

      await service.searchAttendees(eventId, organizerId, paginatedQuery);

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('should exclude cancelled registrations', async () => {
      eventRepository.findOne.mockResolvedValue(mockEvent as any);
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);
      ticketTypeRepository.find.mockResolvedValue([]);

      await service.searchAttendees(eventId, organizerId, searchQuery);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'registration.status != :cancelledStatus',
        { cancelledStatus: 'cancelled' }
      );
    });

    it('should order results by user name', async () => {
      eventRepository.findOne.mockResolvedValue(mockEvent as any);
      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getMany.mockResolvedValue([]);
      ticketTypeRepository.find.mockResolvedValue([]);

      await service.searchAttendees(eventId, organizerId, searchQuery);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('user.name', 'ASC');
    });
  });
});