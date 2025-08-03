import { attendeeSearchService, AttendeeSearchParams } from './attendeeSearchService';
import { apiClient } from './apiClient';

jest.mock('./apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AttendeeSearchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('searchAttendees', () => {
    const eventId = 'event-123';
    const mockSearchResponse = {
      attendees: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          registrationId: 'REG-001',
          status: 'paid' as const,
          ticketType: 'General Admission',
        },
      ],
      total: 1,
      limit: 20,
      offset: 0,
    };

    it('should search attendees successfully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockSearchResponse),
      } as any;

      mockApiClient.get.mockResolvedValue(mockResponse);

      const params: AttendeeSearchParams = { query: 'John' };
      const result = await attendeeSearchService.searchAttendees(eventId, params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/v1/events/${eventId}/attendees/search?query=John`
      );
      expect(result).toEqual(mockSearchResponse);
    });

    it('should include pagination parameters when provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockSearchResponse),
      } as any;

      mockApiClient.get.mockResolvedValue(mockResponse);

      const params: AttendeeSearchParams = {
        query: 'John',
        limit: 10,
        offset: 20,
      };

      await attendeeSearchService.searchAttendees(eventId, params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        `/api/v1/events/${eventId}/attendees/search?query=John&limit=10&offset=20`
      );
    });

    it('should throw error when API request fails', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as any;

      mockApiClient.get.mockResolvedValue(mockResponse);

      const params: AttendeeSearchParams = { query: 'John' };

      await expect(
        attendeeSearchService.searchAttendees(eventId, params)
      ).rejects.toThrow('Search failed: 404 Not Found');
    });

    it('should handle network errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      const params: AttendeeSearchParams = { query: 'John' };

      await expect(
        attendeeSearchService.searchAttendees(eventId, params)
      ).rejects.toThrow('Failed to search attendees: Network error');
    });
  });

  describe('manualCheckIn', () => {
    const eventId = 'event-123';
    const registrationId = 'REG-001';

    it('should check in attendee successfully', async () => {
      const mockCheckInResponse = {
        attendee: {
          name: 'John Doe',
          email: 'john@example.com',
          ticketType: 'General Admission',
        },
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockCheckInResponse),
      } as any;

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await attendeeSearchService.manualCheckIn(eventId, registrationId);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        `/api/v1/events/${eventId}/checkin`,
        {
          registrationId,
          manual: true,
        }
      );
      expect(result.success).toBe(true);
      expect(result.attendee).toEqual(mockCheckInResponse.attendee);
    });

    it('should handle check-in failure', async () => {
      const mockErrorResponse = {
        message: 'Already checked in',
        errorCode: 'ALREADY_CHECKED_IN',
      };

      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: jest.fn().mockResolvedValue(mockErrorResponse),
      } as any;

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await attendeeSearchService.manualCheckIn(eventId, registrationId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Already checked in');
      expect(result.errorCode).toBe('ALREADY_CHECKED_IN');
    });

    it('should handle network errors during check-in', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      const result = await attendeeSearchService.manualCheckIn(eventId, registrationId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Manual check-in failed: Network error');
    });
  });

  describe('getAttendeeByRegistrationId', () => {
    const eventId = 'event-123';
    const registrationId = 'REG-001';

    it('should find attendee by registration ID', async () => {
      const mockSearchResponse = {
        attendees: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            registrationId: 'REG-001',
            status: 'paid' as const,
            ticketType: 'General Admission',
          },
        ],
        total: 1,
        limit: 1,
        offset: 0,
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockSearchResponse),
      } as any;

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await attendeeSearchService.getAttendeeByRegistrationId(
        eventId,
        registrationId
      );

      expect(result).toEqual(mockSearchResponse.attendees[0]);
    });

    it('should return null when attendee not found', async () => {
      const mockSearchResponse = {
        attendees: [],
        total: 0,
        limit: 1,
        offset: 0,
      };

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockSearchResponse),
      } as any;

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await attendeeSearchService.getAttendeeByRegistrationId(
        eventId,
        registrationId
      );

      expect(result).toBeNull();
    });
  });

  describe('validateSearchQuery', () => {
    it('should validate correct queries', () => {
      expect(attendeeSearchService.validateSearchQuery('John')).toEqual({ valid: true });
      expect(attendeeSearchService.validateSearchQuery('REG-001')).toEqual({ valid: true });
      expect(attendeeSearchService.validateSearchQuery('john@example.com')).toEqual({ valid: true });
    });

    it('should reject empty queries', () => {
      expect(attendeeSearchService.validateSearchQuery('')).toEqual({
        valid: false,
        error: 'Search query cannot be empty',
      });
      expect(attendeeSearchService.validateSearchQuery('   ')).toEqual({
        valid: false,
        error: 'Search query cannot be empty',
      });
    });

    it('should reject queries that are too short', () => {
      expect(attendeeSearchService.validateSearchQuery('J')).toEqual({
        valid: false,
        error: 'Search query must be at least 2 characters long',
      });
    });

    it('should reject queries that are too long', () => {
      const longQuery = 'a'.repeat(101);
      expect(attendeeSearchService.validateSearchQuery(longQuery)).toEqual({
        valid: false,
        error: 'Search query is too long (maximum 100 characters)',
      });
    });
  });
});