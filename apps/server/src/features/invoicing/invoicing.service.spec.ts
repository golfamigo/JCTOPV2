import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { InvoicingService } from './invoicing.service';
import { InvoiceSettings } from './entities/invoice-settings.entity';
import { Event } from '../../entities/event.entity';
import { CreateInvoiceSettingsDto, UpdateInvoiceSettingsDto } from '../events/dto/invoice-settings.dto';

describe('InvoicingService', () => {
  let service: InvoicingService;
  let invoiceSettingsRepository: Repository<InvoiceSettings>;
  let eventRepository: Repository<Event>;

  const mockEvent = {
    id: 'event-1',
    organizerId: 'organizer-1',
    title: 'Test Event',
  };

  const mockInvoiceSettings = {
    id: 'settings-1',
    eventId: 'event-1',
    companyName: 'Test Company',
    companyAddress: '123 Test St',
    taxNumber: 'TAX123',
    invoicePrefix: 'INV-',
    invoiceFooter: 'Thank you for your business',
    customFields: { field1: 'value1' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateDto: CreateInvoiceSettingsDto = {
    companyName: 'Test Company',
    companyAddress: '123 Test St',
    taxNumber: 'TAX123',
    invoicePrefix: 'INV-',
    invoiceFooter: 'Thank you for your business',
    customFields: { field1: 'value1' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicingService,
        {
          provide: getRepositoryToken(InvoiceSettings),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Event),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InvoicingService>(InvoicingService);
    invoiceSettingsRepository = module.get<Repository<InvoiceSettings>>(getRepositoryToken(InvoiceSettings));
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
  });

  describe('createInvoiceSettings', () => {
    it('should create invoice settings successfully', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(invoiceSettingsRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(invoiceSettingsRepository, 'create').mockReturnValue(mockInvoiceSettings as any);
      jest.spyOn(invoiceSettingsRepository, 'save').mockResolvedValue(mockInvoiceSettings as any);

      // Act
      const result = await service.createInvoiceSettings('event-1', 'organizer-1', mockCreateDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.companyName).toBe(mockCreateDto.companyName);
      expect(result.eventId).toBe('event-1');
      expect(invoiceSettingsRepository.create).toHaveBeenCalledWith({
        eventId: 'event-1',
        ...mockCreateDto,
      });
    });

    it('should throw NotFoundException when event not found', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.createInvoiceSettings('event-1', 'organizer-1', mockCreateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when event not owned by organizer', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.createInvoiceSettings('event-1', 'wrong-organizer', mockCreateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when settings already exist', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(invoiceSettingsRepository, 'findOne').mockResolvedValue(mockInvoiceSettings as any);

      // Act & Assert
      await expect(service.createInvoiceSettings('event-1', 'organizer-1', mockCreateDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('getInvoiceSettings', () => {
    it('should return invoice settings when they exist', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(invoiceSettingsRepository, 'findOne').mockResolvedValue(mockInvoiceSettings as any);

      // Act
      const result = await service.getInvoiceSettings('event-1', 'organizer-1');

      // Assert
      expect(result).toBeDefined();
      expect(result?.companyName).toBe(mockInvoiceSettings.companyName);
      expect(result?.eventId).toBe('event-1');
    });

    it('should return null when settings do not exist', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(invoiceSettingsRepository, 'findOne').mockResolvedValue(null);

      // Act
      const result = await service.getInvoiceSettings('event-1', 'organizer-1');

      // Assert
      expect(result).toBeNull();
    });

    it('should throw NotFoundException when event not found', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.getInvoiceSettings('event-1', 'organizer-1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('updateInvoiceSettings', () => {
    const updateDto: UpdateInvoiceSettingsDto = {
      companyName: 'Updated Company',
      companyAddress: '456 Updated St',
    };

    it('should update invoice settings successfully', async () => {
      // Arrange
      const updatedSettings = { ...mockInvoiceSettings, ...updateDto };
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(invoiceSettingsRepository, 'findOne').mockResolvedValue(mockInvoiceSettings as any);
      jest.spyOn(invoiceSettingsRepository, 'save').mockResolvedValue(updatedSettings as any);

      // Act
      const result = await service.updateInvoiceSettings('event-1', 'organizer-1', updateDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.companyName).toBe(updateDto.companyName);
      expect(result.companyAddress).toBe(updateDto.companyAddress);
    });

    it('should throw NotFoundException when event not found', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateInvoiceSettings('event-1', 'organizer-1', updateDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when settings not found', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(invoiceSettingsRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateInvoiceSettings('event-1', 'organizer-1', updateDto))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteInvoiceSettings', () => {
    it('should delete invoice settings successfully', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(invoiceSettingsRepository, 'delete').mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.deleteInvoiceSettings('event-1', 'organizer-1');

      // Assert
      expect(invoiceSettingsRepository.delete).toHaveBeenCalledWith({ eventId: 'event-1' });
    });

    it('should throw NotFoundException when event not found', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteInvoiceSettings('event-1', 'organizer-1'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when settings not found', async () => {
      // Arrange
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(invoiceSettingsRepository, 'delete').mockResolvedValue({ affected: 0 } as any);

      // Act & Assert
      await expect(service.deleteInvoiceSettings('event-1', 'organizer-1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});