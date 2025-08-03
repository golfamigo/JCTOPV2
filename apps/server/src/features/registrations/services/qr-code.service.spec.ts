import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from './qr-code.service';

describe('QrCodeService', () => {
  let service: QrCodeService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QrCodeService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-key-32-characters-long-12345'),
          },
        },
      ],
    }).compile();

    service = module.get<QrCodeService>(QrCodeService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate QR code for registration data', async () => {
    const registrationData = {
      registrationId: 'test-registration-id',
      eventId: 'test-event-id',
      userId: 'test-user-id',
    };

    const qrCode = await service.generateRegistrationQrCode(registrationData);

    expect(qrCode).toBeDefined();
    expect(qrCode).toMatch(/^data:image\/png;base64/);
  });

  it('should encrypt and decrypt registration data correctly', async () => {
    const originalData = {
      registrationId: 'test-registration-id',
      eventId: 'test-event-id',
      userId: 'test-user-id',
    };

    const encrypted = (service as any).encryptRegistrationData(originalData);
    const decrypted = service.decryptRegistrationData(encrypted);

    expect(decrypted).toEqual(originalData);
  });

  it('should handle encryption with custom key', () => {
    const testKey = 'custom-test-key-32-characters-123';
    (configService.get as jest.Mock).mockReturnValue(testKey);

    const data = { test: 'data' };
    const encrypted = (service as any).encryptRegistrationData(data);
    const decrypted = service.decryptRegistrationData(encrypted);

    expect(decrypted).toEqual(data);
  });
});