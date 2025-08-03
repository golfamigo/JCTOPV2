import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistrationCompletionService } from './registration-completion.service';
import { Registration } from '../entities/registration.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Event } from '../../../entities/event.entity';
import { User } from '../../../entities/user.entity';
import { QrCodeService } from './qr-code.service';
import { EmailService } from '../../notifications/services/email.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('RegistrationCompletionService', () => {
  let service: RegistrationCompletionService;
  let registrationRepository: Repository<Registration>;
  let paymentRepository: Repository<Payment>;
  let qrCodeService: QrCodeService;
  let emailService: EmailService;

  const mockRegistration = {
    id: 'registration-id',
    userId: 'user-id',
    eventId: 'event-id',
    status: 'pending',
    paymentStatus: 'pending',
    paymentId: 'payment-id',
    finalAmount: 1000,
    ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 2, price: 500 }],
    user: { id: 'user-id', name: 'Test User', email: 'test@example.com' },
    event: { id: 'event-id', title: 'Test Event', startDate: new Date(), location: 'Test Location' },
  };

  const mockPayment = {
    id: 'payment-id',
    status: 'completed',
    resourceType: 'event',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationCompletionService,
        {
          provide: getRepositoryToken(Registration),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Event),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: QrCodeService,
          useValue: {
            generateRegistrationQrCode: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationCompletionService>(RegistrationCompletionService);
    registrationRepository = module.get<Repository<Registration>>(getRepositoryToken(Registration));
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    qrCodeService = module.get<QrCodeService>(QrCodeService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPaymentSuccess', () => {
    it('should process payment success and update registration', async () => {
      const qrCode = 'data:image/png;base64,test-qr-code';
      
      (paymentRepository.findOne as jest.Mock).mockResolvedValue(mockPayment);
      (registrationRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(mockRegistration)
        .mockResolvedValueOnce({ ...mockRegistration, status: 'paid', qrCode });
      (qrCodeService.generateRegistrationQrCode as jest.Mock).mockResolvedValue(qrCode);
      (emailService.sendEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await service.processPaymentSuccess('payment-id');

      expect(paymentRepository.findOne).toHaveBeenCalledWith({ where: { id: 'payment-id' } });
      expect(registrationRepository.findOne).toHaveBeenCalledWith({
        where: { paymentId: 'payment-id' },
        relations: ['user', 'event'],
      });
      expect(qrCodeService.generateRegistrationQrCode).toHaveBeenCalledWith({
        registrationId: mockRegistration.id,
        eventId: mockRegistration.eventId,
        userId: mockRegistration.userId,
      });
      expect(registrationRepository.update).toHaveBeenCalledWith(mockRegistration.id, {
        status: 'paid',
        paymentStatus: 'completed',
        qrCode,
      });
      expect(result.status).toBe('paid');
    });

    it('should throw NotFoundException when payment not found', async () => {
      (paymentRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.processPaymentSuccess('non-existent-payment')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when payment not completed', async () => {
      const incompletePayment = { ...mockPayment, status: 'pending' };
      (paymentRepository.findOne as jest.Mock).mockResolvedValue(incompletePayment);

      await expect(service.processPaymentSuccess('payment-id')).rejects.toThrow(BadRequestException);
    });

    it('should return existing registration if already paid', async () => {
      const paidRegistration = { ...mockRegistration, status: 'paid' };
      
      (paymentRepository.findOne as jest.Mock).mockResolvedValue(mockPayment);
      (registrationRepository.findOne as jest.Mock).mockResolvedValue(paidRegistration);

      const result = await service.processPaymentSuccess('payment-id');

      expect(result).toEqual(paidRegistration);
      expect(qrCodeService.generateRegistrationQrCode).not.toHaveBeenCalled();
    });
  });

  describe('getRegistrationById', () => {
    it('should get registration by id and user id', async () => {
      (registrationRepository.findOne as jest.Mock).mockResolvedValue(mockRegistration);

      const result = await service.getRegistrationById('registration-id', 'user-id');

      expect(registrationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'registration-id', userId: 'user-id' },
        relations: ['event', 'user'],
      });
      expect(result).toEqual(mockRegistration);
    });

    it('should throw NotFoundException when registration not found', async () => {
      (registrationRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.getRegistrationById('non-existent-id', 'user-id')).rejects.toThrow(NotFoundException);
    });
  });
});