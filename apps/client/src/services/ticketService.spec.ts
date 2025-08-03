import ticketService from './ticketService';
import apiClient from './apiClient';
import { CreateTicketTypeDto, UpdateTicketTypeDto, TicketType } from '@jctop-event/shared-types';

// Mock the apiClient
jest.mock('./apiClient');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('TicketService', () => {
  const eventId = '123e4567-e89b-12d3-a456-426614174000';
  const ticketTypeId = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTicketType', () => {
    const mockCreateTicketTypeDto: CreateTicketTypeDto = {
      name: 'General Admission',
      price: 49.99,
      quantity: 100,
    };

    const mockTicketTypeResponse: TicketType = {
      id: ticketTypeId,
      eventId,
      ...mockCreateTicketTypeDto,
    };

    it('should create a ticket type successfully', async () => {
      mockApiClient.post.mockResolvedValue(mockTicketTypeResponse);

      const result = await ticketService.createTicketType(eventId, mockCreateTicketTypeDto);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/events/${eventId}/ticket-types`, 
        mockCreateTicketTypeDto
      );
      expect(result).toEqual(mockTicketTypeResponse);
    });

    it('should handle API errors during ticket type creation', async () => {
      const errorMessage = 'Validation failed';
      mockApiClient.post.mockRejectedValue(new Error(errorMessage));

      await expect(ticketService.createTicketType(eventId, mockCreateTicketTypeDto))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('updateTicketType', () => {
    const mockUpdateTicketTypeDto: UpdateTicketTypeDto = {
      name: 'VIP Admission',
      price: 99.99,
    };

    const mockUpdatedTicketType: TicketType = {
      id: ticketTypeId,
      eventId,
      name: 'VIP Admission',
      price: 99.99,
      quantity: 100,
    };

    it('should update a ticket type successfully', async () => {
      mockApiClient.put.mockResolvedValue(mockUpdatedTicketType);

      const result = await ticketService.updateTicketType(eventId, ticketTypeId, mockUpdateTicketTypeDto);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/events/${eventId}/ticket-types/${ticketTypeId}`, 
        mockUpdateTicketTypeDto
      );
      expect(result).toEqual(mockUpdatedTicketType);
    });

    it('should handle API errors during ticket type update', async () => {
      const errorMessage = 'Ticket type not found';
      mockApiClient.put.mockRejectedValue(new Error(errorMessage));

      await expect(ticketService.updateTicketType(eventId, ticketTypeId, mockUpdateTicketTypeDto))
        .rejects.toThrow('Ticket type not found');
    });
  });

  describe('deleteTicketType', () => {
    it('should delete a ticket type successfully', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await ticketService.deleteTicketType(eventId, ticketTypeId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/events/${eventId}/ticket-types/${ticketTypeId}`
      );
    });

    it('should handle API errors during ticket type deletion', async () => {
      const errorMessage = 'Ticket type not found';
      mockApiClient.delete.mockRejectedValue(new Error(errorMessage));

      await expect(ticketService.deleteTicketType(eventId, ticketTypeId))
        .rejects.toThrow('Ticket type not found');
    });
  });

  describe('getTicketTypes', () => {
    const mockTicketTypes: TicketType[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        eventId,
        name: 'General Admission',
        price: 49.99,
        quantity: 100,
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        eventId,
        name: 'VIP',
        price: 99.99,
        quantity: 50,
      },
    ];

    it('should fetch ticket types successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockTicketTypes);

      const result = await ticketService.getTicketTypes(eventId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/events/${eventId}/ticket-types`);
      expect(result).toEqual(mockTicketTypes);
    });

    it('should handle API errors during ticket types fetch', async () => {
      const errorMessage = 'Event not found';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(ticketService.getTicketTypes(eventId))
        .rejects.toThrow('Event not found');
    });
  });

  describe('getTicketTypeById', () => {
    const mockTicketTypes: TicketType[] = [
      {
        id: ticketTypeId,
        eventId,
        name: 'General Admission',
        price: 49.99,
        quantity: 100,
      },
    ];

    it('should fetch a specific ticket type successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockTicketTypes);

      const result = await ticketService.getTicketTypeById(eventId, ticketTypeId);

      expect(result).toEqual(mockTicketTypes[0]);
    });

    it('should throw error when ticket type not found', async () => {
      mockApiClient.get.mockResolvedValue([]);

      await expect(ticketService.getTicketTypeById(eventId, ticketTypeId))
        .rejects.toThrow('Ticket type not found');
    });
  });

  describe('createMultipleTicketTypes', () => {
    const mockTicketTypesData: CreateTicketTypeDto[] = [
      { name: 'Early Bird', price: 29.99, quantity: 50 },
      { name: 'Regular', price: 39.99, quantity: 100 },
    ];

    const mockCreatedTicketTypes: TicketType[] = [
      { id: '1', eventId, ...mockTicketTypesData[0] },
      { id: '2', eventId, ...mockTicketTypesData[1] },
    ];

    it('should create multiple ticket types successfully', async () => {
      mockApiClient.post
        .mockResolvedValueOnce(mockCreatedTicketTypes[0])
        .mockResolvedValueOnce(mockCreatedTicketTypes[1]);

      const result = await ticketService.createMultipleTicketTypes(eventId, mockTicketTypesData);

      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockCreatedTicketTypes);
    });
  });

  describe('getTotalTicketCapacity', () => {
    const mockTicketTypes: TicketType[] = [
      { id: '1', eventId, name: 'Type 1', price: 10, quantity: 100 },
      { id: '2', eventId, name: 'Type 2', price: 20, quantity: 50 },
    ];

    it('should calculate total ticket capacity correctly', async () => {
      mockApiClient.get.mockResolvedValue(mockTicketTypes);

      const result = await ticketService.getTotalTicketCapacity(eventId);

      expect(result).toBe(150);
    });
  });

  describe('getPotentialRevenue', () => {
    const mockTicketTypes: TicketType[] = [
      { id: '1', eventId, name: 'Type 1', price: 10, quantity: 100 },
      { id: '2', eventId, name: 'Type 2', price: 20, quantity: 50 },
    ];

    it('should calculate potential revenue correctly', async () => {
      mockApiClient.get.mockResolvedValue(mockTicketTypes);

      const result = await ticketService.getPotentialRevenue(eventId);

      expect(result).toBe(2000); // (10 * 100) + (20 * 50)
    });
  });

  describe('validateTicketType', () => {
    it('should return no errors for valid ticket type data', () => {
      const validData: CreateTicketTypeDto = {
        name: 'Valid Ticket',
        price: 50,
        quantity: 100,
      };

      const errors = ticketService.validateTicketType(validData);

      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid ticket type data', () => {
      const invalidData: CreateTicketTypeDto = {
        name: '',
        price: -10,
        quantity: 0,
      };

      const errors = ticketService.validateTicketType(invalidData);

      expect(errors).toContain('Ticket name is required');
      expect(errors).toContain('Price cannot be negative');
      expect(errors).toContain('Quantity must be at least 1');
    });

    it('should validate maximum constraints', () => {
      const invalidData: CreateTicketTypeDto = {
        name: 'a'.repeat(256),
        price: 1000000,
        quantity: 1000000,
      };

      const errors = ticketService.validateTicketType(invalidData);

      expect(errors).toContain('Ticket name cannot exceed 255 characters');
      expect(errors).toContain('Price cannot exceed $999,999.99');
      expect(errors).toContain('Quantity cannot exceed 999,999');
    });

    it('should validate integer quantity', () => {
      const invalidData: CreateTicketTypeDto = {
        name: 'Test',
        price: 50,
        quantity: 10.5,
      };

      const errors = ticketService.validateTicketType(invalidData);

      expect(errors).toContain('Quantity must be a whole number');
    });
  });

  describe('validateUniqueTicketNames', () => {
    it('should return no errors for unique names', () => {
      const ticketTypes: CreateTicketTypeDto[] = [
        { name: 'Early Bird', price: 10, quantity: 50 },
        { name: 'Regular', price: 20, quantity: 100 },
      ];

      const errors = ticketService.validateUniqueTicketNames(ticketTypes);

      expect(errors).toHaveLength(0);
    });

    it('should return errors for duplicate names', () => {
      const ticketTypes: CreateTicketTypeDto[] = [
        { name: 'General', price: 10, quantity: 50 },
        { name: 'General', price: 20, quantity: 100 },
      ];

      const errors = ticketService.validateUniqueTicketNames(ticketTypes);

      expect(errors).toContain('Duplicate ticket names found: General');
    });

    it('should be case insensitive when checking duplicates', () => {
      const ticketTypes: CreateTicketTypeDto[] = [
        { name: 'general', price: 10, quantity: 50 },
        { name: 'GENERAL', price: 20, quantity: 100 },
      ];

      const errors = ticketService.validateUniqueTicketNames(ticketTypes);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});