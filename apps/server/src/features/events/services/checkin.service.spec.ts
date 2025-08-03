import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckInService } from './checkin.service';
import { Event } from '../../../entities/event.entity';
import { Registration } from '../../registrations/entities/registration.entity';
import { User } from '../../../entities/user.entity';
import { TicketType } from '../../../entities/ticket-type.entity';
import { QrCodeService } from '../../registrations/services/qr-code.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CheckInService', () => {
  let service: CheckInService;
  let eventRepository: Repository<Event>;
  let registrationRepository: Repository<Registration>;
  let userRepository: Repository<User>;
  let ticketTypeRepository: Repository<TicketType>;
  let qrCodeService: QrCodeService;

  const mockEventId = 'event-123';
  const mockOrganizerId = 'organizer-123';
  const mockUserId = 'user-123';
  const mockRegistrationId = 'registration-123';
  const mockTicketTypeId = 'ticket-type-123';

  const mockEvent = {
    id: mockEventId,
    organizerId: mockOrganizerId,
    title: 'Test Event',
  } as Event;

  const mockUser = {
    id: mockUserId,
    name: 'John Doe',
    email: 'john@example.com',
  } as User;

  const mockRegistration = {
    id: mockRegistrationId,
    userId: mockUserId,
    eventId: mockEventId,
    status: 'paid',
    ticketSelections: [
      {
        ticketTypeId: mockTicketTypeId,
        quantity: 1,
        price: 50,
      },
    ],
  } as Registration;

  const mockTicketType = {
    id: mockTicketTypeId,
    name: 'VIP Ticket',
  } as TicketType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckInService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Registration),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
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
            findOne: jest.fn(),
          },
        },
        {
          provide: QrCodeService,
          useValue: {
            decryptRegistrationData: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CheckInService>(CheckInService);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    registrationRepository = module.get<Repository<Registration>>(getRepositoryToken(Registration));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    ticketTypeRepository = module.get<Repository<TicketType>>(getRepositoryToken(TicketType));
    qrCodeService = module.get<QrCodeService>(QrCodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkInAttendee', () => {
    const mockQrCode = 'encrypted-qr-data';
    const mockDecryptedData = {
      registrationId: mockRegistrationId,
      userId: mockUserId,
      eventId: mockEventId,
    };

    it('should successfully check in an attendee', async () => {
      jest.spyOn(eventRepository, 'findOne').mockReturnValue(mockEvent);
      jest.spyOn(qrCodeService, 'decryptRegistrationData').mockReturnValue(mockDecryptedData);
      jest.spyOn(registrationRepository, 'findOne').mockReturnValue(mockRegistration);
      jest.spyOn(userRepository, 'findOne').mockReturnValue(mockUser);
      jest.spyOn(ticketTypeRepository, 'findOne').mockReturnValue(mockTicketType);
      jest.spyOn(registrationRepository, 'save').mockReturnValue({
        ...mockRegistration,
        status: 'checkedIn',
        checkedInAt: new Date(),
      } as Registration);

      const result = await service.checkInAttendee(mockEventId, mockQrCode, mockOrganizerId);

      expect(result).toEqual({
        success: true,
        attendee: {
          name: 'John Doe',
          email: 'john@example.com',
          ticketType: 'VIP Ticket',
        },
      });

      expect(registrationRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'checkedIn',
          checkedInAt: expect.any(Date),
        })
      );
    });

    it('should return error when event not found', async () => {
      jest.spyOn(eventRepository, 'findOne').mockReturnValue(null);

      await expect(
        service.checkInAttendee(mockEventId, mockQrCode, mockOrganizerId)
      ).rejects.toThrow(NotFoundException);
    });

    it('should return error for invalid QR code', async () => {
      jest.spyOn(eventRepository, 'findOne').mockReturnValue(mockEvent);
      jest.spyOn(qrCodeService, 'decryptRegistrationData').mockImplementation(() => { throw new Error('Invalid QR'); })(new Error('Invalid QR'));

      await expect(
        service.checkInAttendee(mockEventId, mockQrCode, mockOrganizerId)
      ).rejects.toThrow(BadRequestException);
    });

    it('should return error for invalid QR data structure', async () => {
      jest.spyOn(eventRepository, 'findOne').mockReturnValue(mockEvent);
      jest.spyOn(qrCodeService, 'decryptRegistrationData').mockReturnValue({
        invalidData: true,
      });

      const result = await service.checkInAttendee(mockEventId, mockQrCode, mockOrganizerId);

      expect(result).toEqual({
        success: false,
        error: 'Invalid QR code format',
        errorCode: 'INVALID_QR_CODE',
      });
    });

    it('should return error when registration not found', async () => {
      jest.spyOn(eventRepository, 'findOne').mockReturnValue(mockEvent);
      jest.spyOn(qrCodeService, 'decryptRegistrationData').mockReturnValue(mockDecryptedData);
      jest.spyOn(registrationRepository, 'findOne').mockReturnValue(null);

      const result = await service.checkInAttendee(mockEventId, mockQrCode, mockOrganizerId);

      expect(result).toEqual({
        success: false,
        error: 'Ticket not found',
        errorCode: 'TICKET_NOT_FOUND',
      });
    });

    it('should return error for already checked in ticket', async () => {
      const checkedInRegistration = {
        ...mockRegistration,
        status: 'checkedIn',
      } as Registration;

      jest.spyOn(eventRepository, 'findOne').mockReturnValue(mockEvent);
      jest.spyOn(qrCodeService, 'decryptRegistrationData').mockReturnValue(mockDecryptedData);
      jest.spyOn(registrationRepository, 'findOne').mockReturnValue(checkedInRegistration);

      const result = await service.checkInAttendee(mockEventId, mockQrCode, mockOrganizerId);

      expect(result).toEqual({
        success: false,
        error: 'This ticket has already been checked in',
        errorCode: 'ALREADY_CHECKED_IN',
      });
    });

    it('should return error for unpaid ticket', async () => {
      const unpaidRegistration = {
        ...mockRegistration,
        status: 'pending',
      } as Registration;

      jest.spyOn(eventRepository, 'findOne').mockReturnValue(mockEvent);
      jest.spyOn(qrCodeService, 'decryptRegistrationData').mockReturnValue(mockDecryptedData);
      jest.spyOn(registrationRepository, 'findOne').mockReturnValue(unpaidRegistration);

      const result = await service.checkInAttendee(mockEventId, mockQrCode, mockOrganizerId);

      expect(result).toEqual({
        success: false,
        error: 'Ticket is not valid for check-in',
        errorCode: 'INVALID_QR_CODE',
      });
    });

    it('should handle missing ticket type gracefully', async () => {
      jest.spyOn(eventRepository, 'findOne').mockReturnValue(mockEvent);
      jest.spyOn(qrCodeService, 'decryptRegistrationData').mockReturnValue(mockDecryptedData);
      jest.spyOn(registrationRepository, 'findOne').mockReturnValue({
        ...mockRegistration,
        ticketSelections: [],
      } as Registration);
      jest.spyOn(userRepository, 'findOne').mockReturnValue(mockUser);
      jest.spyOn(registrationRepository, 'save').mockReturnValue({
        ...mockRegistration,
        status: 'checkedIn',
        checkedInAt: new Date(),
      } as Registration);

      const result = await service.checkInAttendee(mockEventId, mockQrCode, mockOrganizerId);

      expect(result).toEqual({
        success: true,
        attendee: {
          name: 'John Doe',
          email: 'john@example.com',
          ticketType: 'General Admission',
        },
      });
    });
  });
});