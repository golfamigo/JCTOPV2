import discountCodeService from './discountCodeService';
import apiClient from './apiClient';
import { CreateDiscountCodeDto, UpdateDiscountCodeDto, DiscountCodeResponse } from '@jctop-event/shared-types';

// Mock the API client
jest.mock('./apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

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
});