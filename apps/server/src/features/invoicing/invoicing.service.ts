import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceSettings } from './entities/invoice-settings.entity';
import { Event } from '../../entities/event.entity';
import { CreateInvoiceSettingsDto, UpdateInvoiceSettingsDto, InvoiceSettingsResponseDto } from '../events/dto/invoice-settings.dto';

@Injectable()
export class InvoicingService {
  private readonly logger = new Logger(InvoicingService.name);

  constructor(
    @InjectRepository(InvoiceSettings)
    private readonly invoiceSettingsRepository: Repository<InvoiceSettings>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async createInvoiceSettings(
    eventId: string,
    organizerId: string,
    createDto: CreateInvoiceSettingsDto
  ): Promise<InvoiceSettingsResponseDto> {
    this.logger.log(`Creating invoice settings for event: ${eventId}`);

    // Verify event exists and belongs to organizer
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found or not owned by organizer`);
    }

    // Check if settings already exist
    const existingSettings = await this.invoiceSettingsRepository.findOne({
      where: { eventId },
    });

    if (existingSettings) {
      throw new ConflictException(`Invoice settings already exist for event ${eventId}`);
    }

    // Create new settings
    const settings = this.invoiceSettingsRepository.create({
      eventId,
      ...createDto,
    });

    const savedSettings = await this.invoiceSettingsRepository.save(settings);

    return new InvoiceSettingsResponseDto({
      id: savedSettings.id,
      eventId: savedSettings.eventId,
      companyName: savedSettings.companyName,
      companyAddress: savedSettings.companyAddress,
      taxNumber: savedSettings.taxNumber,
      invoicePrefix: savedSettings.invoicePrefix,
      invoiceFooter: savedSettings.invoiceFooter,
      customFields: savedSettings.customFields,
      createdAt: savedSettings.createdAt.toISOString(),
      updatedAt: savedSettings.updatedAt.toISOString(),
    });
  }

  async getInvoiceSettings(
    eventId: string,
    organizerId: string
  ): Promise<InvoiceSettingsResponseDto | null> {
    this.logger.log(`Getting invoice settings for event: ${eventId}`);

    // Verify event exists and belongs to organizer
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found or not owned by organizer`);
    }

    const settings = await this.invoiceSettingsRepository.findOne({
      where: { eventId },
    });

    if (!settings) {
      return null;
    }

    return new InvoiceSettingsResponseDto({
      id: settings.id,
      eventId: settings.eventId,
      companyName: settings.companyName,
      companyAddress: settings.companyAddress,
      taxNumber: settings.taxNumber,
      invoicePrefix: settings.invoicePrefix,
      invoiceFooter: settings.invoiceFooter,
      customFields: settings.customFields,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    });
  }

  async updateInvoiceSettings(
    eventId: string,
    organizerId: string,
    updateDto: UpdateInvoiceSettingsDto
  ): Promise<InvoiceSettingsResponseDto> {
    this.logger.log(`Updating invoice settings for event: ${eventId}`);

    // Verify event exists and belongs to organizer
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found or not owned by organizer`);
    }

    const settings = await this.invoiceSettingsRepository.findOne({
      where: { eventId },
    });

    if (!settings) {
      throw new NotFoundException(`Invoice settings not found for event ${eventId}`);
    }

    // Update settings
    Object.assign(settings, updateDto);
    const updatedSettings = await this.invoiceSettingsRepository.save(settings);

    return new InvoiceSettingsResponseDto({
      id: updatedSettings.id,
      eventId: updatedSettings.eventId,
      companyName: updatedSettings.companyName,
      companyAddress: updatedSettings.companyAddress,
      taxNumber: updatedSettings.taxNumber,
      invoicePrefix: updatedSettings.invoicePrefix,
      invoiceFooter: updatedSettings.invoiceFooter,
      customFields: updatedSettings.customFields,
      createdAt: updatedSettings.createdAt.toISOString(),
      updatedAt: updatedSettings.updatedAt.toISOString(),
    });
  }

  async deleteInvoiceSettings(
    eventId: string,
    organizerId: string
  ): Promise<void> {
    this.logger.log(`Deleting invoice settings for event: ${eventId}`);

    // Verify event exists and belongs to organizer
    const event = await this.eventRepository.findOne({
      where: { id: eventId, organizerId },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found or not owned by organizer`);
    }

    const result = await this.invoiceSettingsRepository.delete({ eventId });

    if (result.affected === 0) {
      throw new NotFoundException(`Invoice settings not found for event ${eventId}`);
    }
  }
}