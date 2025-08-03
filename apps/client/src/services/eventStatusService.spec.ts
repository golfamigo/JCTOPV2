import eventStatusService from './eventStatusService';
import apiClient from './apiClient';
import { UpdateEventStatusDto, EventStatusChangeDto } from '@jctop-event/shared-types';

// Mock the apiClient
jest.mock('./apiClient');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('EventStatusService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateEventStatus', () => {
    it('should update event status successfully', async () => {
      const mockResponse = {
        id: 'event-1',
        organizerId: 'user-1',
        categoryId: 'cat-1',
        venueId: 'venue-1',
        title: 'Test Event',
        description: 'Test Description',
        startDate: '2025-08-01T10:00:00Z',
        endDate: '2025-08-01T18:00:00Z',
        location: 'Test Location',
        status: 'published' as const,
        createdAt: '2025-07-31T10:00:00Z',
        updatedAt: '2025-07-31T10:30:00Z',
      };

      mockedApiClient.put.mockResolvedValue(mockResponse);

      const result = await eventStatusService.updateEventStatus('event-1', 'published');

      expect(mockedApiClient.put).toHaveBeenCalledWith('/events/event-1/status', {
        status: 'published',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include reason when provided', async () => {
      const mockResponse = {
        id: 'event-1',
        status: 'paused' as const,
      } as any;

      mockedApiClient.put.mockResolvedValue(mockResponse);

      await eventStatusService.updateEventStatus('event-1', 'paused', 'Technical maintenance');

      expect(mockedApiClient.put).toHaveBeenCalledWith('/events/event-1/status', {
        status: 'paused',
        reason: 'Technical maintenance',
      });
    });

    it('should throw error when API call fails', async () => {
      mockedApiClient.put.mockRejectedValue(new Error('API Error'));

      await expect(
        eventStatusService.updateEventStatus('event-1', 'published')
      ).rejects.toThrow('Failed to update event status');
    });
  });

  describe('getEventStatusHistory', () => {
    it('should fetch event status history successfully', async () => {
      const mockHistory: EventStatusChangeDto[] = [
        {
          eventId: 'event-1',
          previousStatus: 'draft',
          newStatus: 'published',
          changedBy: 'user-1',
          changedAt: new Date('2025-07-31T10:00:00Z'),
          reason: 'Ready for public',
        },
      ];

      mockedApiClient.get.mockResolvedValue(mockHistory);

      const result = await eventStatusService.getEventStatusHistory('event-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/events/event-1/status-history');
      expect(result).toEqual(mockHistory);
    });

    it('should throw error when API call fails', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('API Error'));

      await expect(
        eventStatusService.getEventStatusHistory('event-1')
      ).rejects.toThrow('Failed to fetch event status history');
    });
  });

  describe('getPublicEvents', () => {
    it('should fetch public events successfully', async () => {
      const mockEvents = [
        {
          id: 'event-1',
          status: 'published' as const,
          title: 'Public Event 1',
        },
        {
          id: 'event-2',
          status: 'published' as const,
          title: 'Public Event 2',
        },
      ] as any[];

      mockedApiClient.get.mockResolvedValue(mockEvents);

      const result = await eventStatusService.getPublicEvents();

      expect(mockedApiClient.get).toHaveBeenCalledWith('/events/public');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getPublicEvent', () => {
    it('should fetch a specific public event successfully', async () => {
      const mockEvent = {
        id: 'event-1',
        status: 'published' as const,
        title: 'Public Event',
      } as any;

      mockedApiClient.get.mockResolvedValue(mockEvent);

      const result = await eventStatusService.getPublicEvent('event-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/events/public/event-1');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('getEventById', () => {
    it('should fetch event by ID successfully', async () => {
      const mockEvent = {
        id: 'event-1',
        status: 'draft' as const,
        title: 'Private Event',
      } as any;

      mockedApiClient.get.mockResolvedValue(mockEvent);

      const result = await eventStatusService.getEventById('event-1');

      expect(mockedApiClient.get).toHaveBeenCalledWith('/events/event-1');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('isValidStatusTransition', () => {
    it('should return true for valid transitions', () => {
      expect(eventStatusService.isValidStatusTransition('draft', 'published')).toBe(true);
      expect(eventStatusService.isValidStatusTransition('published', 'paused')).toBe(true);
      expect(eventStatusService.isValidStatusTransition('published', 'unpublished')).toBe(true);
      expect(eventStatusService.isValidStatusTransition('published', 'ended')).toBe(true);
      expect(eventStatusService.isValidStatusTransition('paused', 'published')).toBe(true);
      expect(eventStatusService.isValidStatusTransition('unpublished', 'published')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(eventStatusService.isValidStatusTransition('draft', 'paused')).toBe(false);
      expect(eventStatusService.isValidStatusTransition('draft', 'ended')).toBe(false);
      expect(eventStatusService.isValidStatusTransition('ended', 'published')).toBe(false);
      expect(eventStatusService.isValidStatusTransition('ended', 'draft')).toBe(false);
    });
  });

  describe('getAvailableTransitions', () => {
    it('should return correct available transitions for each status', () => {
      expect(eventStatusService.getAvailableTransitions('draft')).toEqual(['published']);
      expect(eventStatusService.getAvailableTransitions('published')).toEqual([
        'unpublished',
        'paused',
        'ended',
      ]);
      expect(eventStatusService.getAvailableTransitions('unpublished')).toEqual([
        'published',
        'ended',
      ]);
      expect(eventStatusService.getAvailableTransitions('paused')).toEqual(['published', 'ended']);
      expect(eventStatusService.getAvailableTransitions('ended')).toEqual([]);
    });
  });
});