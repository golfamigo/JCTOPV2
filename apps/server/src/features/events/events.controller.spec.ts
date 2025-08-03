import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto, CreateTicketTypeDto, UpdateTicketTypeDto, CreateSeatingZoneDto, UpdateEventStatusDto, CreateDiscountCodeDto, UpdateDiscountCodeDto } from './dto';
import { Event } from '../../entities/event.entity';
import { TicketType } from '../../entities/ticket-type.entity';
import { SeatingZone } from '../../entities/seating-zone.entity';
import { DiscountCode } from '../../entities/discount-code.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TicketTypeWithAvailability, TicketSelectionValidationRequest, TicketSelectionValidationResponse } from '@jctop-event/shared-types';
import { AttendeeManagementService } from './services/attendee-management.service';
import { AttendeeExportService } from '../registrations/services/attendee-export.service';
import { CheckInService } from './services/checkin.service';
import { CheckInDto, CheckInResponseDto } from '../registrations/dto/checkin.dto';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;
  let checkInService: CheckInService;

  const mockEvent: Event = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    organizerId: '123e4567-e89b-12d3-a456-426614174001',
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

  const mockEventsService = {
    create: jest.fn(),
    createTicketType: jest.fn(),
    updateTicketType: jest.fn(),
    deleteTicketType: jest.fn(),
    getTicketTypes: jest.fn(),
    createSeatingZone: jest.fn(),
    updateSeatingZone: jest.fn(),
    deleteSeatingZone: jest.fn(),
    getSeatingZones: jest.fn(),
    updateEventStatus: jest.fn(),
    getEventStatusHistory: jest.fn(),
    findPublicEvents: jest.fn(),
    findPublicEventsPaginated: jest.fn(),
    findPublicEventById: jest.fn(),
    findEventByIdForUser: jest.fn(),
    createDiscountCode: jest.fn(),
    getDiscountCodes: jest.fn(),
    updateDiscountCode: jest.fn(),
    deleteDiscountCode: jest.fn(),
    getPublicTicketTypesWithAvailability: jest.fn(),
    validateTicketSelection: jest.fn(),
  };

  const mockAttendeeManagementService = {
    getEventAttendees: jest.fn(),
    getAllEventAttendees: jest.fn(),
    getEventForExport: jest.fn(),
  };

  const mockAttendeeExportService = {
    generateCSV: jest.fn(),
    generateExcel: jest.fn(),
    getFilename: jest.fn(),
    getContentType: jest.fn(),
  };

  const mockCheckInService = {
    checkInAttendee: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
        {
          provide: AttendeeManagementService,
          useValue: mockAttendeeManagementService,
        },
        {
          provide: AttendeeExportService,
          useValue: mockAttendeeExportService,
        },
        {
          provide: CheckInService,
          useValue: mockCheckInService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
    checkInService = module.get<CheckInService>(CheckInService);
    // service is available for potential future use in tests
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should create an event successfully', async () => {
      mockEventsService.create.mockResolvedValue(mockEvent);

      const result = await controller.create(createEventDto, mockRequest);

      expect(mockEventsService.create).toHaveBeenCalledWith(
        createEventDto,
        mockRequest.user.id,
      );
      expect(result).toEqual(expect.objectContaining({
        id: mockEvent.id,
        title: mockEvent.title,
        status: 'draft',
        organizerId: mockRequest.user.id,
      }));
    });

    it('should return EventResponseDto with correct properties', async () => {
      mockEventsService.create.mockResolvedValue(mockEvent);

      const result = await controller.create(createEventDto, mockRequest);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('organizerId');
      expect(result).toHaveProperty('categoryId');
      expect(result).toHaveProperty('venueId');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('startDate');
      expect(result).toHaveProperty('endDate');
      expect(result).toHaveProperty('location');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should handle service errors', async () => {
      const errorMessage = 'Database error';
      mockEventsService.create.mockRejectedValue(new Error(errorMessage));

      await expect(
        controller.create(createEventDto, mockRequest),
      ).rejects.toThrow(errorMessage);

      expect(mockEventsService.create).toHaveBeenCalledWith(
        createEventDto,
        mockRequest.user.id,
      );
    });

    it('should extract organizerId from JWT token', async () => {
      mockEventsService.create.mockResolvedValue(mockEvent);

      await controller.create(createEventDto, mockRequest);

      expect(mockEventsService.create).toHaveBeenCalledWith(
        createEventDto,
        mockRequest.user.id,
      );
    });
  });

  describe('Ticket Type Management', () => {
    const mockEventId = '123e4567-e89b-12d3-a456-426614174000';
    const mockTicketTypeId = '123e4567-e89b-12d3-a456-426614174004';

    const mockTicketType: TicketType = {
      id: mockTicketTypeId,
      eventId: mockEventId,
      name: 'General Admission',
      price: 49.99,
      quantity: 100,
      createdAt: new Date(),
      updatedAt: new Date(),
      event: null,
    };

    describe('createTicketType', () => {
      const createTicketTypeDto: CreateTicketTypeDto = {
        name: 'General Admission',
        price: 49.99,
        quantity: 100,
      };

      it('should create a ticket type successfully', async () => {
        mockEventsService.createTicketType.mockResolvedValue(mockTicketType);

        const result = await controller.createTicketType(mockEventId, createTicketTypeDto, mockRequest);

        expect(mockEventsService.createTicketType).toHaveBeenCalledWith(
          mockEventId,
          createTicketTypeDto,
          mockRequest.user.id
        );
        expect(result).toEqual(mockTicketType);
      });

      it('should handle unauthorized access', async () => {
        mockEventsService.createTicketType.mockRejectedValue(new ForbiddenException('Unauthorized'));

        await expect(
          controller.createTicketType(mockEventId, createTicketTypeDto, mockRequest)
        ).rejects.toThrow(ForbiddenException);
      });

      it('should handle event not found', async () => {
        mockEventsService.createTicketType.mockRejectedValue(new NotFoundException('Event not found'));

        await expect(
          controller.createTicketType(mockEventId, createTicketTypeDto, mockRequest)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('updateTicketType', () => {
      const updateTicketTypeDto: UpdateTicketTypeDto = {
        name: 'VIP Admission',
        price: 99.99,
      };

      const updatedTicketType: TicketType = {
        ...mockTicketType,
        name: 'VIP Admission',
        price: 99.99,
      };

      it('should update a ticket type successfully', async () => {
        mockEventsService.updateTicketType.mockResolvedValue(updatedTicketType);

        const result = await controller.updateTicketType(
          mockEventId,
          mockTicketTypeId,
          updateTicketTypeDto,
          mockRequest
        );

        expect(mockEventsService.updateTicketType).toHaveBeenCalledWith(
          mockEventId,
          mockTicketTypeId,
          updateTicketTypeDto,
          mockRequest.user.id
        );
        expect(result).toEqual(updatedTicketType);
      });

      it('should handle ticket type not found', async () => {
        mockEventsService.updateTicketType.mockRejectedValue(new NotFoundException('Ticket type not found'));

        await expect(
          controller.updateTicketType(mockEventId, mockTicketTypeId, updateTicketTypeDto, mockRequest)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteTicketType', () => {
      it('should delete a ticket type successfully', async () => {
        mockEventsService.deleteTicketType.mockResolvedValue(undefined);

        const result = await controller.deleteTicketType(mockEventId, mockTicketTypeId, mockRequest);

        expect(mockEventsService.deleteTicketType).toHaveBeenCalledWith(
          mockEventId,
          mockTicketTypeId,
          mockRequest.user.id
        );
        expect(result).toBeUndefined();
      });

      it('should handle unauthorized deletion', async () => {
        mockEventsService.deleteTicketType.mockRejectedValue(new ForbiddenException('Unauthorized'));

        await expect(
          controller.deleteTicketType(mockEventId, mockTicketTypeId, mockRequest)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('getTicketTypes', () => {
      const mockTicketTypes = [mockTicketType];

      it('should get ticket types successfully', async () => {
        mockEventsService.getTicketTypes.mockResolvedValue(mockTicketTypes);

        const result = await controller.getTicketTypes(mockEventId, mockRequest);

        expect(mockEventsService.getTicketTypes).toHaveBeenCalledWith(mockEventId, mockRequest.user.id);
        expect(result).toEqual(mockTicketTypes);
      });

      it('should handle event not found', async () => {
        mockEventsService.getTicketTypes.mockRejectedValue(new NotFoundException('Event not found'));

        await expect(controller.getTicketTypes(mockEventId, mockRequest)).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Seating Zone Management', () => {
    const mockEventId = '123e4567-e89b-12d3-a456-426614174000';
    const mockSeatingZoneId = '123e4567-e89b-12d3-a456-426614174005';

    const mockSeatingZone: SeatingZone = {
      id: mockSeatingZoneId,
      eventId: mockEventId,
      name: 'VIP Section',
      capacity: 50,
      description: 'Premium seating area',
      createdAt: new Date(),
      updatedAt: new Date(),
      event: null,
    };

    describe('createSeatingZone', () => {
      const createSeatingZoneDto: CreateSeatingZoneDto = {
        name: 'VIP Section',
        capacity: 50,
        description: 'Premium seating area',
      };

      it('should create a seating zone successfully', async () => {
        mockEventsService.createSeatingZone.mockResolvedValue(mockSeatingZone);

        const result = await controller.createSeatingZone(mockEventId, createSeatingZoneDto, mockRequest);

        expect(mockEventsService.createSeatingZone).toHaveBeenCalledWith(
          mockEventId,
          createSeatingZoneDto,
          mockRequest.user.id
        );
        expect(result).toEqual(mockSeatingZone);
      });

      it('should handle unauthorized access', async () => {
        mockEventsService.createSeatingZone.mockRejectedValue(new ForbiddenException('Unauthorized'));

        await expect(
          controller.createSeatingZone(mockEventId, createSeatingZoneDto, mockRequest)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('updateSeatingZone', () => {
      const updateSeatingZoneDto: CreateSeatingZoneDto = {
        name: 'Premium VIP Section',
        capacity: 75,
        description: 'Updated premium seating area',
      };

      const updatedSeatingZone: SeatingZone = {
        ...mockSeatingZone,
        name: 'Premium VIP Section',
        capacity: 75,
        description: 'Updated premium seating area',
      };

      it('should update a seating zone successfully', async () => {
        mockEventsService.updateSeatingZone.mockResolvedValue(updatedSeatingZone);

        const result = await controller.updateSeatingZone(
          mockEventId,
          mockSeatingZoneId,
          updateSeatingZoneDto,
          mockRequest
        );

        expect(mockEventsService.updateSeatingZone).toHaveBeenCalledWith(
          mockEventId,
          mockSeatingZoneId,
          updateSeatingZoneDto,
          mockRequest.user.id
        );
        expect(result).toEqual(updatedSeatingZone);
      });

      it('should handle seating zone not found', async () => {
        mockEventsService.updateSeatingZone.mockRejectedValue(new NotFoundException('Seating zone not found'));

        await expect(
          controller.updateSeatingZone(mockEventId, mockSeatingZoneId, updateSeatingZoneDto, mockRequest)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteSeatingZone', () => {
      it('should delete a seating zone successfully', async () => {
        mockEventsService.deleteSeatingZone.mockResolvedValue(undefined);

        const result = await controller.deleteSeatingZone(mockEventId, mockSeatingZoneId, mockRequest);

        expect(mockEventsService.deleteSeatingZone).toHaveBeenCalledWith(
          mockEventId,
          mockSeatingZoneId,
          mockRequest.user.id
        );
        expect(result).toBeUndefined();
      });

      it('should handle unauthorized deletion', async () => {
        mockEventsService.deleteSeatingZone.mockRejectedValue(new ForbiddenException('Unauthorized'));

        await expect(
          controller.deleteSeatingZone(mockEventId, mockSeatingZoneId, mockRequest)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('getSeatingZones', () => {
      const mockSeatingZones = [mockSeatingZone];

      it('should get seating zones successfully', async () => {
        mockEventsService.getSeatingZones.mockResolvedValue(mockSeatingZones);

        const result = await controller.getSeatingZones(mockEventId, mockRequest);

        expect(mockEventsService.getSeatingZones).toHaveBeenCalledWith(mockEventId, mockRequest.user.id);
        expect(result).toEqual(mockSeatingZones);
      });

      it('should handle event not found', async () => {
        mockEventsService.getSeatingZones.mockRejectedValue(new NotFoundException('Event not found'));

        await expect(controller.getSeatingZones(mockEventId, mockRequest)).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Status Management', () => {
    describe('updateEventStatus', () => {
      const mockEventId = '123e4567-e89b-12d3-a456-426614174000';

      it('should update event status successfully', async () => {
        const updateDto: UpdateEventStatusDto = { status: 'published' };
        const updatedEvent = { ...mockEvent, status: 'published' };

        mockEventsService.updateEventStatus.mockResolvedValue(updatedEvent);

        const result = await controller.updateEventStatus(mockEventId, updateDto, mockRequest);

        expect(mockEventsService.updateEventStatus).toHaveBeenCalledWith(
          mockEventId,
          'published',
          mockRequest.user.id,
          undefined
        );
        expect(result.status).toBe('published');
      });

      it('should update event status with reason', async () => {
        const updateDto: UpdateEventStatusDto = { 
          status: 'paused', 
          reason: 'Technical maintenance' 
        };
        const updatedEvent = { ...mockEvent, status: 'paused' };

        mockEventsService.updateEventStatus.mockResolvedValue(updatedEvent);

        await controller.updateEventStatus(mockEventId, updateDto, mockRequest);

        expect(mockEventsService.updateEventStatus).toHaveBeenCalledWith(
          mockEventId,
          'paused',
          mockRequest.user.id,
          'Technical maintenance'
        );
      });

      it('should handle invalid status transition', async () => {
        const updateDto: UpdateEventStatusDto = { status: 'ended' };

        mockEventsService.updateEventStatus.mockRejectedValue(
          new BadRequestException("Invalid status transition from 'draft' to 'ended'")
        );

        await expect(
          controller.updateEventStatus(mockEventId, updateDto, mockRequest)
        ).rejects.toThrow(BadRequestException);
      });

      it('should handle unauthorized access', async () => {
        const updateDto: UpdateEventStatusDto = { status: 'published' };

        mockEventsService.updateEventStatus.mockRejectedValue(
          new ForbiddenException('You are not authorized to manage this event')
        );

        await expect(
          controller.updateEventStatus(mockEventId, updateDto, mockRequest)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('getEventStatusHistory', () => {
      const mockEventId = '123e4567-e89b-12d3-a456-426614174000';

      it('should return event status history', async () => {
        const mockHistory = [
          {
            eventId: mockEventId,
            previousStatus: 'draft' as const,
            newStatus: 'published' as const,
            changedBy: mockRequest.user.id,
            changedAt: new Date(),
          },
        ];

        mockEventsService.getEventStatusHistory.mockResolvedValue(mockHistory);

        const result = await controller.getEventStatusHistory(mockEventId, mockRequest);

        expect(mockEventsService.getEventStatusHistory).toHaveBeenCalledWith(
          mockEventId,
          mockRequest.user.id
        );
        expect(result).toEqual(mockHistory);
      });
    });

    describe('getPublicEvents', () => {
      it('should return paginated events with default parameters', async () => {
        const mockPaginatedResponse = {
          data: [
            { ...mockEvent, id: 'event-1', status: 'published' as const },
            { ...mockEvent, id: 'event-2', status: 'published' as const },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        };

        mockEventsService.findPublicEventsPaginated.mockResolvedValue(mockPaginatedResponse);

        const result = await controller.getPublicEvents();

        expect(mockEventsService.findPublicEventsPaginated).toHaveBeenCalledWith(1, 10);
        expect(result).toEqual(mockPaginatedResponse);
        expect(result.data).toHaveLength(2);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
      });

      it('should return paginated events with custom parameters', async () => {
        const mockPaginatedResponse = {
          data: [
            { ...mockEvent, id: 'event-1', status: 'published' as const },
          ],
          pagination: {
            page: 2,
            limit: 5,
            total: 10,
            totalPages: 2,
          },
        };

        mockEventsService.findPublicEventsPaginated.mockResolvedValue(mockPaginatedResponse);

        const result = await controller.getPublicEvents('2', '5');

        expect(mockEventsService.findPublicEventsPaginated).toHaveBeenCalledWith(2, 5);
        expect(result).toEqual(mockPaginatedResponse);
        expect(result.pagination.page).toBe(2);
        expect(result.pagination.limit).toBe(5);
      });

      it('should handle invalid page parameter', async () => {
        await expect(controller.getPublicEvents('invalid', '10')).rejects.toThrow(BadRequestException);
      });

      it('should handle invalid limit parameter', async () => {
        await expect(controller.getPublicEvents('1', 'invalid')).rejects.toThrow(BadRequestException);
      });

      it('should handle negative page parameter', async () => {
        await expect(controller.getPublicEvents('-1', '10')).rejects.toThrow(BadRequestException);
      });

      it('should handle zero limit parameter', async () => {
        await expect(controller.getPublicEvents('1', '0')).rejects.toThrow(BadRequestException);
      });
    });

    describe('getPublicEventsLegacy', () => {
      it('should return only published events (legacy endpoint)', async () => {
        const mockPublicEvents = [
          { ...mockEvent, id: 'event-1', status: 'published' as const },
          { ...mockEvent, id: 'event-2', status: 'published' as const },
        ];

        mockEventsService.findPublicEvents.mockResolvedValue(mockPublicEvents);

        const result = await controller.getPublicEventsLegacy();

        expect(mockEventsService.findPublicEvents).toHaveBeenCalled();
        expect(result).toHaveLength(2);
        expect(result.every(event => event.status === 'published')).toBe(true);
      });
    });

    describe('getPublicEvent', () => {
      const mockEventId = '123e4567-e89b-12d3-a456-426614174000';

      it('should return a specific public event', async () => {
        const mockPublicEvent = { ...mockEvent, status: 'published' as const };

        mockEventsService.findPublicEventById.mockResolvedValue(mockPublicEvent);

        const result = await controller.getPublicEvent(mockEventId);

        expect(mockEventsService.findPublicEventById).toHaveBeenCalledWith(mockEventId);
        expect(result.status).toBe('published');
      });

      it('should handle non-published event', async () => {
        mockEventsService.findPublicEventById.mockRejectedValue(
          new NotFoundException('Event not found or not published')
        );

        await expect(controller.getPublicEvent(mockEventId)).rejects.toThrow(NotFoundException);
      });
    });

    describe('getEvent', () => {
      const mockEventId = '123e4567-e89b-12d3-a456-426614174000';

      it('should return event for authenticated user', async () => {
        const mockUserEvent = { ...mockEvent, status: 'draft' as const };

        mockEventsService.findEventByIdForUser.mockResolvedValue(mockUserEvent);

        const result = await controller.getEvent(mockEventId, mockRequest);

        expect(mockEventsService.findEventByIdForUser).toHaveBeenCalledWith(
          mockEventId,
          mockRequest.user.id
        );
        expect(result.status).toBe('draft');
      });

      it('should handle unauthorized access to non-published event', async () => {
        mockEventsService.findEventByIdForUser.mockRejectedValue(
          new NotFoundException('Event not found or not published')
        );

        await expect(controller.getEvent(mockEventId, mockRequest)).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Discount Code Management', () => {
    const mockDiscountCode: DiscountCode = {
      id: 'code123',
      eventId: '123e4567-e89b-12d3-a456-426614174000',
      code: 'SUMMER25',
      type: 'percentage',
      value: 25,
      usageCount: 0,
      expiresAt: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
      event: mockEvent,
    };

    describe('createDiscountCode', () => {
      it('should create a new discount code', async () => {
        const createDto: CreateDiscountCodeDto = {
          code: 'SUMMER25',
          type: 'percentage',
          value: 25,
          expiresAt: '2025-12-31',
        };

        mockEventsService.createDiscountCode.mockResolvedValue(mockDiscountCode);

        const result = await controller.createDiscountCode(mockEvent.id, createDto, mockRequest);

        expect(service.createDiscountCode).toHaveBeenCalledWith(mockEvent.id, createDto, mockRequest.user.id);
        expect(result).toEqual(mockDiscountCode);
      });

      it('should handle duplicate code error', async () => {
        const createDto: CreateDiscountCodeDto = {
          code: 'DUPLICATE',
          type: 'percentage',
          value: 10,
        };

        mockEventsService.createDiscountCode.mockRejectedValue(
          new BadRequestException('Discount code already exists for this event')
        );

        await expect(
          controller.createDiscountCode(mockEvent.id, createDto, mockRequest)
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('getDiscountCodes', () => {
      it('should return discount codes for an event', async () => {
        const mockDiscountCodes = [mockDiscountCode];
        mockEventsService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);

        const result = await controller.getDiscountCodes(mockEvent.id, mockRequest);

        expect(service.getDiscountCodes).toHaveBeenCalledWith(mockEvent.id, mockRequest.user.id);
        expect(result).toEqual(mockDiscountCodes);
      });

      it('should handle unauthorized access', async () => {
        mockEventsService.getDiscountCodes.mockRejectedValue(
          new ForbiddenException('You are not authorized to manage this event')
        );

        await expect(
          controller.getDiscountCodes(mockEvent.id, mockRequest)
        ).rejects.toThrow(ForbiddenException);
      });
    });

    describe('updateDiscountCode', () => {
      it('should update a discount code', async () => {
        const updateDto: UpdateDiscountCodeDto = {
          value: 30,
        };

        const updatedCode = { ...mockDiscountCode, value: 30 };
        mockEventsService.updateDiscountCode.mockResolvedValue(updatedCode);

        const result = await controller.updateDiscountCode(mockEvent.id, 'code123', updateDto, mockRequest);

        expect(service.updateDiscountCode).toHaveBeenCalledWith(mockEvent.id, 'code123', updateDto, mockRequest.user.id);
        expect(result).toEqual(updatedCode);
      });

      it('should handle not found error', async () => {
        const updateDto: UpdateDiscountCodeDto = {
          value: 30,
        };

        mockEventsService.updateDiscountCode.mockRejectedValue(
          new NotFoundException('Discount code not found')
        );

        await expect(
          controller.updateDiscountCode(mockEvent.id, 'code123', updateDto, mockRequest)
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('deleteDiscountCode', () => {
      it('should delete a discount code', async () => {
        mockEventsService.deleteDiscountCode.mockResolvedValue(undefined);

        await controller.deleteDiscountCode(mockEvent.id, 'code123', mockRequest);

        expect(service.deleteDiscountCode).toHaveBeenCalledWith(mockEvent.id, 'code123', mockRequest.user.id);
      });

      it('should handle not found error', async () => {
        mockEventsService.deleteDiscountCode.mockRejectedValue(
          new NotFoundException('Discount code not found')
        );

        await expect(
          controller.deleteDiscountCode(mockEvent.id, 'code123', mockRequest)
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('Public Ticket Selection Endpoints', () => {
    const mockEventId = 'event-123';
    const mockTicketTypesWithAvailability: TicketTypeWithAvailability[] = [
      {
        id: 'ticket-type-1',
        eventId: mockEventId,
        name: 'General Admission',
        price: 50,
        totalQuantity: 100,
        availableQuantity: 75,
        soldQuantity: 25,
      },
      {
        id: 'ticket-type-2',
        eventId: mockEventId,
        name: 'VIP',
        price: 150,
        totalQuantity: 20,
        availableQuantity: 15,
        soldQuantity: 5,
      },
    ];

    describe('getPublicTicketTypes', () => {
      it('should return ticket types with availability', async () => {
        mockEventsService.getPublicTicketTypesWithAvailability.mockResolvedValue(mockTicketTypesWithAvailability);

        const result = await controller.getPublicTicketTypes(mockEventId);

        expect(mockEventsService.getPublicTicketTypesWithAvailability).toHaveBeenCalledWith(mockEventId);
        expect(result).toEqual(mockTicketTypesWithAvailability);
        expect(result).toHaveLength(2);
        expect(result[0]).toHaveProperty('availableQuantity');
        expect(result[0]).toHaveProperty('soldQuantity');
      });

      it('should handle event not found', async () => {
        mockEventsService.getPublicTicketTypesWithAvailability.mockRejectedValue(
          new NotFoundException('Event not found or not available for registration')
        );

        await expect(controller.getPublicTicketTypes(mockEventId)).rejects.toThrow(NotFoundException);
      });
    });

    describe('validateTicketSelection', () => {
      const validSelections: TicketSelectionValidationRequest = {
        selections: [
          { ticketTypeId: 'ticket-type-1', quantity: 2 },
          { ticketTypeId: 'ticket-type-2', quantity: 1 },
        ],
      };

      it('should validate selection successfully', async () => {
        const mockValidationResponse: TicketSelectionValidationResponse = {
          valid: true,
        };
        mockEventsService.validateTicketSelection.mockResolvedValue(mockValidationResponse);

        const result = await controller.validateTicketSelection(mockEventId, validSelections);

        expect(mockEventsService.validateTicketSelection).toHaveBeenCalledWith(
          mockEventId,
          validSelections.selections
        );
        expect(result).toEqual(mockValidationResponse);
        expect(result.valid).toBe(true);
      });

      it('should return validation errors for invalid selection', async () => {
        const mockValidationResponse: TicketSelectionValidationResponse = {
          valid: false,
          errors: [
            {
              ticketTypeId: 'ticket-type-1',
              message: 'Only 75 tickets available',
            },
          ],
        };
        mockEventsService.validateTicketSelection.mockResolvedValue(mockValidationResponse);

        const invalidSelections: TicketSelectionValidationRequest = {
          selections: [{ ticketTypeId: 'ticket-type-1', quantity: 100 }],
        };

        const result = await controller.validateTicketSelection(mockEventId, invalidSelections);

        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors![0].message).toContain('Only 75 tickets available');
      });

      it('should handle event not found during validation', async () => {
        mockEventsService.validateTicketSelection.mockRejectedValue(
          new NotFoundException('Event not found or not available for registration')
        );

        await expect(
          controller.validateTicketSelection(mockEventId, validSelections)
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('checkInAttendee', () => {
    const mockEventId = '123e4567-e89b-12d3-a456-426614174000';
    const mockQrCode = 'encrypted-qr-data';
    const mockCheckInDto: CheckInDto = {
      qrCode: mockQrCode,
    };

    const mockSuccessResponse: CheckInResponseDto = {
      success: true,
      attendee: {
        name: 'John Doe',
        email: 'john@example.com',
        ticketType: 'VIP Pass',
      },
    };

    const mockErrorResponse: CheckInResponseDto = {
      success: false,
      error: 'This ticket has already been checked in',
      errorCode: 'ALREADY_CHECKED_IN',
    };

    it('should successfully check in an attendee', async () => {
      mockCheckInService.checkInAttendee.mockResolvedValue(mockSuccessResponse);

      const result = await controller.checkInAttendee(mockEventId, mockCheckInDto, mockRequest);

      expect(result).toEqual(mockSuccessResponse);
      expect(mockCheckInService.checkInAttendee).toHaveBeenCalledWith(
        mockEventId,
        mockQrCode,
        mockRequest.user.id
      );
    });

    it('should return error when ticket already checked in', async () => {
      mockCheckInService.checkInAttendee.mockResolvedValue(mockErrorResponse);

      const result = await controller.checkInAttendee(mockEventId, mockCheckInDto, mockRequest);

      expect(result).toEqual(mockErrorResponse);
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('ALREADY_CHECKED_IN');
    });

    it('should return error when ticket not found', async () => {
      const notFoundResponse: CheckInResponseDto = {
        success: false,
        error: 'Ticket not found',
        errorCode: 'TICKET_NOT_FOUND',
      };

      mockCheckInService.checkInAttendee.mockResolvedValue(notFoundResponse);

      const result = await controller.checkInAttendee(mockEventId, mockCheckInDto, mockRequest);

      expect(result).toEqual(notFoundResponse);
      expect(result.errorCode).toBe('TICKET_NOT_FOUND');
    });

    it('should return error for invalid QR code', async () => {
      const invalidQrResponse: CheckInResponseDto = {
        success: false,
        error: 'Invalid QR code',
        errorCode: 'INVALID_QR_CODE',
      };

      mockCheckInService.checkInAttendee.mockResolvedValue(invalidQrResponse);

      const result = await controller.checkInAttendee(mockEventId, mockCheckInDto, mockRequest);

      expect(result).toEqual(invalidQrResponse);
      expect(result.errorCode).toBe('INVALID_QR_CODE');
    });

    it('should pass correct parameters to service', async () => {
      mockCheckInService.checkInAttendee.mockResolvedValue(mockSuccessResponse);

      const differentRequest = { user: { id: 'different-user-id' } };
      await controller.checkInAttendee('different-event-id', { qrCode: 'different-qr' }, differentRequest);

      expect(mockCheckInService.checkInAttendee).toHaveBeenCalledWith(
        'different-event-id',
        'different-qr',
        'different-user-id'
      );
    });
  });
});