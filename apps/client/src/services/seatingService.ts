import apiClient from './apiClient';
import { SeatingZone, CreateSeatingZoneDto } from '@jctop-event/shared-types';

class SeatingService {
  /**
   * Create a new seating zone for an event
   */
  async createSeatingZone(eventId: string, seatingZoneData: CreateSeatingZoneDto): Promise<SeatingZone> {
    try {
      const response = await apiClient.post<SeatingZone>(`/events/${eventId}/seating-zones`, seatingZoneData);
      return response;
    } catch (error) {
      console.error('Error creating seating zone:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create seating zone');
    }
  }

  /**
   * Update an existing seating zone
   */
  async updateSeatingZone(
    eventId: string, 
    zoneId: string, 
    seatingZoneData: CreateSeatingZoneDto
  ): Promise<SeatingZone> {
    try {
      const response = await apiClient.put<SeatingZone>(
        `/events/${eventId}/seating-zones/${zoneId}`, 
        seatingZoneData
      );
      return response;
    } catch (error) {
      console.error('Error updating seating zone:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update seating zone');
    }
  }

  /**
   * Delete a seating zone
   */
  async deleteSeatingZone(eventId: string, zoneId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/events/${eventId}/seating-zones/${zoneId}`);
    } catch (error) {
      console.error('Error deleting seating zone:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete seating zone');
    }
  }

  /**
   * Get all seating zones for an event
   */
  async getSeatingZones(eventId: string): Promise<SeatingZone[]> {
    try {
      const response = await apiClient.get<SeatingZone[]>(`/events/${eventId}/seating-zones`);
      return response;
    } catch (error) {
      console.error('Error fetching seating zones:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch seating zones');
    }
  }

  /**
   * Get a specific seating zone by ID
   */
  async getSeatingZoneById(eventId: string, zoneId: string): Promise<SeatingZone> {
    try {
      const seatingZones = await this.getSeatingZones(eventId);
      const seatingZone = seatingZones.find(sz => sz.id === zoneId);
      
      if (!seatingZone) {
        throw new Error('Seating zone not found');
      }
      
      return seatingZone;
    } catch (error) {
      console.error('Error fetching seating zone by ID:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch seating zone');
    }
  }

  /**
   * Batch create multiple seating zones for an event
   */
  async createMultipleSeatingZones(
    eventId: string, 
    seatingZonesData: CreateSeatingZoneDto[]
  ): Promise<SeatingZone[]> {
    try {
      const promises = seatingZonesData.map(seatingZoneData => 
        this.createSeatingZone(eventId, seatingZoneData)
      );
      
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error creating multiple seating zones:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create seating zones');
    }
  }

  /**
   * Calculate total seating capacity for an event
   */
  async getTotalSeatingCapacity(eventId: string): Promise<number> {
    try {
      const seatingZones = await this.getSeatingZones(eventId);
      return seatingZones.reduce((total, zone) => total + zone.capacity, 0);
    } catch (error) {
      console.error('Error calculating total seating capacity:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate seating capacity');
    }
  }

  /**
   * Calculate capacity utilization percentage against venue capacity
   */
  async getCapacityUtilization(eventId: string, venueCapacity: number): Promise<number> {
    try {
      if (venueCapacity <= 0) return 0;
      
      const totalSeatingCapacity = await this.getTotalSeatingCapacity(eventId);
      return Math.min((totalSeatingCapacity / venueCapacity) * 100, 100);
    } catch (error) {
      console.error('Error calculating capacity utilization:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate capacity utilization');
    }
  }

  /**
   * Check if seating capacity exceeds venue capacity
   */
  async isOverCapacity(eventId: string, venueCapacity: number): Promise<boolean> {
    try {
      const totalSeatingCapacity = await this.getTotalSeatingCapacity(eventId);
      return totalSeatingCapacity > venueCapacity;
    } catch (error) {
      console.error('Error checking capacity overflow:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to check capacity');
    }
  }

  /**
   * Validate seating zone data before submission
   */
  validateSeatingZone(seatingZoneData: CreateSeatingZoneDto): string[] {
    const errors: string[] = [];

    if (!seatingZoneData.name.trim()) {
      errors.push('Zone name is required');
    } else if (seatingZoneData.name.length > 255) {
      errors.push('Zone name cannot exceed 255 characters');
    }

    if (seatingZoneData.capacity < 1) {
      errors.push('Capacity must be at least 1');
    } else if (seatingZoneData.capacity > 999999) {
      errors.push('Capacity cannot exceed 999,999');
    } else if (!Number.isInteger(seatingZoneData.capacity)) {
      errors.push('Capacity must be a whole number');
    }

    return errors;
  }

  /**
   * Check for duplicate zone names within an array
   */
  validateUniqueZoneNames(seatingZones: (CreateSeatingZoneDto | SeatingZone)[]): string[] {
    const errors: string[] = [];
    const nameSet = new Set<string>();
    const duplicates = new Set<string>();

    seatingZones.forEach((zone, index) => {
      const name = zone.name.trim().toLowerCase();
      if (nameSet.has(name)) {
        duplicates.add(zone.name.trim());
      } else {
        nameSet.add(name);
      }
    });

    if (duplicates.size > 0) {
      errors.push(`Duplicate zone names found: ${Array.from(duplicates).join(', ')}`);
    }

    return errors;
  }

  /**
   * Validate seating zones against venue capacity
   */
  validateCapacityConstraints(
    seatingZones: (CreateSeatingZoneDto | SeatingZone)[], 
    venueCapacity?: number
  ): string[] {
    const errors: string[] = [];
    
    const totalCapacity = seatingZones.reduce((total, zone) => total + zone.capacity, 0);
    
    if (venueCapacity && totalCapacity > venueCapacity) {
      const excess = totalCapacity - venueCapacity;
      errors.push(
        `Total seating capacity (${totalCapacity.toLocaleString()}) exceeds venue capacity ` +
        `(${venueCapacity.toLocaleString()}) by ${excess.toLocaleString()} seats`
      );
    }
    
    return errors;
  }

  /**
   * Get seating statistics for an event
   */
  async getSeatingStatistics(eventId: string, venueCapacity?: number) {
    try {
      const seatingZones = await this.getSeatingZones(eventId);
      const totalCapacity = seatingZones.reduce((total, zone) => total + zone.capacity, 0);
      
      const statistics = {
        totalZones: seatingZones.length,
        totalCapacity,
        averageZoneCapacity: seatingZones.length > 0 ? Math.round(totalCapacity / seatingZones.length) : 0,
        largestZone: seatingZones.reduce((max, zone) => zone.capacity > max ? zone.capacity : max, 0),
        smallestZone: seatingZones.reduce((min, zone) => zone.capacity < min ? zone.capacity : min, Infinity),
        capacityUtilization: venueCapacity ? Math.min((totalCapacity / venueCapacity) * 100, 100) : null,
        isOverCapacity: venueCapacity ? totalCapacity > venueCapacity : false,
      };
      
      return statistics;
    } catch (error) {
      console.error('Error calculating seating statistics:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate seating statistics');
    }
  }
}

const seatingService = new SeatingService();
export default seatingService;