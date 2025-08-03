// Working Provider Factory tests using NestJS testing
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ProviderFactory } from './provider.factory';
import { ECPayProvider } from './ecpay/ecpay.provider';

describe('ProviderFactory Working Tests', () => {
  let factory: ProviderFactory;
  let ecpayProvider: ECPayProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderFactory,
        ECPayProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'BASE_URL':
                  return 'http://localhost:3000';
                case 'CLIENT_BASE_URL':
                  return 'http://localhost:3001';
                default:
                  return undefined;
              }
            }),
          },
        },
      ],
    }).compile();

    factory = module.get<ProviderFactory>(ProviderFactory);
    ecpayProvider = module.get<ECPayProvider>(ECPayProvider);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  it('should return ECPay provider for ecpay ID', () => {
    const provider = factory.getProvider('ecpay');
    
    expect(provider).toBeDefined();
    expect(provider).toBeInstanceOf(ECPayProvider);
    expect(provider.providerId).toBe('ecpay');
  });

  it('should return the same instance on multiple calls', () => {
    const provider1 = factory.getProvider('ecpay');
    const provider2 = factory.getProvider('ecpay');
    
    expect(provider1).toBe(provider2);
  });

  it('should throw error for unsupported provider ID', () => {
    expect(() => {
      factory.getProvider('unsupported-provider');
    }).toThrow("Payment provider 'unsupported-provider' not found");
  });

  it('should return list of available provider IDs', () => {
    const availableProviders = factory.getAvailableProviders();
    
    expect(availableProviders).toBeDefined();
    expect(Array.isArray(availableProviders)).toBe(true);
    expect(availableProviders).toContain('ecpay');
    expect(availableProviders.length).toBeGreaterThan(0);
  });

  it('should check if provider is supported', () => {
    expect(factory.hasProvider('ecpay')).toBe(true);
    expect(factory.hasProvider('stripe')).toBe(false);
    expect(factory.hasProvider('paypal')).toBe(false);
    expect(factory.hasProvider('unsupported')).toBe(false);
  });

  it('should register ECPay provider during construction', () => {
    const availableProviders = factory.getAvailableProviders();
    expect(availableProviders).toContain('ecpay');
  });
});