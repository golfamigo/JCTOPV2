import eventService from './eventService';
import apiClient from './apiClient';
import { CreateEventDto, Category, Venue, Event, PaginatedEventsResponse, EventWithRelations } from '@jctop-event/shared-types';

// Mock the apiClient
jest.mock('./apiClient');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    const mockCreateEventDto: CreateEventDto = {
      title: 'Test Event',
      description: 'Test Description',
      startDate: '2025-12-01T10:00:00Z',
      endDate: '2025-12-01T18:00:00Z',
      location: 'Test Location',
      categoryId: '123e4567-e89b-12d3-a456-426614174000',
      venueId: '123e4567-e89b-12d3-a456-426614174001',
    };

    const mockEventResponse = {
      id: '123e4567-e89b-12d3-a456-426614174002',
      organizerId: '123e4567-e89b-12d3-a456-426614174003',
      categoryId: mockCreateEventDto.categoryId,
      venueId: mockCreateEventDto.venueId,
      title: mockCreateEventDto.title,
      description: mockCreateEventDto.description!,
      startDate: mockCreateEventDto.startDate,
      endDate: mockCreateEventDto.endDate,
      location: mockCreateEventDto.location,
      status: 'draft' as const,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('should create an event successfully', async () => {
      mockApiClient.post.mockResolvedValue(mockEventResponse);

      const result = await eventService.createEvent(mockCreateEventDto);

      expect(mockApiClient.post).toHaveBeenCalledWith('/events', mockCreateEventDto);
      expect(result).toEqual(mockEventResponse);
    });

    it('should handle API errors during event creation', async () => {
      const errorMessage = 'Validation failed';
      mockApiClient.post.mockRejectedValue(new Error(errorMessage));

      await expect(eventService.createEvent(mockCreateEventDto)).rejects.toThrow(
        'Validation failed'
      );

      expect(mockApiClient.post).toHaveBeenCalledWith('/events', mockCreateEventDto);
    });

    it('should handle unknown errors during event creation', async () => {
      mockApiClient.post.mockRejectedValue('Unknown error');

      await expect(eventService.createEvent(mockCreateEventDto)).rejects.toThrow(
        'Failed to create event'
      );
    });
  });

  describe('getCategories', () => {
    const mockCategories: Category[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Conference',
        description: 'Professional conferences',
        color: '#2563EB',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Workshop',
        description: 'Hands-on workshops',
        color: '#10B981',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should fetch categories successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockCategories);

      const result = await eventService.getCategories();

      expect(mockApiClient.get).toHaveBeenCalledWith('/categories');
      expect(result).toEqual(mockCategories);
    });

    it('should handle API errors when fetching categories', async () => {
      const errorMessage = 'Network error';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(eventService.getCategories()).rejects.toThrow(
        'Network error'
      );
    });

    it('should handle unknown errors when fetching categories', async () => {
      mockApiClient.get.mockRejectedValue('Unknown error');

      await expect(eventService.getCategories()).rejects.toThrow(
        'Failed to fetch categories'
      );
    });
  });

  describe('getVenues', () => {
    const mockVenues: Venue[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Convention Center',
        address: '123 Main St',
        city: 'New York',
        capacity: 500,
        description: 'Large convention center',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Hotel Ballroom',
        address: '456 Hotel Ave',
        city: 'New York',
        capacity: 200,
        description: 'Elegant hotel ballroom',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should fetch venues successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockVenues);

      const result = await eventService.getVenues();

      expect(mockApiClient.get).toHaveBeenCalledWith('/venues');
      expect(result).toEqual(mockVenues);
    });

    it('should handle API errors when fetching venues', async () => {
      const errorMessage = 'Database connection failed';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(eventService.getVenues()).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle unknown errors when fetching venues', async () => {
      mockApiClient.get.mockRejectedValue('Unknown error');

      await expect(eventService.getVenues()).rejects.toThrow(
        'Failed to fetch venues'
      );
    });
  });

  describe('getMyEvents', () => {
    const mockEvents: Event[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        organizerId: '123e4567-e89b-12d3-a456-426614174001',
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        venueId: '123e4567-e89b-12d3-a456-426614174003',
        title: 'My Event 1',
        description: 'First event',
        startDate: new Date('2025-12-01T10:00:00Z'),
        endDate: new Date('2025-12-01T18:00:00Z'),
        location: 'Location 1',
        status: 'draft',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should fetch user events successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockEvents);

      const result = await eventService.getMyEvents();

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/my');
      expect(result).toEqual(mockEvents);
    });

    it('should handle API errors when fetching user events', async () => {
      const errorMessage = 'Unauthorized';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(eventService.getMyEvents()).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('getEventById', () => {
    const eventId = '123e4567-e89b-12d3-a456-426614174000';
    const mockEvent: Event = {
      id: eventId,
      organizerId: '123e4567-e89b-12d3-a456-426614174001',
      categoryId: '123e4567-e89b-12d3-a456-426614174002',
      venueId: '123e4567-e89b-12d3-a456-426614174003',
      title: 'Single Event',
      description: 'Event description',
      startDate: new Date('2025-12-01T10:00:00Z'),
      endDate: new Date('2025-12-01T18:00:00Z'),
      location: 'Event Location',
      status: 'published',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    };

    it('should fetch event by ID successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockEvent);

      const result = await eventService.getEventById(eventId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/events/${eventId}`);
      expect(result).toEqual(mockEvent);
    });

    it('should handle API errors when fetching event by ID', async () => {
      const errorMessage = 'Event not found';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(eventService.getEventById(eventId)).rejects.toThrow(
        'Event not found'
      );
    });

    it('should handle unknown errors when fetching event by ID', async () => {
      mockApiClient.get.mockRejectedValue('Unknown error');

      await expect(eventService.getEventById(eventId)).rejects.toThrow(
        'Failed to fetch event'
      );
    });
  });

  describe('getPublicEvents', () => {
    const mockEventWithRelations: EventWithRelations = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      organizerId: '123e4567-e89b-12d3-a456-426614174001',
      categoryId: '123e4567-e89b-12d3-a456-426614174002',
      venueId: '123e4567-e89b-12d3-a456-426614174003',
      title: 'Public Event 1',
      description: 'Public event description',
      startDate: new Date('2025-12-01T10:00:00Z'),
      endDate: new Date('2025-12-01T18:00:00Z'),
      location: 'Public Location',
      status: 'published',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
      category: {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Music',
        description: 'Music events',
        color: '#2563EB',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      venue: {
        id: '123e4567-e89b-12d3-a456-426614174003',
        name: 'Concert Hall',
        address: '123 Music St',
        city: 'Music City',
        capacity: 500,
        description: 'A great concert hall',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      ticketTypes: [
        {
          id: 'ticket-1',
          eventId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'General Admission',
          price: 25.00,
          quantity: 100,
        },
      ],
    };

    const mockPaginatedResponse: PaginatedEventsResponse = {
      data: [mockEventWithRelations],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('should fetch paginated public events with default parameters', async () => {
      mockApiClient.get.mockResolvedValue(mockPaginatedResponse);

      const result = await eventService.getPublicEvents();

      expect(mockApiClient.get).toHaveBeenCalledWith('/events?page=1&limit=10');
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should fetch paginated public events with custom parameters', async () => {
      const customResponse = {
        ...mockPaginatedResponse,
        pagination: {
          page: 2,
          limit: 5,
          total: 15,
          totalPages: 3,
        },
      };
      mockApiClient.get.mockResolvedValue(customResponse);

      const result = await eventService.getPublicEvents(2, 5);

      expect(mockApiClient.get).toHaveBeenCalledWith('/events?page=2&limit=5');
      expect(result).toEqual(customResponse);
    });

    it('should validate page parameter', async () => {
      await expect(eventService.getPublicEvents(0, 10)).rejects.toThrow(
        'Page must be a positive integer'
      );

      await expect(eventService.getPublicEvents(-1, 10)).rejects.toThrow(
        'Page must be a positive integer'
      );
    });

    it('should validate limit parameter', async () => {
      await expect(eventService.getPublicEvents(1, 0)).rejects.toThrow(
        'Limit must be between 1 and 50'
      );

      await expect(eventService.getPublicEvents(1, 51)).rejects.toThrow(
        'Limit must be between 1 and 50'
      );
    });

    it('should handle API errors when fetching public events', async () => {
      const errorMessage = 'Server error';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(eventService.getPublicEvents()).rejects.toThrow(
        'Server error'
      );
    });

    it('should handle unknown errors when fetching public events', async () => {
      mockApiClient.get.mockRejectedValue('Unknown error');

      await expect(eventService.getPublicEvents()).rejects.toThrow(
        'Failed to fetch public events'
      );
    });
  });

  describe('getAllPublicEvents', () => {
    const mockPublicEvents: Event[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        organizerId: '123e4567-e89b-12d3-a456-426614174001',
        categoryId: '123e4567-e89b-12d3-a456-426614174002',
        venueId: '123e4567-e89b-12d3-a456-426614174003',
        title: 'Public Event 1',
        description: 'Public event description',
        startDate: new Date('2025-12-01T10:00:00Z'),
        endDate: new Date('2025-12-01T18:00:00Z'),
        location: 'Public Location',
        status: 'published',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z'),
      },
    ];

    it('should fetch all public events successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockPublicEvents);

      const result = await eventService.getAllPublicEvents();

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/public');
      expect(result).toEqual(mockPublicEvents);
    });

    it('should handle API errors when fetching all public events', async () => {
      const errorMessage = 'Network error';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(eventService.getAllPublicEvents()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getPublicEventById', () => {
    const eventId = '123e4567-e89b-12d3-a456-426614174000';
    const mockPublicEvent: Event = {
      id: eventId,
      organizerId: '123e4567-e89b-12d3-a456-426614174001',
      categoryId: '123e4567-e89b-12d3-a456-426614174002',
      venueId: '123e4567-e89b-12d3-a456-426614174003',
      title: 'Public Event',
      description: 'Public event description',
      startDate: new Date('2025-12-01T10:00:00Z'),
      endDate: new Date('2025-12-01T18:00:00Z'),
      location: 'Public Location',
      status: 'published',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    };

    it('should fetch public event by ID successfully', async () => {
      mockApiClient.get.mockResolvedValue(mockPublicEvent);

      const result = await eventService.getPublicEventById(eventId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/events/public/${eventId}`);
      expect(result).toEqual(mockPublicEvent);
    });

    it('should handle API errors when fetching public event by ID', async () => {
      const errorMessage = 'Event not found or not published';
      mockApiClient.get.mockRejectedValue(new Error(errorMessage));

      await expect(eventService.getPublicEventById(eventId)).rejects.toThrow(
        'Event not found or not published'
      );
    });

    it('should handle unknown errors when fetching public event by ID', async () => {
      mockApiClient.get.mockRejectedValue('Unknown error');

      await expect(eventService.getPublicEventById(eventId)).rejects.toThrow(
        'Failed to fetch public event'
      );
    });
  });
});