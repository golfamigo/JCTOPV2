import apiClient from './apiClient';
import { TicketType, CreateTicketTypeDto, UpdateTicketTypeDto, TicketTypeWithAvailability, TicketSelection, TicketSelectionValidationResponse } from '@jctop-event/shared-types';

class TicketService {
  /**
   * Create a new ticket type for an event
   */
  async createTicketType(eventId: string, ticketTypeData: CreateTicketTypeDto): Promise<TicketType> {
    try {
      const response = await apiClient.post<TicketType>(`/events/${eventId}/ticket-types`, ticketTypeData);
      return response;
    } catch (error) {
      console.error('Error creating ticket type:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create ticket type');
    }
  }

  /**
   * Update an existing ticket type
   */
  async updateTicketType(
    eventId: string, 
    ticketTypeId: string, 
    ticketTypeData: UpdateTicketTypeDto
  ): Promise<TicketType> {
    try {
      const response = await apiClient.put<TicketType>(
        `/events/${eventId}/ticket-types/${ticketTypeId}`, 
        ticketTypeData
      );
      return response;
    } catch (error) {
      console.error('Error updating ticket type:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update ticket type');
    }
  }

  /**
   * Delete a ticket type
   */
  async deleteTicketType(eventId: string, ticketTypeId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/events/${eventId}/ticket-types/${ticketTypeId}`);
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete ticket type');
    }
  }

  /**
   * Get all ticket types for an event
   */
  async getTicketTypes(eventId: string): Promise<TicketType[]> {
    try {
      const response = await apiClient.get<TicketType[]>(`/events/${eventId}/ticket-types`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch ticket types');
    }
  }

  /**
   * Get a specific ticket type by ID
   */
  async getTicketTypeById(eventId: string, ticketTypeId: string): Promise<TicketType> {
    try {
      const ticketTypes = await this.getTicketTypes(eventId);
      const ticketType = ticketTypes.find(tt => tt.id === ticketTypeId);
      
      if (!ticketType) {
        throw new Error('Ticket type not found');
      }
      
      return ticketType;
    } catch (error) {
      console.error('Error fetching ticket type by ID:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch ticket type');
    }
  }

  /**
   * Batch create multiple ticket types for an event
   */
  async createMultipleTicketTypes(
    eventId: string, 
    ticketTypesData: CreateTicketTypeDto[]
  ): Promise<TicketType[]> {
    try {
      const promises = ticketTypesData.map(ticketTypeData => 
        this.createTicketType(eventId, ticketTypeData)
      );
      
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error creating multiple ticket types:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create ticket types');
    }
  }

  /**
   * Calculate total ticket capacity for an event
   */
  async getTotalTicketCapacity(eventId: string): Promise<number> {
    try {
      const ticketTypes = await this.getTicketTypes(eventId);
      return ticketTypes.reduce((total, ticketType) => total + ticketType.quantity, 0);
    } catch (error) {
      console.error('Error calculating total ticket capacity:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate ticket capacity');
    }
  }

  /**
   * Calculate potential revenue for an event
   */
  async getPotentialRevenue(eventId: string): Promise<number> {
    try {
      const ticketTypes = await this.getTicketTypes(eventId);
      return ticketTypes.reduce((total, ticketType) => total + (ticketType.price * ticketType.quantity), 0);
    } catch (error) {
      console.error('Error calculating potential revenue:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate potential revenue');
    }
  }

  // Public methods for registration flow (no authentication required)
  
  /**
   * Get ticket types with availability information for public registration
   */
  async getTicketTypesWithAvailability(eventId: string): Promise<TicketTypeWithAvailability[]> {
    try {
      const response = await apiClient.get<TicketTypeWithAvailability[]>(`/events/public/${eventId}/ticket-types`);
      return response;
    } catch (error) {
      console.error('Error fetching ticket types with availability:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch ticket availability');
    }
  }

  /**
   * Validate ticket selection before proceeding with registration
   */
  async validateTicketSelection(eventId: string, selections: TicketSelection[]): Promise<TicketSelectionValidationResponse> {
    try {
      const response = await apiClient.post<TicketSelectionValidationResponse>(
        `/events/public/${eventId}/validate-selection`,
        { selections }
      );
      return response;
    } catch (error) {
      console.error('Error validating ticket selection:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to validate ticket selection');
    }
  }

  /**
   * Calculate total price for selected tickets
   */
  calculateTotalPrice(ticketTypes: TicketTypeWithAvailability[], selections: TicketSelection[]): number {
    return selections.reduce((total, selection) => {
      const ticketType = ticketTypes.find(tt => tt.id === selection.ticketTypeId);
      if (ticketType) {
        return total + (ticketType.price * selection.quantity);
      }
      return total;
    }, 0);
  }

  /**
   * Check if ticket selection is valid (client-side validation)
   */
  validateSelectionClientSide(
    ticketTypes: TicketTypeWithAvailability[], 
    selections: TicketSelection[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const ticketTypeMap = new Map(ticketTypes.map(tt => [tt.id, tt]));

    for (const selection of selections) {
      const ticketType = ticketTypeMap.get(selection.ticketTypeId);
      
      if (!ticketType) {
        errors.push('Invalid ticket type selected');
        continue;
      }

      if (selection.quantity <= 0) {
        errors.push(`${ticketType.name}: Quantity must be greater than 0`);
        continue;
      }

      if (selection.quantity > ticketType.availableQuantity) {
        errors.push(`${ticketType.name}: Only ${ticketType.availableQuantity} tickets available`);
        continue;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate ticket type data before submission
   */
  validateTicketType(ticketTypeData: CreateTicketTypeDto | UpdateTicketTypeDto): string[] {
    const errors: string[] = [];

    if ('name' in ticketTypeData && ticketTypeData.name !== undefined) {
      if (!ticketTypeData.name.trim()) {
        errors.push('Ticket name is required');
      } else if (ticketTypeData.name.length > 255) {
        errors.push('Ticket name cannot exceed 255 characters');
      }
    }

    if ('price' in ticketTypeData && ticketTypeData.price !== undefined) {
      if (ticketTypeData.price < 0) {
        errors.push('Price cannot be negative');
      } else if (ticketTypeData.price > 999999.99) {
        errors.push('Price cannot exceed $999,999.99');
      }
    }

    if ('quantity' in ticketTypeData && ticketTypeData.quantity !== undefined) {
      if (ticketTypeData.quantity < 1) {
        errors.push('Quantity must be at least 1');
      } else if (ticketTypeData.quantity > 999999) {
        errors.push('Quantity cannot exceed 999,999');
      } else if (!Number.isInteger(ticketTypeData.quantity)) {
        errors.push('Quantity must be a whole number');
      }
    }

    return errors;
  }

  /**
   * Check for duplicate ticket names within an array
   */
  validateUniqueTicketNames(ticketTypes: (CreateTicketTypeDto | TicketType)[]): string[] {
    const errors: string[] = [];
    const nameSet = new Set<string>();
    const duplicates = new Set<string>();

    ticketTypes.forEach((ticketType, index) => {
      const name = ticketType.name.trim().toLowerCase();
      if (nameSet.has(name)) {
        duplicates.add(ticketType.name.trim());
      } else {
        nameSet.add(name);
      }
    });

    if (duplicates.size > 0) {
      errors.push(`Duplicate ticket names found: ${Array.from(duplicates).join(', ')}`);
    }

    return errors;
  }
}

const ticketService = new TicketService();
export default ticketService;