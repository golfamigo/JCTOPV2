import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentProviderService } from './payment-provider.service';
import { ProviderFactory } from '../providers/provider.factory';
import { Payment } from '../entities/payment.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';
import { PaymentProvider } from '../entities/payment-provider.entity';
import { PaymentRequest, PaymentResponse } from '@jctop-event/shared-types';

describe('PaymentGatewayService', () => {
  let service: PaymentGatewayService;
  let paymentRepository: Repository<Payment>;
  let paymentTransactionRepository: Repository<PaymentTransaction>;
  let paymentProviderService: PaymentProviderService;
  let providerFactory: ProviderFactory;
  let configService: ConfigService;

  const mockPaymentProvider: PaymentProvider = {
    id: 'provider-1',
    organizerId: 'org-1',
    providerId: 'ecpay',
    providerName: 'ECPay',
    credentials: 'encrypted-credentials',
    configuration: {},
    isActive: true,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    organizer: null as any,
  };

  const mockPayment: Payment = {
    id: 'payment-1',
    organizerId: 'org-1',
    resourceType: 'event',
    resourceId: 'event-1',
    providerId: 'ecpay',
    merchantTradeNo: 'PAY123456789',
    amount: 1000,
    discountAmount: 0,
    finalAmount: 1000,
    currency: 'TWD',
    paymentMethod: 'Credit',
    status: 'pending',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    organizer: null as any,
  };

  const mockProvider = {
    providerId: 'ecpay',
    validateCredentials: jest.fn().mockResolvedValue(true),
    createPayment: jest.fn().mockResolvedValue({
      paymentId: 'payment-1',
      status: 'requires_action',
      redirectUrl: 'https://payment.ecpay.com.tw/test',
      amount: 1000,
      currency: 'TWD',
    } as PaymentResponse),
    validateCallback: jest.fn().mockResolvedValue(true),
    processCallback: jest.fn().mockResolvedValue({
      paymentId: 'payment-1',
      status: 'completed',
      providerTransactionId: 'ecpay-123',
      providerResponse: { status: 'success' },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentGatewayService,
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(PaymentTransaction),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PaymentProviderService,
          useValue: {
            getActiveProvider: jest.fn(),
            getProviderConfig: jest.fn(),
            getDecryptedCredentials: jest.fn(),
          },
        },
        {
          provide: ProviderFactory,
          useValue: {
            getProvider: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentGatewayService>(PaymentGatewayService);
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
    paymentTransactionRepository = module.get<Repository<PaymentTransaction>>(getRepositoryToken(PaymentTransaction));
    paymentProviderService = module.get<PaymentProviderService>(PaymentProviderService);
    providerFactory = module.get<ProviderFactory>(ProviderFactory);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initiatePayment', () => {
    const paymentRequest: PaymentRequest = {
      organizerId: 'org-1',
      resourceType: 'event',
      resourceId: 'event-1',
      amount: 1000,
      currency: 'TWD',
      description: 'Test Event Registration',
      paymentMethod: 'Credit',
    };

    it('should initiate payment successfully', async () => {
      // Arrange
      jest.spyOn(paymentProviderService, 'getActiveProvider').mockResolvedValue(mockPaymentProvider);
      jest.spyOn(providerFactory, 'getProvider').mockReturnValue(mockProvider);
      jest.spyOn(paymentProviderService, 'getDecryptedCredentials').mockResolvedValue({
        merchantId: '2000132',
        hashKey: 'test-key',
        hashIV: 'test-iv',
        environment: 'development',
      });
      jest.spyOn(paymentRepository, 'create').mockReturnValue(mockPayment);
      jest.spyOn(paymentRepository, 'save').mockResolvedValue(mockPayment);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue(undefined as any);
      jest.spyOn(configService, 'get').mockReturnValue('http://localhost:3000');

      // Act
      const result = await service.initiatePayment(paymentRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.paymentId).toBe('payment-1');
      expect(result.status).toBe('requires_action');
      expect(paymentProviderService.getActiveProvider).toHaveBeenCalledWith('org-1', undefined);
      expect(providerFactory.getProvider).toHaveBeenCalledWith('ecpay');
      expect(mockProvider.createPayment).toHaveBeenCalled();
    });

    it('should throw error when no active provider found', async () => {
      // Arrange
      jest.spyOn(paymentProviderService, 'getActiveProvider').mockResolvedValue(null);

      // Act & Assert
      await expect(service.initiatePayment(paymentRequest)).rejects.toThrow(
        'No active payment provider configured for organizer'
      );
    });

    it('should handle provider errors gracefully', async () => {
      // Arrange
      jest.spyOn(paymentProviderService, 'getActiveProvider').mockResolvedValue(mockPaymentProvider);
      jest.spyOn(providerFactory, 'getProvider').mockReturnValue(mockProvider);
      jest.spyOn(paymentProviderService, 'getDecryptedCredentials').mockResolvedValue({});
      jest.spyOn(paymentRepository, 'create').mockReturnValue(mockPayment);
      jest.spyOn(paymentRepository, 'save').mockResolvedValue(mockPayment);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue(undefined as any);
      jest.spyOn(configService, 'get').mockReturnValue('http://localhost:3000');
      
      // Mock provider to throw error
      mockProvider.createPayment.mockRejectedValueOnce(new Error('Provider error'));

      // Act & Assert
      await expect(service.initiatePayment(paymentRequest)).rejects.toThrow('Provider error');
      
      // Verify payment is marked as failed
      expect(paymentRepository.update).toHaveBeenCalledWith(
        mockPayment.id,
        expect.objectContaining({ status: 'failed' })
      );
    });
  });

  describe('handleProviderCallback', () => {
    const callbackData = {
      MerchantTradeNo: 'PAY123456789',
      RtnCode: '1',
      TradeNo: 'ecpay-123',
      CheckMacValue: 'valid-hash',
    };

    it('should handle provider callback successfully', async () => {
      // Arrange
      jest.spyOn(providerFactory, 'getProvider').mockReturnValue(mockProvider);
      jest.spyOn(paymentProviderService, 'getProviderConfig').mockResolvedValue(mockPaymentProvider);
      jest.spyOn(paymentProviderService, 'getDecryptedCredentials').mockResolvedValue({});
      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(mockPayment);
      jest.spyOn(paymentRepository, 'update').mockResolvedValue(undefined as any);
      jest.spyOn(paymentTransactionRepository, 'create').mockReturnValue({} as any);
      jest.spyOn(paymentTransactionRepository, 'save').mockResolvedValue({} as any);

      // Act
      await service.handleProviderCallback('ecpay', 'org-1', callbackData);

      // Assert
      expect(mockProvider.validateCallback).toHaveBeenCalledWith(callbackData, {});
      expect(mockProvider.processCallback).toHaveBeenCalledWith(callbackData, mockPayment);
      expect(paymentRepository.update).toHaveBeenCalled();
      expect(paymentTransactionRepository.save).toHaveBeenCalled();
    });

    it('should throw error for invalid callback', async () => {
      // Arrange
      jest.spyOn(providerFactory, 'getProvider').mockReturnValue(mockProvider);
      jest.spyOn(paymentProviderService, 'getProviderConfig').mockResolvedValue(mockPaymentProvider);
      jest.spyOn(paymentProviderService, 'getDecryptedCredentials').mockResolvedValue({});
      
      // Mock invalid callback
      mockProvider.validateCallback.mockResolvedValueOnce(false);

      // Act & Assert
      await expect(
        service.handleProviderCallback('ecpay', 'org-1', callbackData)
      ).rejects.toThrow('Invalid payment callback signature');
    });

    it('should enforce organizer isolation', async () => {
      // Arrange
      jest.spyOn(providerFactory, 'getProvider').mockReturnValue(mockProvider);
      jest.spyOn(paymentProviderService, 'getProviderConfig').mockResolvedValue(mockPaymentProvider);
      jest.spyOn(paymentProviderService, 'getDecryptedCredentials').mockResolvedValue({});
      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(null); // Payment not found for organizer

      // Act & Assert
      await expect(
        service.handleProviderCallback('ecpay', 'org-1', callbackData)
      ).rejects.toThrow('Payment not found for this organizer');
      
      // Verify query includes organizer filter
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: {
          merchantTradeNo: callbackData.MerchantTradeNo,
          organizerId: 'org-1', // CRITICAL: Must filter by organizer
        },
      });
    });
  });

  describe('getPaymentStatus', () => {
    it('should return payment status for authorized organizer', async () => {
      // Arrange
      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(mockPayment);

      // Act
      const result = await service.getPaymentStatus('payment-1', 'org-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.payment).toEqual(mockPayment);
      expect(result.status).toBe(mockPayment.status);
      
      // Verify organizer isolation
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'payment-1',
          organizerId: 'org-1', // CRITICAL: Must filter by organizer
        },
      });
    });

    it('should throw error for unauthorized access', async () => {
      // Arrange
      jest.spyOn(paymentRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.getPaymentStatus('payment-1', 'wrong-org')
      ).rejects.toThrow('Payment not found');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});