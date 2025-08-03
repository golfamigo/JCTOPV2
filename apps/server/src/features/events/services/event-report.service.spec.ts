import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventReportService } from './event-report.service';
import { Event } from '../../../entities/event.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { TicketType } from '../../../entities/ticket-type.entity';

describe('EventReportService', () => {
  let service: EventReportService;
  let eventRepository: Repository<Event>;
  let registrationRepository: Repository<Registration>;
  let ticketTypeRepository: Repository<TicketType>;

  const mockEvent = {
    id: 'event-1',
    organizerId: 'organizer-1',
    title: 'Test Event',
    location: 'Test Location',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-02'),
    status: 'ended',
    createdAt: new Date('2023-12-01'),
    category: { name: 'Test Category' },
    venue: { name: 'Test Venue' },
  };

  const mockTicketTypes = [
    {
      id: 'ticket-1',
      eventId: 'event-1',
      name: 'General Admission',
      price: 50,
    },
    {
      id: 'ticket-2',
      eventId: 'event-1',
      name: 'VIP',
      price: 100,
    },
  ];

  const mockRegistrations = [
    {
      id: 'reg-1',
      userId: 'user-1',
      eventId: 'event-1',
      status: 'paid',
      totalAmount: 50,
      discountAmount: 0,
      finalAmount: 50,
      ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 1, price: 50 }],
      checkedInAt: null,
      createdAt: new Date('2024-01-01'),
      user: { name: 'User 1' },
    },
    {
      id: 'reg-2',
      userId: 'user-2',
      eventId: 'event-1',
      status: 'checkedIn',
      totalAmount: 100,
      discountAmount: 10,
      finalAmount: 90,
      ticketSelections: [{ ticketTypeId: 'ticket-2', quantity: 1, price: 100 }],
      checkedInAt: new Date('2024-01-01T10:00:00'),
      createdAt: new Date('2024-01-01'),
      user: { name: 'User 2' },
    },
    {
      id: 'reg-3',
      userId: 'user-3',
      eventId: 'event-1',
      status: 'cancelled',
      totalAmount: 50,
      discountAmount: 0,
      finalAmount: 50,
      ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 1, price: 50 }],
      checkedInAt: null,
      createdAt: new Date('2024-01-01'),
      user: { name: 'User 3' },
    },
    {
      id: 'reg-4',
      userId: 'user-4',
      eventId: 'event-1',
      status: 'pending',
      totalAmount: 50,
      discountAmount: 0,
      finalAmount: 50,
      ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 1, price: 50 }],
      checkedInAt: null,
      createdAt: new Date('2024-01-01'),
      user: { name: 'User 4' },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventReportService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Registration),
          useValue: {
            find: jest.fn(),
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

    service = module.get<EventReportService>(EventReportService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    registrationRepository = module.get<Repository<Registration>>(getRepositoryToken(Registration));
    ticketTypeRepository = module.get<Repository<TicketType>>(getRepositoryToken(TicketType));
  });

  describe('generateEventReport', () => {
    it('should generate a complete event report', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(registrationRepository, 'find').mockResolvedValue(mockRegistrations as any);
      jest.spyOn(ticketTypeRepository, 'find').mockResolvedValue(mockTicketTypes as any);

      // Act
      const result = await service.generateEventReport('event-1', 'organizer-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.eventId).toBe('event-1');
      expect(result.eventDetails).toEqual(mockEvent);
      
      // Check registration stats
      expect(result.registrationStats.total).toBe(4);
      expect(result.registrationStats.byStatus.paid).toBe(1);
      expect(result.registrationStats.byStatus.checkedIn).toBe(1);
      expect(result.registrationStats.byStatus.cancelled).toBe(1);
      expect(result.registrationStats.byStatus.pending).toBe(1);

      // Check revenue stats
      expect(result.revenue.gross).toBe(150); // 50 + 100 (only paid and checkedIn)
      expect(result.revenue.discountAmount).toBe(10);
      expect(result.revenue.net).toBe(140);

      // Check attendance stats
      expect(result.attendanceStats.registered).toBe(2); // paid + checkedIn
      expect(result.attendanceStats.checkedIn).toBe(1);
      expect(result.attendanceStats.rate).toBe(50); // 1/2 * 100

      // Check ticket type breakdown
      expect(result.registrationStats.byTicketType).toHaveLength(2);
      const generalAdmission = result.registrationStats.byTicketType.find(t => t.ticketTypeName === 'General Admission');
      expect(generalAdmission?.quantitySold).toBe(1);
      expect(generalAdmission?.revenue).toBe(50);

      const vip = result.registrationStats.byTicketType.find(t => t.ticketTypeName === 'VIP');
      expect(vip?.quantitySold).toBe(1);
      expect(vip?.revenue).toBe(100);
    });

    it('should throw NotFoundException when event not found', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.generateEventReport('nonexistent', 'organizer-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when event not owned by organizer', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.generateEventReport('event-1', 'wrong-organizer'))
        .rejects.toThrow(NotFoundException);
    });

    it('should handle events with no registrations', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(registrationRepository, 'find').mockResolvedValue([]);
      jest.spyOn(ticketTypeRepository, 'find').mockResolvedValue(mockTicketTypes as any);

      // Act
      const result = await service.generateEventReport('event-1', 'organizer-1');

      // Assert
      expect(result.registrationStats.total).toBe(0);
      expect(result.revenue.gross).toBe(0);
      expect(result.attendanceStats.registered).toBe(0);
      expect(result.attendanceStats.rate).toBe(0);
      expect(result.timeline).toHaveLength(0);
    });

    it('should calculate attendance rate correctly', async () => {
      // Arrange - Only paid registrations, no check-ins
      const paidOnlyRegistrations = [
        {
          ...mockRegistrations[0],
          status: 'paid',
        },
        {
          ...mockRegistrations[1],
          status: 'paid',
          checkedInAt: null,
        },
      ];

      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(registrationRepository, 'find').mockResolvedValue(paidOnlyRegistrations as any);
      jest.spyOn(ticketTypeRepository, 'find').mockResolvedValue(mockTicketTypes as any);

      // Act
      const result = await service.generateEventReport('event-1', 'organizer-1');

      // Assert
      expect(result.attendanceStats.registered).toBe(2);
      expect(result.attendanceStats.checkedIn).toBe(0);
      expect(result.attendanceStats.rate).toBe(0);
    });

    it('should include last check-in time when available', async () => {
      // Arrange
      const laterCheckIn = new Date('2024-01-01T15:00:00');
      const registrationsWithCheckIn = [
        {
          ...mockRegistrations[1],
          status: 'checkedIn',
          checkedInAt: laterCheckIn,
        },
      ];

      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(registrationRepository, 'find').mockResolvedValue(registrationsWithCheckIn as any);
      jest.spyOn(ticketTypeRepository, 'find').mockResolvedValue(mockTicketTypes as any);

      // Act
      const result = await service.generateEventReport('event-1', 'organizer-1');

      // Assert
      expect(result.attendanceStats.lastCheckInTime).toBe(laterCheckIn.toISOString());
    });

    it('should calculate revenue by ticket type correctly', async () => {
      // Arrange - Multiple registrations for same ticket type
      const multipleRegistrations = [
        {
          ...mockRegistrations[0],
          ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 2, price: 50 }],
          totalAmount: 100,
          finalAmount: 100,
        },
        {
          ...mockRegistrations[1],
          ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 1, price: 50 }],
          totalAmount: 50,
          finalAmount: 50,
        },
      ];

      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(registrationRepository, 'find').mockResolvedValue(multipleRegistrations as any);
      jest.spyOn(ticketTypeRepository, 'find').mockResolvedValue(mockTicketTypes as any);

      // Act
      const result = await service.generateEventReport('event-1', 'organizer-1');

      // Assert
      const generalAdmission = result.registrationStats.byTicketType.find(t => t.ticketTypeName === 'General Admission');
      expect(generalAdmission?.quantitySold).toBe(3); // 2 + 1
      expect(generalAdmission?.revenue).toBe(150); // 2*50 + 1*50
    });
  });
});