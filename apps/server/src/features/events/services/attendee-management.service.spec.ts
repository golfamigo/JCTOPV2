import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AttendeeManagementService } from './attendee-management.service';
import { Registration } from '../../registrations/entities/registration.entity';
import { User } from '../../../entities/user.entity';
import { Event } from '../../../entities/event.entity';

describe('AttendeeManagementService', () => {
  let service: AttendeeManagementService;
  let registrationRepository: jest.Mocked<Repository<Registration>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let eventRepository: jest.Mocked<Repository<Event>>;

  const mockEvent = {
    id: 'event-1',
    organizerId: 'organizer-1',
    title: 'Test Event',
    description: 'Test event description',
    startDate: new Date(),
    endDate: new Date(),
    location: 'Test Location',
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Event;

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    authProvider: 'email',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockRegistration = {
    id: 'reg-1',
    userId: 'user-1',
    eventId: 'event-1',
    status: 'paid',
    paymentStatus: 'completed',
    totalAmount: 100,
    discountAmount: 10,
    finalAmount: 90,
    customFieldValues: { dietaryRestrictions: 'Vegetarian' },
    ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 1, price: 100 }],
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    event: mockEvent,
  } as unknown as Registration & { user: User };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendeeManagementService,
        {
          provide: getRepositoryToken(Registration),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Event),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttendeeManagementService>(AttendeeManagementService);
    registrationRepository = module.get(getRepositoryToken(Registration));
    userRepository = module.get(getRepositoryToken(User));
    eventRepository = module.get(getRepositoryToken(Event));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEventAttendees', () => {
    it('should return paginated attendees for valid organizer', async () => {
      const queryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockRegistration], 1]),
      };

      eventRepository.findOne.mockResolvedValue(mockEvent);
      registrationRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getEventAttendees('event-1', 'organizer-1', {
        page: 1,
        limit: 20,
      });

      expect(eventRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'event-1', organizerId: 'organizer-1' }
      });
      expect(result.attendees).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      eventRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getEventAttendees('event-1', 'organizer-1', {})
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for unauthorized organizer', async () => {
      eventRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getEventAttendees('event-1', 'wrong-organizer', {})
      ).rejects.toThrow(NotFoundException);
    });

    it('should apply status filter', async () => {
      const queryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      eventRepository.findOne.mockResolvedValue(mockEvent);
      registrationRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.getEventAttendees('event-1', 'organizer-1', {
        status: 'paid',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'registration.status = :status',
        { status: 'paid' }
      );
    });

    it('should apply search filter', async () => {
      const queryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      eventRepository.findOne.mockResolvedValue(mockEvent);
      registrationRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      await service.getEventAttendees('event-1', 'organizer-1', {
        search: 'john',
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: '%john%' }
      );
    });
  });

  describe('getAllEventAttendees', () => {
    it('should return all attendees without pagination', async () => {
      const queryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockRegistration]),
      };

      eventRepository.findOne.mockResolvedValue(mockEvent);
      registrationRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.getAllEventAttendees('event-1', 'organizer-1', {});

      expect(result).toHaveLength(1);
      expect(result[0].userName).toBe('John Doe');
      expect(result[0].userEmail).toBe('john@example.com');
    });
  });

  describe('getEventForExport', () => {
    it('should return event for valid organizer', async () => {
      eventRepository.findOne.mockResolvedValue(mockEvent);

      const result = await service.getEventForExport('event-1', 'organizer-1');

      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException for invalid event', async () => {
      eventRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getEventForExport('event-1', 'organizer-1')
      ).rejects.toThrow(NotFoundException);
    });
  });
});