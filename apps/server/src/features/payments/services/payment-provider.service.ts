import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentProvider } from '../entities/payment-provider.entity';
import { CredentialsEncryptionService } from './credentials-encryption.service';
import { ProviderFactory } from '../providers/provider.factory';
import { PaymentProviderDto, UpdatePaymentProviderDto } from '@jctop-event/shared-types';

@Injectable()
export class PaymentProviderService {
  constructor(
    @InjectRepository(PaymentProvider)
    private paymentProviderRepository: Repository<PaymentProvider>,
    private credentialsEncryptionService: CredentialsEncryptionService,
    private providerFactory: ProviderFactory,
  ) {}

  async getActiveProvider(organizerId: string, preferredProviderId?: string): Promise<PaymentProvider | null> {
    let provider: PaymentProvider | null = null;

    // If preferred provider specified, try to get it
    if (preferredProviderId) {
      provider = await this.paymentProviderRepository.findOne({
        where: { 
          organizerId, 
          providerId: preferredProviderId, 
          isActive: true 
        }
      });
    }

    // If no preferred provider or preferred not found, get default
    if (!provider) {
      provider = await this.paymentProviderRepository.findOne({
        where: { 
          organizerId, 
          isActive: true, 
          isDefault: true 
        }
      });
    }

    // If no default, get any active provider
    if (!provider) {
      provider = await this.paymentProviderRepository.findOne({
        where: { 
          organizerId, 
          isActive: true 
        }
      });
    }

    return provider;
  }

  async getProviderConfig(organizerId: string, providerId: string): Promise<PaymentProvider> {
    const provider = await this.paymentProviderRepository.findOne({
      where: { organizerId, providerId, isActive: true }
    });

    if (!provider) {
      throw new NotFoundException(`Payment provider '${providerId}' not found for organizer`);
    }

    return provider;
  }

  async getDecryptedCredentials<T = Record<string, any>>(provider: PaymentProvider): Promise<T> {
    try {
      return this.credentialsEncryptionService.decryptJson<T>(
        provider.credentials,
        `payment-credentials-${provider.organizerId}-${provider.providerId}`
      );
    } catch (error) {
      throw new BadRequestException(`Failed to decrypt credentials: ${error.message}`);
    }
  }

  async createProvider(organizerId: string, dto: PaymentProviderDto): Promise<PaymentProvider> {
    // Validate provider exists in factory
    if (!this.providerFactory.hasProvider(dto.providerId)) {
      throw new BadRequestException(`Payment provider '${dto.providerId}' is not supported`);
    }

    // Validate credentials with provider
    const provider = this.providerFactory.getProvider(dto.providerId);
    const isValid = await provider.validateCredentials(dto.credentials);
    if (!isValid) {
      throw new BadRequestException(`Invalid credentials for provider '${dto.providerId}'`);
    }

    // Check if provider already exists for this organizer
    const existingProvider = await this.paymentProviderRepository.findOne({
      where: { organizerId, providerId: dto.providerId }
    });

    if (existingProvider) {
      throw new BadRequestException(`Payment provider '${dto.providerId}' already configured for this organizer`);
    }

    // Encrypt credentials
    const encryptedCredentials = this.credentialsEncryptionService.encryptJson(
      dto.credentials,
      `payment-credentials-${organizerId}-${dto.providerId}`
    );

    // If this is the first provider for the organizer, make it default
    const providerCount = await this.paymentProviderRepository.count({
      where: { organizerId }
    });
    const isDefault = providerCount === 0 || dto.isDefault;

    // If setting as default, unset other defaults
    if (isDefault) {
      await this.paymentProviderRepository.update(
        { organizerId, isDefault: true },
        { isDefault: false }
      );
    }

    const newProvider = this.paymentProviderRepository.create({
      organizerId,
      providerId: dto.providerId,
      providerName: dto.providerName,
      credentials: encryptedCredentials,
      configuration: dto.configuration || {},
      isActive: dto.isActive ?? true,
      isDefault
    });

    return await this.paymentProviderRepository.save(newProvider);
  }

  async updateProvider(
    organizerId: string, 
    providerId: string, 
    dto: UpdatePaymentProviderDto
  ): Promise<PaymentProvider> {
    const provider = await this.getProviderConfig(organizerId, providerId);

    // If updating credentials, validate them
    if (dto.credentials) {
      const providerImpl = this.providerFactory.getProvider(providerId);
      const isValid = await providerImpl.validateCredentials(dto.credentials);
      if (!isValid) {
        throw new BadRequestException(`Invalid credentials for provider '${providerId}'`);
      }

      // Encrypt new credentials
      provider.credentials = this.credentialsEncryptionService.encryptJson(
        dto.credentials,
        `payment-credentials-${organizerId}-${providerId}`
      );
    }

    // Update other fields
    if (dto.configuration !== undefined) {
      provider.configuration = dto.configuration;
    }
    if (dto.isActive !== undefined) {
      provider.isActive = dto.isActive;
    }

    // Handle default flag
    if (dto.isDefault === true) {
      // Unset other defaults first
      await this.paymentProviderRepository.update(
        { organizerId, isDefault: true },
        { isDefault: false }
      );
      provider.isDefault = true;
    } else if (dto.isDefault === false) {
      provider.isDefault = false;
    }

    return await this.paymentProviderRepository.save(provider);
  }

  async setDefaultProvider(organizerId: string, providerId: string): Promise<void> {
    const provider = await this.getProviderConfig(organizerId, providerId);

    // Unset other defaults
    await this.paymentProviderRepository.update(
      { organizerId, isDefault: true },
      { isDefault: false }
    );

    // Set this provider as default
    provider.isDefault = true;
    await this.paymentProviderRepository.save(provider);
  }

  async removeProvider(organizerId: string, providerId: string): Promise<void> {
    const provider = await this.getProviderConfig(organizerId, providerId);
    
    // Mark as inactive instead of deleting to preserve payment history
    provider.isActive = false;
    provider.isDefault = false;
    await this.paymentProviderRepository.save(provider);
  }

  async getAllProviders(organizerId: string): Promise<PaymentProvider[]> {
    return await this.paymentProviderRepository.find({
      where: { organizerId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'ASC' }
    });
  }
}