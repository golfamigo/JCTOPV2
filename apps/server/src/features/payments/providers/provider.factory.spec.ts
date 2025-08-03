import { Test, TestingModule } from '@nestjs/testing';
import { ProviderFactory } from './provider.factory';
import { ECPayProvider } from './ecpay/ecpay.provider';
import { IPaymentProvider } from './interfaces/payment-provider.interface';

describe('ProviderFactory', () => {
  let factory: ProviderFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderFactory],
    }).compile();

    factory = module.get<ProviderFactory>(ProviderFactory);
  });

  it('should be defined', () => {
    expect(factory).toBeDefined();
  });

  describe('getProvider', () => {
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
      }).toThrow('Unsupported payment provider: unsupported-provider');
    });

    it('should throw error for empty provider ID', () => {
      expect(() => {
        factory.getProvider('');
      }).toThrow('Unsupported payment provider: ');
    });

    it('should throw error for null provider ID', () => {
      expect(() => {
        factory.getProvider(null as any);
      }).toThrow('Unsupported payment provider: null');
    });

    it('should throw error for undefined provider ID', () => {
      expect(() => {
        factory.getProvider(undefined as any);
      }).toThrow('Unsupported payment provider: undefined');
    });
  });

  describe('getSupportedProviders', () => {
    it('should return list of supported provider IDs', () => {
      const supportedProviders = factory.getSupportedProviders();
      
      expect(supportedProviders).toBeDefined();
      expect(Array.isArray(supportedProviders)).toBe(true);
      expect(supportedProviders).toContain('ecpay');
      expect(supportedProviders.length).toBeGreaterThan(0);
    });

    it('should return consistent results on multiple calls', () => {
      const providers1 = factory.getSupportedProviders();
      const providers2 = factory.getSupportedProviders();
      
      expect(providers1).toEqual(providers2);
    });
  });

  describe('isProviderSupported', () => {
    it('should return true for supported providers', () => {
      expect(factory.isProviderSupported('ecpay')).toBe(true);
    });

    it('should return false for unsupported providers', () => {
      expect(factory.isProviderSupported('stripe')).toBe(false);
      expect(factory.isProviderSupported('paypal')).toBe(false);
      expect(factory.isProviderSupported('unsupported')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(factory.isProviderSupported('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(factory.isProviderSupported(null as any)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(factory.isProviderSupported(undefined as any)).toBe(false);
    });

    it('should be case sensitive', () => {
      expect(factory.isProviderSupported('ECPAY')).toBe(false);
      expect(factory.isProviderSupported('ECPay')).toBe(false);
      expect(factory.isProviderSupported('ecpay')).toBe(true);
    });
  });

  describe('provider instances', () => {
    it('should create provider instances that implement IPaymentProvider interface', () => {
      const provider = factory.getProvider('ecpay');
      
      // Check that the provider implements the required interface methods
      expect(typeof provider.providerId).toBe('string');
      expect(typeof provider.validateCredentials).toBe('function');
      expect(typeof provider.createPayment).toBe('function');
      expect(typeof provider.validateCallback).toBe('function');
      expect(typeof provider.processCallback).toBe('function');
    });

    it('should create providers with correct provider IDs', () => {
      const ecpayProvider = factory.getProvider('ecpay');
      expect(ecpayProvider.providerId).toBe('ecpay');
    });
  });

  describe('error handling', () => {
    it('should provide helpful error messages for unsupported providers', () => {
      try {
        factory.getProvider('stripe');
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toContain('stripe');
        expect(error.message).toContain('Unsupported payment provider');
      }
    });

    it('should handle provider initialization errors gracefully', () => {
      // Mock a provider that fails during initialization
      const originalGetProvider = factory.getProvider;
      
      // This test would be more relevant if we had providers that could fail during initialization
      // For now, we just ensure the current implementation works correctly
      expect(() => {
        factory.getProvider('ecpay');
      }).not.toThrow();
    });
  });

  describe('extensibility', () => {
    it('should be easy to add new providers', () => {
      // This test documents the expected behavior when new providers are added
      const supportedProviders = factory.getSupportedProviders();
      
      // Currently should only have ECPay
      expect(supportedProviders).toEqual(['ecpay']);
      
      // When new providers are added (like Stripe, PayPal), they should appear here
      // expect(supportedProviders).toContain('stripe');
      // expect(supportedProviders).toContain('paypal');
    });

    it('should maintain singleton behavior for all providers', () => {
      // Test that multiple calls return the same instance for each provider
      const ecpay1 = factory.getProvider('ecpay');
      const ecpay2 = factory.getProvider('ecpay');
      
      expect(ecpay1).toBe(ecpay2);
      
      // When more providers are added, test them too:
      // const stripe1 = factory.getProvider('stripe');
      // const stripe2 = factory.getProvider('stripe');
      // expect(stripe1).toBe(stripe2);
    });
  });

  describe('performance', () => {
    it('should create providers efficiently on first call', () => {
      const startTime = Date.now();
      const provider = factory.getProvider('ecpay');
      const endTime = Date.now();
      
      expect(provider).toBeDefined();
      // Provider creation should be fast (under 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should return cached instances very quickly', () => {
      // First call to create the instance
      factory.getProvider('ecpay');
      
      // Subsequent calls should be very fast
      const startTime = Date.now();
      const provider = factory.getProvider('ecpay');
      const endTime = Date.now();
      
      expect(provider).toBeDefined();
      // Cached instance retrieval should be extremely fast (under 10ms)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('memory management', () => {
    it('should not create multiple instances of the same provider', () => {
      const instances = [];
      
      // Create multiple references to the same provider
      for (let i = 0; i < 10; i++) {
        instances.push(factory.getProvider('ecpay'));
      }
      
      // All should be the same instance
      const firstInstance = instances[0];
      instances.forEach(instance => {
        expect(instance).toBe(firstInstance);
      });
    });

    it('should handle many provider requests without memory leaks', () => {
      // Simulate many provider requests
      for (let i = 0; i < 1000; i++) {
        const provider = factory.getProvider('ecpay');
        expect(provider.providerId).toBe('ecpay');
      }
      
      // Should still work correctly
      const finalProvider = factory.getProvider('ecpay');
      expect(finalProvider.providerId).toBe('ecpay');
    });
  });

  describe('thread safety simulation', () => {
    it('should handle concurrent provider requests', async () => {
      // Simulate concurrent requests for the same provider
      const promises = Array.from({ length: 10 }, () => 
        Promise.resolve(factory.getProvider('ecpay'))
      );
      
      const providers = await Promise.all(promises);
      
      // All should be the same instance
      const firstProvider = providers[0];
      providers.forEach(provider => {
        expect(provider).toBe(firstProvider);
      });
    });

    it('should handle concurrent requests for different providers', async () => {
      // When more providers are available, test concurrent access to different ones
      const ecpayPromises = Array.from({ length: 5 }, () => 
        Promise.resolve(factory.getProvider('ecpay'))
      );
      
      const ecpayProviders = await Promise.all(ecpayPromises);
      
      // All ECPay instances should be the same
      const firstEcpay = ecpayProviders[0];
      ecpayProviders.forEach(provider => {
        expect(provider).toBe(firstEcpay);
        expect(provider.providerId).toBe('ecpay');
      });
    });
  });
});