import registrationService from './registrationService';
import apiClient from './apiClient';

// Mock the apiClient
jest.mock('./apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('RegistrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomFields', () => {
    it('should fetch custom fields for an event', async () => {
      const mockFields = [
        {
          id: 'field-1',
          eventId: 'event-1',
          fieldName: 'full_name',
          fieldType: 'text' as const,
          label: 'Full Name',
          required: true,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockedApiClient.get.mockResolvedValue({ fields: mockFields });

      const result = await registrationService.getCustomFields('event-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/events/event-1/registration-fields');
      expect(result).toEqual(mockFields);
    });

    it('should handle API errors', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('API Error'));

      await expect(registrationService.getCustomFields('event-1')).rejects.toThrow('API Error');
    });
  });

  describe('validateDiscountCode', () => {
    it('should validate a discount code successfully', async () => {
      const mockResponse = {
        valid: true,
        discountAmount: 10,
        finalAmount: 90,
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await registrationService.validateDiscountCode('event-1', 'DISCOUNT10', 100);

      expect(mockedApiClient.post).toHaveBeenCalledWith('/events/event-1/validate-discount', {
        code: 'DISCOUNT10',
        totalAmount: 100,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle invalid discount code', async () => {
      const mockResponse = {
        valid: false,
        discountAmount: 0,
        finalAmount: 100,
        errorMessage: 'Invalid discount code',
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await registrationService.validateDiscountCode('event-1', 'INVALID', 100);

      expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
      mockedApiClient.post.mockRejectedValue(new Error('API Error'));

      await expect(registrationService.validateDiscountCode('event-1', 'CODE', 100)).rejects.toThrow('API Error');
    });
  });
});