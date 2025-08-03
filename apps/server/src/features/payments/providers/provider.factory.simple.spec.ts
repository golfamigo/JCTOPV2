// Simple Provider Factory tests
import { ProviderFactory } from './provider.factory';
import { ECPayProvider } from './ecpay/ecpay.provider';

describe('ProviderFactory Simple Tests', () => {
  let factory: ProviderFactory;

  beforeEach(() => {
    factory = new ProviderFactory();
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
    }).toThrow('Unsupported payment provider: unsupported-provider');
  });

  it('should return list of supported provider IDs', () => {
    const supportedProviders = factory.getSupportedProviders();
    
    expect(supportedProviders).toBeDefined();
    expect(Array.isArray(supportedProviders)).toBe(true);
    expect(supportedProviders).toContain('ecpay');
    expect(supportedProviders.length).toBeGreaterThan(0);
  });

  it('should return true for supported providers', () => {
    expect(factory.isProviderSupported('ecpay')).toBe(true);
  });

  it('should return false for unsupported providers', () => {
    expect(factory.isProviderSupported('stripe')).toBe(false);
    expect(factory.isProviderSupported('paypal')).toBe(false);
    expect(factory.isProviderSupported('unsupported')).toBe(false);
  });
});