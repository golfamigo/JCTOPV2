import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '../../entities/event.entity';
import { TicketType } from '../../entities/ticket-type.entity';
import { SeatingZone } from '../../entities/seating-zone.entity';
import { Category } from '../../entities/category.entity';
import { Venue } from '../../entities/venue.entity';
import { DiscountCode } from '../../entities/discount-code.entity';
import { CustomRegistrationField } from '../../entities/custom-registration-field.entity';
import { CreateEventDto, CreateTicketTypeDto, UpdateTicketTypeDto, CreateSeatingZoneDto, CreateDiscountCodeDto, UpdateDiscountCodeDto, CreateCustomFieldDto, UpdateCustomFieldDto } from './dto';

describe('EventsService', () => {
  let service: EventsService;
  let repository: Repository<Event>;
  let ticketTypeRepository: Repository<TicketType>;
  let seatingZoneRepository: Repository<SeatingZone>;
  let categoryRepository: Repository<Category>;
  let venueRepository: Repository<Venue>;
  let discountCodeRepository: Repository<DiscountCode>;
  let customRegistrationFieldRepository: Repository<CustomRegistrationField>;

  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';
  const mockEventId = '123e4567-e89b-12d3-a456-426614174000';
  const mockTicketTypeId = '123e4567-e89b-12d3-a456-426614174004';
  const mockSeatingZoneId = '123e4567-e89b-12d3-a456-426614174005';
  const mockCustomFieldId = '123e4567-e89b-12d3-a456-426614174006';

  const mockEvent: Event = {
    id: mockEventId,
    organizerId: mockUserId,
    categoryId: '123e4567-e89b-12d3-a456-426614174002',
    venueId: '123e4567-e89b-12d3-a456-426614174003',
    title: 'Test Event',
    description: 'Test Description',
    startDate: new Date('2024-12-01T10:00:00Z'),
    endDate: new Date('2024-12-01T18:00:00Z'),
    location: 'Test Location',
    status: 'draft',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    organizer: null,
    category: null,
    venue: null,
    ticketTypes: [],
    seatingZones: [],
    customRegistrationFields: [],
  };

  const mockTicketType: TicketType = {
    id: mockTicketTypeId,
    eventId: mockEventId,
    name: 'General Admission',
    price: 49.99,
    quantity: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    event: mockEvent,
  };

  const mockSeatingZone: SeatingZone = {
    id: mockSeatingZoneId,
    eventId: mockEventId,
    name: 'VIP Section',
    capacity: 50,
    description: 'Premium seating area',
    createdAt: new Date(),
    updatedAt: new Date(),
    event: mockEvent,
  };

  const mockEventRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  };

  const mockTicketTypeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockSeatingZoneRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockCustomField: CustomRegistrationField = {
    id: mockCustomFieldId,
    eventId: mockEventId,
    fieldName: 'full_name',
    fieldType: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    options: null,
    validationRules: {
      minLength: 2,
      maxLength: 50,
    },
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    event: mockEvent,
  };

  const mockVenueRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDiscountCodeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    increment: jest.fn(),
  };

  const mockCustomRegistrationFieldRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: mockEventRepository,
        },
        {
          provide: getRepositoryToken(TicketType),
          useValue: mockTicketTypeRepository,
        },
        {
          provide: getRepositoryToken(SeatingZone),
          useValue: mockSeatingZoneRepository,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(Venue),
          useValue: mockVenueRepository,
        },
        {
          provide: getRepositoryToken(DiscountCode),
          useValue: mockDiscountCodeRepository,
        },
        {
          provide: getRepositoryToken(CustomRegistrationField),
          useValue: mockCustomRegistrationFieldRepository,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repository = module.get<Repository<Event>>(getRepositoryToken(Event));
    ticketTypeRepository = module.get<Repository<TicketType>>(getRepositoryToken(TicketType));
    seatingZoneRepository = module.get<Repository<SeatingZone>>(getRepositoryToken(SeatingZone));
    categoryRepository = module.get<Repository<Category>>(getRepositoryToken(Category));
    venueRepository = module.get<Repository<Venue>>(getRepositoryToken(Venue));
    discountCodeRepository = module.get<Repository<DiscountCode>>(getRepositoryToken(DiscountCode));
    customRegistrationFieldRepository = module.get<Repository<CustomRegistrationField>>(getRepositoryToken(CustomRegistrationField));
    // repository is available for potential future use in tests
    expect(repository).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Test Description',
      startDate: '2024-12-01T10:00:00Z',
      endDate: '2024-12-01T18:00:00Z',
      location: 'Test Location',
      categoryId: '123e4567-e89b-12d3-a456-426614174002',
      venueId: '123e4567-e89b-12d3-a456-426614174003',
    };

    const organizerId = '123e4567-e89b-12d3-a456-426614174001';

    it('should create and return an event', async () => {
      const expectedEventData = {
        ...createEventDto,
        organizerId,
        status: 'draft',
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
      };

      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto, organizerId);

      expect(mockEventRepository.create).toHaveBeenCalledWith(expectedEventData);
      expect(mockEventRepository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it('should set status to draft by default', async () => {
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);

      await service.create(createEventDto, organizerId);

      expect(mockEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'draft',
        }),
      );
    });

    it('should set organizerId from parameter', async () => {
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);

      await service.create(createEventDto, organizerId);

      expect(mockEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          organizerId,
        }),
      );
    });

    it('should convert date strings to Date objects', async () => {
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);

      await service.create(createEventDto, organizerId);

      expect(mockEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: new Date(createEventDto.startDate),
          endDate: new Date(createEventDto.endDate),
        }),
      );
    });

    it('should handle repository errors', async () => {
      const errorMessage = 'Database connection failed';
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockRejectedValue(new Error(errorMessage));

      await expect(service.create(createEventDto, organizerId)).rejects.toThrow(
        errorMessage,
      );

      expect(mockEventRepository.create).toHaveBeenCalled();
      expect(mockEventRepository.save).toHaveBeenCalled();
    });

    it('should preserve all DTO properties', async () => {
      mockEventRepository.create.mockReturnValue(mockEvent);
      mockEventRepository.save.mockResolvedValue(mockEvent);

      await service.create(createEventDto, organizerId);

      expect(mockEventRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createEventDto.title,
          description: createEventDto.description,
          location: createEventDto.location,
          categoryId: createEventDto.categoryId,
          venueId: createEventDto.venueId,
        }),
      );
    });
  });

  describe('Ticket Type Management', () => {
    describe('createTicketType', () => {
      const createTicketTypeDto: CreateTicketTypeDto = {
        name: 'General Admission',
        price: 49.99,
        quantity: 100,
      };

      it('should create a ticket type successfully', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockTicketTypeRepository.create.mockReturnValue(mockTicketType);
        mockTicketTypeRepository.save.mockResolvedValue(mockTicketType);

        const result = await service.createTicketType(mockEventId, createTicketTypeDto, mockUserId);

        expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
        expect(mockTicketTypeRepository.create).toHaveBeenCalledWith({
          ...createTicketTypeDto,
          eventId: mockEventId,
        });
        expect(mockTicketTypeRepository.save).toHaveBeenCalledWith(mockTicketType);
        expect(result).toEqual(mockTicketType);
      });

      it('should throw NotFoundException when event not found', async () => {
        mockEventRepository.findOne.mockResolvedValue(null);

        await expect(
          service.createTicketType(mockEventId, createTicketTypeDto, mockUserId)
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException when user is not organizer', async () => {
        const differentUserId = 'different-user-id';
        mockEventRepository.findOne.mockResolvedValue(mockEvent);

        await expect(
          service.createTicketType(mockEventId, createTicketTypeDto, differentUserId)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('updateTicketType', () => {
      const updateTicketTypeDto: UpdateTicketTypeDto = {
        name: 'VIP Admission',
        price: 99.99,
      };

      it('should update a ticket type successfully', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockTicketTypeRepository.findOne.mockResolvedValue(mockTicketType);
        mockTicketTypeRepository.save.mockResolvedValue({ ...mockTicketType, ...updateTicketTypeDto });

        const result = await service.updateTicketType(
          mockEventId,
          mockTicketTypeId,
          updateTicketTypeDto,
          mockUserId
        );

        expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
        expect(mockTicketTypeRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockTicketTypeId, eventId: mockEventId },
        });
        expect(mockTicketTypeRepository.save).toHaveBeenCalled();
        expect(result.name).toBe(updateTicketTypeDto.name);
        expect(result.price).toBe(updateTicketTypeDto.price);
      });

      it('should throw NotFoundException when ticket type not found', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockTicketTypeRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateTicketType(mockEventId, mockTicketTypeId, updateTicketTypeDto, mockUserId)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteTicketType', () => {
      it('should delete a ticket type successfully', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockTicketTypeRepository.findOne.mockResolvedValue(mockTicketType);
        mockTicketTypeRepository.remove.mockResolvedValue(undefined);

        await service.deleteTicketType(mockEventId, mockTicketTypeId, mockUserId);

        expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
        expect(mockTicketTypeRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockTicketTypeId, eventId: mockEventId },
        });
        expect(mockTicketTypeRepository.remove).toHaveBeenCalledWith(mockTicketType);
      });

      it('should throw NotFoundException when ticket type not found', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockTicketTypeRepository.findOne.mockResolvedValue(null);

        await expect(
          service.deleteTicketType(mockEventId, mockTicketTypeId, mockUserId)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('getTicketTypes', () => {
      it('should get ticket types successfully', async () => {
        const mockTicketTypes = [mockTicketType];
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockTicketTypeRepository.find.mockResolvedValue(mockTicketTypes);

        const result = await service.getTicketTypes(mockEventId, mockUserId);

        expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
        expect(mockTicketTypeRepository.find).toHaveBeenCalledWith({
          where: { eventId: mockEventId },
          order: { name: 'ASC' },
        });
        expect(result).toEqual(mockTicketTypes);
      });

      it('should throw NotFoundException when event not found', async () => {
        mockEventRepository.findOne.mockResolvedValue(null);

        await expect(service.getTicketTypes(mockEventId, mockUserId)).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Seating Zone Management', () => {
    describe('createSeatingZone', () => {
      const createSeatingZoneDto: CreateSeatingZoneDto = {
        name: 'VIP Section',
        capacity: 50,
        description: 'Premium seating area',
      };

      it('should create a seating zone successfully', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockSeatingZoneRepository.create.mockReturnValue(mockSeatingZone);
        mockSeatingZoneRepository.save.mockResolvedValue(mockSeatingZone);

        const result = await service.createSeatingZone(mockEventId, createSeatingZoneDto, mockUserId);

        expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
        expect(mockSeatingZoneRepository.create).toHaveBeenCalledWith({
          ...createSeatingZoneDto,
          eventId: mockEventId,
        });
        expect(mockSeatingZoneRepository.save).toHaveBeenCalledWith(mockSeatingZone);
        expect(result).toEqual(mockSeatingZone);
      });

      it('should throw NotFoundException when event not found', async () => {
        mockEventRepository.findOne.mockResolvedValue(null);

        await expect(
          service.createSeatingZone(mockEventId, createSeatingZoneDto, mockUserId)
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw ForbiddenException when user is not organizer', async () => {
        const differentUserId = 'different-user-id';
        mockEventRepository.findOne.mockResolvedValue(mockEvent);

        await expect(
          service.createSeatingZone(mockEventId, createSeatingZoneDto, differentUserId)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('updateSeatingZone', () => {
      const updateSeatingZoneDto: CreateSeatingZoneDto = {
        name: 'Premium VIP Section',
        capacity: 75,
        description: 'Updated premium seating area',
      };

      it('should update a seating zone successfully', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockSeatingZoneRepository.findOne.mockResolvedValue(mockSeatingZone);
        mockSeatingZoneRepository.save.mockResolvedValue({ ...mockSeatingZone, ...updateSeatingZoneDto });

        const result = await service.updateSeatingZone(
          mockEventId,
          mockSeatingZoneId,
          updateSeatingZoneDto,
          mockUserId
        );

        expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
        expect(mockSeatingZoneRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockSeatingZoneId, eventId: mockEventId },
        });
        expect(mockSeatingZoneRepository.save).toHaveBeenCalled();
        expect(result.name).toBe(updateSeatingZoneDto.name);
        expect(result.capacity).toBe(updateSeatingZoneDto.capacity);
      });

      it('should throw NotFoundException when seating zone not found', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockSeatingZoneRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateSeatingZone(mockEventId, mockSeatingZoneId, updateSeatingZoneDto, mockUserId)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteSeatingZone', () => {
      it('should delete a seating zone successfully', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockSeatingZoneRepository.findOne.mockResolvedValue(mockSeatingZone);
        mockSeatingZoneRepository.remove.mockResolvedValue(undefined);

        await service.deleteSeatingZone(mockEventId, mockSeatingZoneId, mockUserId);

        expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
        expect(mockSeatingZoneRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockSeatingZoneId, eventId: mockEventId },
        });
        expect(mockSeatingZoneRepository.remove).toHaveBeenCalledWith(mockSeatingZone);
      });

      it('should throw NotFoundException when seating zone not found', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockSeatingZoneRepository.findOne.mockResolvedValue(null);

        await expect(
          service.deleteSeatingZone(mockEventId, mockSeatingZoneId, mockUserId)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('getSeatingZones', () => {
      it('should get seating zones successfully', async () => {
        const mockSeatingZones = [mockSeatingZone];
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockSeatingZoneRepository.find.mockResolvedValue(mockSeatingZones);

        const result = await service.getSeatingZones(mockEventId, mockUserId);

        expect(mockEventRepository.findOne).toHaveBeenCalledWith({ where: { id: mockEventId } });
        expect(mockSeatingZoneRepository.find).toHaveBeenCalledWith({
          where: { eventId: mockEventId },
          order: { name: 'ASC' },
        });
        expect(result).toEqual(mockSeatingZones);
      });

      it('should throw NotFoundException when event not found', async () => {
        mockEventRepository.findOne.mockResolvedValue(null);

        await expect(service.getSeatingZones(mockEventId, mockUserId)).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('findPublicEventsPaginated', () => {
    const mockPublishedEvents = [
      { ...mockEvent, id: 'event-1', status: 'published' as const },
      { ...mockEvent, id: 'event-2', status: 'published' as const },
    ];

    it('should return paginated events with default parameters', async () => {
      mockEventRepository.count.mockResolvedValue(2);
      mockEventRepository.find.mockResolvedValue(mockPublishedEvents);

      const result = await service.findPublicEventsPaginated();

      expect(mockEventRepository.count).toHaveBeenCalledWith({
        where: { status: 'published' },
      });
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { status: 'published' },
        relations: ['category', 'venue', 'ticketTypes'],
        order: { startDate: 'ASC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: mockPublishedEvents,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('should return paginated events with custom parameters', async () => {
      mockEventRepository.count.mockResolvedValue(25);
      mockEventRepository.find.mockResolvedValue([mockPublishedEvents[0]]);

      const result = await service.findPublicEventsPaginated(3, 5);

      expect(mockEventRepository.count).toHaveBeenCalledWith({
        where: { status: 'published' },
      });
      expect(mockEventRepository.find).toHaveBeenCalledWith({
        where: { status: 'published' },
        relations: ['category', 'venue', 'ticketTypes'],
        order: { startDate: 'ASC' },
        skip: 10, // (page 3 - 1) * limit 5 = 10
        take: 5,
      });
      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(25);
      expect(result.pagination.totalPages).toBe(5);
    });

    it('should handle invalid page parameter by defaulting to 1', async () => {
      mockEventRepository.count.mockResolvedValue(2);
      mockEventRepository.find.mockResolvedValue(mockPublishedEvents);

      const result = await service.findPublicEventsPaginated(0);

      expect(mockEventRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0, // Should use page 1
        })
      );
      expect(result.pagination.page).toBe(1);
    });

    it('should handle invalid limit parameter by defaulting to 1', async () => {
      mockEventRepository.count.mockResolvedValue(2);
      mockEventRepository.find.mockResolvedValue(mockPublishedEvents);

      const result = await service.findPublicEventsPaginated(1, 0);

      expect(mockEventRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 1, // Should use limit 1
        })
      );
      expect(result.pagination.limit).toBe(1);
    });

    it('should enforce maximum limit of 50', async () => {
      mockEventRepository.count.mockResolvedValue(2);
      mockEventRepository.find.mockResolvedValue(mockPublishedEvents);

      const result = await service.findPublicEventsPaginated(1, 100);

      expect(mockEventRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50, // Should be capped at 50
        })
      );
      expect(result.pagination.limit).toBe(50);
    });

    it('should calculate totalPages correctly', async () => {
      mockEventRepository.count.mockResolvedValue(23);
      mockEventRepository.find.mockResolvedValue(mockPublishedEvents);

      const result = await service.findPublicEventsPaginated(1, 10);

      expect(result.pagination.totalPages).toBe(3); // Math.ceil(23 / 10) = 3
    });

    it('should include relations in the query', async () => {
      mockEventRepository.count.mockResolvedValue(2);
      mockEventRepository.find.mockResolvedValue(mockPublishedEvents);

      await service.findPublicEventsPaginated();

      expect(mockEventRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['category', 'venue', 'ticketTypes'],
        })
      );
    });

    it('should order by startDate ascending', async () => {
      mockEventRepository.count.mockResolvedValue(2);
      mockEventRepository.find.mockResolvedValue(mockPublishedEvents);

      await service.findPublicEventsPaginated();

      expect(mockEventRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { startDate: 'ASC' },
        })
      );
    });

    it('should filter by published status only', async () => {
      mockEventRepository.count.mockResolvedValue(2);
      mockEventRepository.find.mockResolvedValue(mockPublishedEvents);

      await service.findPublicEventsPaginated();

      expect(mockEventRepository.count).toHaveBeenCalledWith({
        where: { status: 'published' },
      });
      expect(mockEventRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'published' },
        })
      );
    });
  });

  describe('Discount Code Management', () => {
    const mockDiscountCode = {
      id: 'code123',
      eventId: mockEventId,
      code: 'SUMMER25',
      type: 'percentage' as const,
      value: 25,
      usageCount: 0,
      expiresAt: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockEventRepository.findOne.mockResolvedValue(mockEvent);
    });

    describe('createDiscountCode', () => {
      const createDto: CreateDiscountCodeDto = {
        code: 'SUMMER25',
        type: 'percentage',
        value: 25,
        expiresAt: '2025-12-31',
      };

      it('should create a new discount code', async () => {
        mockDiscountCodeRepository.findOne.mockResolvedValue(null);
        mockDiscountCodeRepository.create.mockReturnValue(mockDiscountCode);
        mockDiscountCodeRepository.save.mockResolvedValue(mockDiscountCode);

        const result = await service.createDiscountCode(mockEventId, createDto, mockUserId);

        expect(mockDiscountCodeRepository.create).toHaveBeenCalledWith({
          ...createDto,
          eventId: mockEventId,
          expiresAt: new Date('2025-12-31'),
          usageCount: 0,
        });
        expect(mockDiscountCodeRepository.save).toHaveBeenCalledWith(mockDiscountCode);
        expect(result).toEqual(mockDiscountCode);
      });

      it('should throw error if code already exists', async () => {
        mockDiscountCodeRepository.findOne.mockResolvedValue(mockDiscountCode);

        await expect(
          service.createDiscountCode(mockEventId, createDto, mockUserId)
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw error if expiration date is in the past', async () => {
        const pastDateDto = {
          ...createDto,
          expiresAt: '2020-01-01',
        };

        mockDiscountCodeRepository.findOne.mockResolvedValue(null);

        await expect(
          service.createDiscountCode(mockEventId, pastDateDto, mockUserId)
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('getDiscountCodes', () => {
      it('should return discount codes for an event', async () => {
        const mockDiscountCodes = [mockDiscountCode];
        mockDiscountCodeRepository.find.mockResolvedValue(mockDiscountCodes);

        const result = await service.getDiscountCodes(mockEventId, mockUserId);

        expect(mockDiscountCodeRepository.find).toHaveBeenCalledWith({
          where: { eventId: mockEventId },
          order: { createdAt: 'DESC' },
        });
        expect(result).toEqual(mockDiscountCodes);
      });
    });

    describe('updateDiscountCode', () => {
      const updateDto: UpdateDiscountCodeDto = {
        value: 30,
      };

      it('should update a discount code', async () => {
        mockDiscountCodeRepository.findOne.mockImplementation((options) => {
          if (options.where.id === 'code123' && options.where.eventId === mockEventId) {
            return Promise.resolve(mockDiscountCode);
          }
          return Promise.resolve(null);
        });

        const updatedCode = { ...mockDiscountCode, value: 30 };
        mockDiscountCodeRepository.save.mockResolvedValue(updatedCode);

        const result = await service.updateDiscountCode(mockEventId, 'code123', updateDto, mockUserId);

        expect(mockDiscountCodeRepository.save).toHaveBeenCalled();
        expect(result.value).toBe(30);
      });

      it('should throw error if discount code not found', async () => {
        mockDiscountCodeRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateDiscountCode(mockEventId, 'nonexistent', updateDto, mockUserId)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteDiscountCode', () => {
      it('should delete a discount code', async () => {
        mockDiscountCodeRepository.findOne.mockResolvedValue(mockDiscountCode);
        mockDiscountCodeRepository.remove.mockResolvedValue(mockDiscountCode);

        await service.deleteDiscountCode(mockEventId, 'code123', mockUserId);

        expect(mockDiscountCodeRepository.remove).toHaveBeenCalledWith(mockDiscountCode);
      });

      it('should throw error if discount code not found', async () => {
        mockDiscountCodeRepository.findOne.mockResolvedValue(null);

        await expect(
          service.deleteDiscountCode(mockEventId, 'nonexistent', mockUserId)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('applyDiscountCode', () => {
      it('should apply percentage discount correctly', async () => {
        mockDiscountCodeRepository.findOne.mockResolvedValue(mockDiscountCode);
        mockDiscountCodeRepository.increment.mockResolvedValue(undefined);

        const result = await service.applyDiscountCode(mockEventId, 'SUMMER25', 100);

        expect(result.discountedAmount).toBe(75); // 100 - (100 * 25 / 100) = 75
        expect(mockDiscountCodeRepository.increment).toHaveBeenCalledWith(
          { id: 'code123' },
          'usageCount',
          1
        );
      });

      it('should apply fixed amount discount correctly', async () => {
        const fixedDiscount = {
          ...mockDiscountCode,
          type: 'fixed_amount' as const,
          value: 20,
        };
        mockDiscountCodeRepository.findOne.mockResolvedValue(fixedDiscount);
        mockDiscountCodeRepository.increment.mockResolvedValue(undefined);

        const result = await service.applyDiscountCode(mockEventId, 'SUMMER25', 100);

        expect(result.discountedAmount).toBe(80); // 100 - 20 = 80
      });

      it('should not allow negative amount', async () => {
        const fixedDiscount = {
          ...mockDiscountCode,
          type: 'fixed_amount' as const,
          value: 150,
        };
        mockDiscountCodeRepository.findOne.mockResolvedValue(fixedDiscount);
        mockDiscountCodeRepository.increment.mockResolvedValue(undefined);

        const result = await service.applyDiscountCode(mockEventId, 'SUMMER25', 100);

        expect(result.discountedAmount).toBe(0); // Max(0, 100 - 150) = 0
      });

      it('should throw error if discount code not found', async () => {
        mockDiscountCodeRepository.findOne.mockResolvedValue(null);

        await expect(
          service.applyDiscountCode(mockEventId, 'INVALID', 100)
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw error if discount code is expired', async () => {
        const expiredDiscount = {
          ...mockDiscountCode,
          expiresAt: new Date('2020-01-01'),
        };
        mockDiscountCodeRepository.findOne.mockResolvedValue(expiredDiscount);

        await expect(
          service.applyDiscountCode(mockEventId, 'SUMMER25', 100)
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('validateDiscountCode', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should validate a valid discount code successfully', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockDiscountCodeRepository.findOne.mockResolvedValue(mockDiscountCode);

        const result = await service.validateDiscountCode(mockEventId, 'SUMMER25', 100);

        expect(result).toEqual({
          valid: true,
          discountAmount: 25,
          finalAmount: 75,
        });
        expect(mockDiscountCodeRepository.findOne).toHaveBeenCalledWith({
          where: { eventId: mockEventId, code: 'SUMMER25' },
        });
      });

      it('should handle fixed amount discount', async () => {
        const fixedDiscount = {
          ...mockDiscountCode,
          type: 'fixed_amount' as const,
          value: 10,
        };
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockDiscountCodeRepository.findOne.mockResolvedValue(fixedDiscount);

        const result = await service.validateDiscountCode(mockEventId, 'FIXED10', 50);

        expect(result).toEqual({
          valid: true,
          discountAmount: 10,
          finalAmount: 40,
        });
      });

      it('should cap fixed amount discount at total amount', async () => {
        const fixedDiscount = {
          ...mockDiscountCode,
          type: 'fixed_amount' as const,
          value: 100,
        };
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockDiscountCodeRepository.findOne.mockResolvedValue(fixedDiscount);

        const result = await service.validateDiscountCode(mockEventId, 'BIG100', 50);

        expect(result).toEqual({
          valid: true,
          discountAmount: 50,
          finalAmount: 0,
        });
      });

      it('should return invalid for non-existent discount code', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockDiscountCodeRepository.findOne.mockResolvedValue(null);

        const result = await service.validateDiscountCode(mockEventId, 'INVALID', 100);

        expect(result).toEqual({
          valid: false,
          discountAmount: 0,
          finalAmount: 100,
          errorMessage: 'Invalid discount code',
        });
      });

      it('should return invalid for expired discount code', async () => {
        const expiredDiscount = {
          ...mockDiscountCode,
          expiresAt: new Date('2020-01-01'),
        };
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockDiscountCodeRepository.findOne.mockResolvedValue(expiredDiscount);

        const result = await service.validateDiscountCode(mockEventId, 'EXPIRED', 100);

        expect(result).toEqual({
          valid: false,
          discountAmount: 0,
          finalAmount: 100,
          errorMessage: 'Discount code has expired',
        });
      });

      it('should throw NotFoundException for non-existent event', async () => {
        mockEventRepository.findOne.mockResolvedValue(null);

        await expect(
          service.validateDiscountCode('invalid-event', 'CODE', 100)
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Custom Registration Fields', () => {
    describe('getCustomRegistrationFields', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should get custom fields for an event', async () => {
        const fields = [mockCustomField];
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockCustomRegistrationFieldRepository.find.mockResolvedValue(fields);

        const result = await service.getCustomRegistrationFields(mockEventId);

        expect(result).toEqual(fields);
        expect(mockCustomRegistrationFieldRepository.find).toHaveBeenCalledWith({
          where: { eventId: mockEventId },
          order: { order: 'ASC' },
        });
      });

      it('should throw NotFoundException for non-existent event', async () => {
        mockEventRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getCustomRegistrationFields('invalid-event')
        ).rejects.toThrow(NotFoundException);
      });

      it('should return empty array if no custom fields exist', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockCustomRegistrationFieldRepository.find.mockResolvedValue([]);

        const result = await service.getCustomRegistrationFields(mockEventId);

        expect(result).toEqual([]);
      });
    });

    describe('createCustomRegistrationField', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should create a custom field successfully', async () => {
        const createDto: CreateCustomFieldDto = {
          fieldName: 'email',
          fieldType: 'email',
          label: 'Email Address',
          placeholder: 'Enter your email',
          required: true,
          order: 2,
        };

        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockCustomRegistrationFieldRepository.create.mockReturnValue(mockCustomField);
        mockCustomRegistrationFieldRepository.save.mockResolvedValue(mockCustomField);

        const result = await service.createCustomRegistrationField(mockEventId, createDto, mockUserId);

        expect(result).toBe(mockCustomField);
        expect(mockCustomRegistrationFieldRepository.create).toHaveBeenCalledWith({
          ...createDto,
          eventId: mockEventId,
        });
        expect(mockCustomRegistrationFieldRepository.save).toHaveBeenCalledWith(mockCustomField);
      });

      it('should throw ForbiddenException for non-owner', async () => {
        const otherUserId = 'other-user-id';
        const createDto: CreateCustomFieldDto = {
          fieldName: 'test',
          fieldType: 'text',
          label: 'Test',
          required: false,
          order: 1,
        };

        mockEventRepository.findOne.mockResolvedValue(mockEvent);

        await expect(
          service.createCustomRegistrationField(mockEventId, createDto, otherUserId)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('updateCustomRegistrationField', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should update a custom field successfully', async () => {
        const updateDto: UpdateCustomFieldDto = {
          label: 'Updated Label',
          required: false,
        };
        const updatedField = { ...mockCustomField, ...updateDto };

        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockCustomRegistrationFieldRepository.findOne.mockResolvedValue(mockCustomField);
        mockCustomRegistrationFieldRepository.save.mockResolvedValue(updatedField);

        const result = await service.updateCustomRegistrationField(mockEventId, mockCustomFieldId, updateDto, mockUserId);

        expect(result).toBe(updatedField);
        expect(mockCustomRegistrationFieldRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockCustomFieldId, eventId: mockEventId },
        });
        expect(mockCustomRegistrationFieldRepository.save).toHaveBeenCalled();
      });

      it('should throw NotFoundException for non-existent field', async () => {
        const updateDto: UpdateCustomFieldDto = { label: 'Updated' };

        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockCustomRegistrationFieldRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateCustomRegistrationField(mockEventId, 'invalid-field', updateDto, mockUserId)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteCustomRegistrationField', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('should delete a custom field successfully', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockCustomRegistrationFieldRepository.findOne.mockResolvedValue(mockCustomField);
        mockCustomRegistrationFieldRepository.remove.mockResolvedValue(mockCustomField);

        await service.deleteCustomRegistrationField(mockEventId, mockCustomFieldId, mockUserId);

        expect(mockCustomRegistrationFieldRepository.remove).toHaveBeenCalledWith(mockCustomField);
      });

      it('should throw NotFoundException for non-existent field', async () => {
        mockEventRepository.findOne.mockResolvedValue(mockEvent);
        mockCustomRegistrationFieldRepository.findOne.mockResolvedValue(null);

        await expect(
          service.deleteCustomRegistrationField(mockEventId, 'invalid-field', mockUserId)
        ).rejects.toThrow(NotFoundException);
      });
    });
  });
});