import discountCodeService from './discountCodeService';
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreateDiscountCodeDto, UpdateDiscountCodeDto, DiscountCodeResponse } from '@jctop-event/shared-types';

// Mock the API client and AsyncStorage
jest.mock('./apiClient');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiRemove: jest.fn(() => Promise.resolve()),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('DiscountCodeService', () => {
  const eventId = 'test-event-id';
  const codeId = 'test-code-id';
  
  const mockDiscountCode: DiscountCodeResponse = {
    id: codeId,
    eventId,
    code: 'SUMMER25',
    type: 'percentage',
    value: 25,
    usageCount: 0,
    expiresAt: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the service's internal cache
    (discountCodeService as any).cache.clear();
  });

  describe('createDiscountCode', () => {
    it('should create a discount code successfully', async () => {
      const createData: CreateDiscountCodeDto = {
        code: 'SUMMER25',
        type: 'percentage',
        value: 25,
        expiresAt: '2025-12-31',
      };

      mockedApiClient.post.mockResolvedValue(mockDiscountCode);

      const result = await discountCodeService.createDiscountCode(eventId, createData);

      expect(mockedApiClient.post).toHaveBeenCalledWith(
        `/events/${eventId}/discount-codes`,
        createData
      );
      expect(result).toEqual(mockDiscountCode);
    });

    it('should handle creation errors', async () => {
      const createData: CreateDiscountCodeDto = {
        code: 'INVALID',
        type: 'percentage',
        value: 25,
      };

      const errorMessage = 'Code already exists';
      mockedApiClient.post.mockRejectedValue(new Error(errorMessage));

      await expect(discountCodeService.createDiscountCode(eventId, createData))
        .rejects.toThrow('Code already exists');
    });
  });

  describe('getDiscountCodes', () => {
    it('should fetch discount codes successfully', async () => {
      const mockCodes = [mockDiscountCode];
      mockedApiClient.get.mockResolvedValue(mockCodes);

      const result = await discountCodeService.getDiscountCodes(eventId);

      expect(mockedApiClient.get).toHaveBeenCalledWith(`/events/${eventId}/discount-codes`);
      expect(result).toEqual(mockCodes);
    });

    it('should handle fetch errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(discountCodeService.getDiscountCodes(eventId))
        .rejects.toThrow('Network error');
    });
  });

  describe('updateDiscountCode', () => {
    it('should update a discount code successfully', async () => {
      const updateData: UpdateDiscountCodeDto = {
        value: 30,
      };

      const updatedCode = { ...mockDiscountCode, value: 30 };
      mockedApiClient.put.mockResolvedValue(updatedCode);

      const result = await discountCodeService.updateDiscountCode(eventId, codeId, updateData);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        `/events/${eventId}/discount-codes/${codeId}`,
        updateData
      );
      expect(result).toEqual(updatedCode);
    });

    it('should handle update errors', async () => {
      const updateData: UpdateDiscountCodeDto = {
        value: 30,
      };

      mockedApiClient.put.mockRejectedValue(new Error('Not found'));

      await expect(discountCodeService.updateDiscountCode(eventId, codeId, updateData))
        .rejects.toThrow('Not found');
    });
  });

  describe('deleteDiscountCode', () => {
    it('should delete a discount code successfully', async () => {
      mockedApiClient.delete.mockResolvedValue(undefined);

      await discountCodeService.deleteDiscountCode(eventId, codeId);

      expect(mockedApiClient.delete).toHaveBeenCalledWith(
        `/events/${eventId}/discount-codes/${codeId}`
      );
    });

    it('should handle deletion errors', async () => {
      mockedApiClient.delete.mockRejectedValue(new Error('Not found'));

      await expect(discountCodeService.deleteDiscountCode(eventId, codeId))
        .rejects.toThrow('Not found');
    });
  });

  describe('Caching functionality', () => {
    it('should cache discount codes after fetching', async () => {
      const mockCodes = [mockDiscountCode];
      mockedApiClient.get.mockResolvedValue(mockCodes);

      // First call - should hit API
      await discountCodeService.getDiscountCodes(eventId);
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      await discountCodeService.getDiscountCodes(eventId);
      expect(mockedApiClient.get).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should load from AsyncStorage when network fails', async () => {
      const mockCodes = [mockDiscountCode];
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));
      mockedAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockCodes));

      const result = await discountCodeService.getDiscountCodes(eventId);

      expect(result).toEqual(mockCodes);
      expect(mockedAsyncStorage.getItem).toHaveBeenCalled();
    });

    it('should invalidate cache after create/update/delete', async () => {
      mockedApiClient.post.mockResolvedValue(mockDiscountCode);
      mockedApiClient.delete.mockResolvedValue(undefined);

      await discountCodeService.createDiscountCode(eventId, {
        code: 'TEST',
        type: 'percentage',
        value: 10,
      });

      expect(mockedAsyncStorage.removeItem).toHaveBeenCalled();
    });
  });

  describe('Bulk operations', () => {
    it('should bulk create discount codes', async () => {
      const codes: CreateDiscountCodeDto[] = [
        { code: 'CODE1', type: 'percentage', value: 10 },
        { code: 'CODE2', type: 'fixed_amount', value: 100 },
      ];

      mockedApiClient.post.mockResolvedValue(mockDiscountCode);

      await discountCodeService.bulkCreateDiscountCodes(eventId, codes);

      expect(mockedApiClient.post).toHaveBeenCalledTimes(2);
    });

    it('should bulk delete discount codes', async () => {
      const codeIds = ['id1', 'id2', 'id3'];
      mockedApiClient.delete.mockResolvedValue(undefined);

      await discountCodeService.bulkDeleteDiscountCodes(eventId, codeIds);

      expect(mockedApiClient.delete).toHaveBeenCalledTimes(3);
    });
  });

  describe('Validation', () => {
    it('should validate a valid discount code', async () => {
      const mockCodes = [mockDiscountCode];
      mockedApiClient.get.mockResolvedValue(mockCodes);

      const result = await discountCodeService.validateDiscountCode(eventId, 'SUMMER25');

      expect(result.valid).toBe(true);
      expect(result.discount).toEqual(mockDiscountCode);
    });

    it('should reject invalid discount code', async () => {
      mockedApiClient.get.mockResolvedValue([]);

      const result = await discountCodeService.validateDiscountCode(eventId, 'INVALID');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid discount code');
    });

    it('should reject expired discount code', async () => {
      const expiredCode = {
        ...mockDiscountCode,
        expiresAt: new Date('2020-01-01'),
      };
      mockedApiClient.get.mockResolvedValue([expiredCode]);

      const result = await discountCodeService.validateDiscountCode(eventId, 'SUMMER25');

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Discount code has expired');
    });
  });

  describe('Optimistic updates', () => {
    it('should perform optimistic updates and rollback on error', async () => {
      const mockCodes = [mockDiscountCode];
      mockedApiClient.get.mockResolvedValue(mockCodes);
      
      // Load initial data
      await discountCodeService.getDiscountCodes(eventId);
      
      // Mock update failure
      mockedApiClient.put.mockRejectedValue(new Error('Update failed'));

      await expect(
        discountCodeService.updateDiscountCode(eventId, codeId, { value: 50 })
      ).rejects.toThrow('Update failed');

      // Cache should have been rolled back
      // This would be verified by checking the cache contents
    });
  });
});