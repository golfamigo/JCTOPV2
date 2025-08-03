import seatingService from './seatingService';
import apiClient from './apiClient';
import { CreateSeatingZoneDto, SeatingZone } from '@jctop-event/shared-types';

// Mock the apiClient
jest.mock('./apiClient');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('SeatingService', () => {
  const eventId = '123e4567-e89b-12d3-a456-426614174000';
  const zoneId = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSeatingZone', () => {
    const mockCreateSeatingZoneDto: CreateSeatingZoneDto = {
      name: 'VIP Section',
      capacity: 50,
      description: 'Premium seating area',
    };

    const mockSeatingZoneResponse: SeatingZone = {
      id: zoneId,
      eventId,
      ...mockCreateSeatingZoneDto,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    };

    it('should create a seating zone successfully', async () => {
      mockApiClient.post.mockResolvedValue(mockSeatingZoneResponse);

      const result = await seatingService.createSeatingZone(eventId, mockCreateSeatingZoneDto);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/events/${eventId}/seating-zones`, 
        mockCreateSeatingZoneDto
      );
      expect(result).toEqual(mockSeatingZoneResponse);
    });

    it('should handle API errors during seating zone creation', async () => {
      const errorMessage = 'Validation failed';
      mockApiClient.post.mockRejectedValue(new Error(errorMessage));

      await expect(seatingService.createSeatingZone(eventId, mockCreateSeatingZoneDto))
        .rejects.toThrow('Validation failed');
    });
  });

  describe('updateSeatingZone', () => {
    const mockUpdateSeatingZoneDto: CreateSeatingZoneDto = {
      name: 'Premium VIP Section',
      capacity: 75,
      description: 'Updated premium seating area',
    };

    const mockUpdatedSeatingZone: SeatingZone = {
      id: zoneId,
      eventId,
      ...mockUpdateSeatingZoneDto,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T01:00:00Z'),
    };

    it('should update a seating zone successfully', async () => {
      mockApiClient.put.mockResolvedValue(mockUpdatedSeatingZone);

      const result = await seatingService.updateSeatingZone(eventId, zoneId, mockUpdateSeatingZoneDto);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        `/events/${eventId}/seating-zones/${zoneId}`, 
        mockUpdateSeatingZoneDto
      );
      expect(result).toEqual(mockUpdatedSeatingZone);
    });

    it('should handle API errors during seating zone update', async () => {
      const errorMessage = 'Seating zone not found';
      mockApiClient.put.mockRejectedValue(new Error(errorMessage));

      await expect(seatingService.updateSeatingZone(eventId, zoneId, mockUpdateSeatingZoneDto))
        .rejects.toThrow('Seating zone not found');
    });
  });

  describe('deleteSeatingZone', () => {
    it('should delete a seating zone successfully', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await seatingService.deleteSeatingZone(eventId, zoneId);

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        `/events/${eventId}/seating-zones/${zoneId}`
      );
    });

    it('should handle API errors during seating zone deletion', async () => {
      const errorMessage = 'Seating zone not found';
      mockApiClient.delete.mockRejectedValue(new Error(errorMessage));

      await expect(seatingService.deleteSeatingZone(eventId, zoneId))
        .rejects.toThrow('Seating zone not found');
    });
  });

  describe('getSeatingZones', () => {
    const mockSeatingZones: SeatingZone[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        eventId,
        name: 'VIP Section',
        capacity: 50,
        description: 'Premium seating',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        eventId,
        name: 'General Admission',
        capacity: 200,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should fetch seating zones successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.getSeatingZones(eventId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/events/${eventId}/seating-zones`);
      expect(result).toEqual(mockSeatingZones);
    });

    it('should handle API errors during seating zones fetch', async () => {
      const errorMessage = 'Event not found';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(seatingService.getSeatingZones(eventId))
        .rejects.toThrow('Event not found');
    });
  });

  describe('getSeatingZoneById', () => {
    const mockSeatingZones: SeatingZone[] = [
      {
        id: zoneId,
        eventId,
        name: 'VIP Section',
        capacity: 50,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should fetch a specific seating zone successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.getSeatingZoneById(eventId, zoneId);

      expect(result).toEqual(mockSeatingZones[0]);
    });

    it('should throw error when seating zone not found', async () => {
      mockApiClient.get.mockResolvedValue([]);

      await expect(seatingService.getSeatingZoneById(eventId, zoneId))
        .rejects.toThrow('Seating zone not found');
    });
  });

  describe('createMultipleSeatingZones', () => {
    const mockSeatingZonesData: CreateSeatingZoneDto[] = [
      { name: 'Orchestra', capacity: 100, description: 'Main floor' },
      { name: 'Balcony', capacity: 75, description: 'Upper level' },
    ];

    const mockCreatedSeatingZones: SeatingZone[] = [
      { 
        id: '1', 
        eventId, 
        ...mockSeatingZonesData[0],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      { 
        id: '2', 
        eventId, 
        ...mockSeatingZonesData[1],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should create multiple seating zones successfully', async () => {
      mockApiClient.post
        .mockResolvedValueOnce(mockCreatedSeatingZones[0])
        .mockResolvedValueOnce(mockCreatedSeatingZones[1]);

      const result = await seatingService.createMultipleSeatingZones(eventId, mockSeatingZonesData);

      expect(mockApiClient.post).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockCreatedSeatingZones);
    });
  });

  describe('getTotalSeatingCapacity', () => {
    const mockSeatingZones: SeatingZone[] = [
      { 
        id: '1', 
        eventId, 
        name: 'Zone 1', 
        capacity: 100,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      { 
        id: '2', 
        eventId, 
        name: 'Zone 2', 
        capacity: 50,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should calculate total seating capacity correctly', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.getTotalSeatingCapacity(eventId);

      expect(result).toBe(150);
    });
  });

  describe('getCapacityUtilization', () => {
    const mockSeatingZones: SeatingZone[] = [
      { 
        id: '1', 
        eventId, 
        name: 'Zone 1', 
        capacity: 75,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should calculate capacity utilization correctly', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.getCapacityUtilization(eventId, 100);

      expect(result).toBe(75);
    });

    it('should return 0 for zero venue capacity', async () => {
      const result = await seatingService.getCapacityUtilization(eventId, 0);

      expect(result).toBe(0);
    });

    it('should cap utilization at 100%', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.getCapacityUtilization(eventId, 50);

      expect(result).toBe(100);
    });
  });

  describe('isOverCapacity', () => {
    const mockSeatingZones: SeatingZone[] = [
      { 
        id: '1', 
        eventId, 
        name: 'Zone 1', 
        capacity: 150,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should return true when over capacity', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.isOverCapacity(eventId, 100);

      expect(result).toBe(true);
    });

    it('should return false when within capacity', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.isOverCapacity(eventId, 200);

      expect(result).toBe(false);
    });
  });

  describe('validateSeatingZone', () => {
    it('should return no errors for valid seating zone data', () => {
      const validData: CreateSeatingZoneDto = {
        name: 'Valid Zone',
        capacity: 100,
        description: 'Valid description',
      };

      const errors = seatingService.validateSeatingZone(validData);

      expect(errors).toHaveLength(0);
    });

    it('should return errors for invalid seating zone data', () => {
      const invalidData: CreateSeatingZoneDto = {
        name: '',
        capacity: 0,
      };

      const errors = seatingService.validateSeatingZone(invalidData);

      expect(errors).toContain('Zone name is required');
      expect(errors).toContain('Capacity must be at least 1');
    });

    it('should validate maximum constraints', () => {
      const invalidData: CreateSeatingZoneDto = {
        name: 'a'.repeat(256),
        capacity: 1000000,
      };

      const errors = seatingService.validateSeatingZone(invalidData);

      expect(errors).toContain('Zone name cannot exceed 255 characters');
      expect(errors).toContain('Capacity cannot exceed 999,999');
    });

    it('should validate integer capacity', () => {
      const invalidData: CreateSeatingZoneDto = {
        name: 'Test Zone',
        capacity: 10.5,
      };

      const errors = seatingService.validateSeatingZone(invalidData);

      expect(errors).toContain('Capacity must be a whole number');
    });
  });

  describe('validateUniqueZoneNames', () => {
    it('should return no errors for unique names', () => {
      const seatingZones: CreateSeatingZoneDto[] = [
        { name: 'Orchestra', capacity: 100 },
        { name: 'Balcony', capacity: 75 },
      ];

      const errors = seatingService.validateUniqueZoneNames(seatingZones);

      expect(errors).toHaveLength(0);
    });

    it('should return errors for duplicate names', () => {
      const seatingZones: CreateSeatingZoneDto[] = [
        { name: 'VIP', capacity: 50 },
        { name: 'VIP', capacity: 25 },
      ];

      const errors = seatingService.validateUniqueZoneNames(seatingZones);

      expect(errors).toContain('Duplicate zone names found: VIP');
    });

    it('should be case insensitive when checking duplicates', () => {
      const seatingZones: CreateSeatingZoneDto[] = [
        { name: 'vip', capacity: 50 },
        { name: 'VIP', capacity: 25 },
      ];

      const errors = seatingService.validateUniqueZoneNames(seatingZones);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateCapacityConstraints', () => {
    it('should return no errors when within venue capacity', () => {
      const seatingZones: CreateSeatingZoneDto[] = [
        { name: 'Zone 1', capacity: 50 },
        { name: 'Zone 2', capacity: 25 },
      ];

      const errors = seatingService.validateCapacityConstraints(seatingZones, 100);

      expect(errors).toHaveLength(0);
    });

    it('should return errors when exceeding venue capacity', () => {
      const seatingZones: CreateSeatingZoneDto[] = [
        { name: 'Zone 1', capacity: 75 },
        { name: 'Zone 2', capacity: 50 },
      ];

      const errors = seatingService.validateCapacityConstraints(seatingZones, 100);

      expect(errors).toContain(
        'Total seating capacity (125) exceeds venue capacity (100) by 25 seats'
      );
    });

    it('should return no errors when venue capacity is not provided', () => {
      const seatingZones: CreateSeatingZoneDto[] = [
        { name: 'Zone 1', capacity: 1000 },
      ];

      const errors = seatingService.validateCapacityConstraints(seatingZones);

      expect(errors).toHaveLength(0);
    });
  });

  describe('getSeatingStatistics', () => {
    const mockSeatingZones: SeatingZone[] = [
      { 
        id: '1', 
        eventId, 
        name: 'Zone 1', 
        capacity: 100,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      { 
        id: '2', 
        eventId, 
        name: 'Zone 2', 
        capacity: 50,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should calculate seating statistics correctly', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.getSeatingStatistics(eventId, 200);

      expect(result).toEqual({
        totalZones: 2,
        totalCapacity: 150,
        averageZoneCapacity: 75,
        largestZone: 100,
        smallestZone: 50,
        capacityUtilization: 75,
        isOverCapacity: false,
      });
    });

    it('should handle statistics without venue capacity', async () => {
      mockApiClient.get.mockResolvedValue(mockSeatingZones);

      const result = await seatingService.getSeatingStatistics(eventId);

      expect(result.capacityUtilization).toBeNull();
      expect(result.isOverCapacity).toBe(false);
    });

    it('should handle empty seating zones', async () => {
      mockApiClient.get.mockResolvedValue([]);

      const result = await seatingService.getSeatingStatistics(eventId, 100);

      expect(result).toEqual({
        totalZones: 0,
        totalCapacity: 0,
        averageZoneCapacity: 0,
        largestZone: 0,
        smallestZone: Infinity,
        capacityUtilization: 0,
        isOverCapacity: false,
      });
    });
  });
});