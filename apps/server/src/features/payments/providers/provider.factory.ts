import { Injectable } from '@nestjs/common';
import { IPaymentProvider } from '../interfaces/payment-provider.interface';
import { ECPayProvider } from './ecpay/ecpay.provider';

@Injectable()
export class ProviderFactory {
  private readonly providers: Map<string, IPaymentProvider> = new Map();

  constructor(
    private readonly ecpayProvider: ECPayProvider,
  ) {
    // Register all available providers
    this.registerProvider(this.ecpayProvider);
  }

  private registerProvider(provider: IPaymentProvider): void {
    this.providers.set(provider.providerId, provider);
  }

  getProvider(providerId: string): IPaymentProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Payment provider '${providerId}' not found`);
    }
    return provider;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  hasProvider(providerId: string): boolean {
    return this.providers.has(providerId);
  }
}