import apiClient from './apiClient';
import { Event, CreateEventDto, Category, Venue, TicketType, SeatingZone, PaginatedEventsResponse } from '@jctop-event/shared-types';
import ticketService from './ticketService';
import seatingService from './seatingService';

export interface EventCreateResponse {
  id: string;
  organizerId: string;
  categoryId: string;
  venueId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';
  createdAt: string;
  updatedAt: string;
}

class EventService {
  /**
   * Create a new event
   */
  async createEvent(eventData: CreateEventDto): Promise<EventCreateResponse> {
    try {
      const response = await apiClient.post<EventCreateResponse>('/events', eventData);
      return response;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create event');
    }
  }

  /**
   * Create a new event with tickets and seating configuration
   */
  async createEventWithConfiguration(
    eventData: CreateEventDto, 
    ticketTypes: TicketType[], 
    seatingZones: SeatingZone[]
  ): Promise<{ event: EventCreateResponse; ticketTypes: TicketType[]; seatingZones: SeatingZone[] }> {
    try {
      // First create the event
      const event = await this.createEvent(eventData);

      // Then create ticket types and seating zones in parallel
      const [createdTicketTypes, createdSeatingZones] = await Promise.all([
        ticketService.createMultipleTicketTypes(event.id, ticketTypes.map(tt => ({
          name: tt.name,
          price: tt.price,
          quantity: tt.quantity,
        }))),
        seatingService.createMultipleSeatingZones(event.id, seatingZones.map(sz => ({
          name: sz.name,  
          capacity: sz.capacity,
          description: sz.description,
        }))),
      ]);

      return {
        event,
        ticketTypes: createdTicketTypes,
        seatingZones: createdSeatingZones,
      };
    } catch (error) {
      console.error('Error creating event with configuration:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create event with configuration');
    }
  }

  /**
   * Get all categories for dropdown selection
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>('/categories');
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch categories');
    }
  }

  /**
   * Get all venues for dropdown selection
   */
  async getVenues(): Promise<Venue[]> {
    try {
      const response = await apiClient.get<Venue[]>('/venues');
      return response;
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch venues');
    }
  }

  /**
   * Get events for the authenticated organizer
   */
  async getMyEvents(): Promise<Event[]> {
    try {
      const response = await apiClient.get<Event[]>('/events/my');
      return response;
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch events');
    }
  }

  /**
   * Get a specific event by ID
   */
  async getEventById(eventId: string): Promise<Event> {
    try {
      const response = await apiClient.get<Event>(`/events/${eventId}`);
      return response;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch event');
    }
  }

  /**
   * Get public events with pagination support
   */
  async getPublicEvents(page: number = 1, limit: number = 10): Promise<PaginatedEventsResponse> {
    try {
      // Validate pagination parameters
      if (page < 1) {
        throw new Error('Page must be a positive integer');
      }
      if (limit < 1 || limit > 50) {
        throw new Error('Limit must be between 1 and 50');
      }

      const response = await apiClient.get<PaginatedEventsResponse>(
        `/events?page=${page}&limit=${limit}`
      );
      return response;
    } catch (error) {
      console.error('Error fetching public events:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch public events');
    }
  }

  /**
   * Get all public events (without pagination) - for backward compatibility
   */
  async getAllPublicEvents(): Promise<Event[]> {
    try {
      const response = await apiClient.get<Event[]>('/events/public');
      return response;
    } catch (error) {
      console.error('Error fetching all public events:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch public events');
    }
  }

  /**
   * Get a specific public event by ID
   */
  async getPublicEventById(eventId: string): Promise<Event> {
    try {
      const response = await apiClient.get<Event>(`/events/public/${eventId}`);
      return response;
    } catch (error) {
      console.error('Error fetching public event:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch public event');
    }
  }

  /**
   * Get a specific event for the authenticated user (organizer)
   */
  async getEventForUser(eventId: string): Promise<Event> {
    try {
      const response = await apiClient.get<Event>(`/events/${eventId}`);
      return response;
    } catch (error) {
      console.error('Error fetching event for user:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch event');
    }
  }
}

const eventService = new EventService();
export default eventService;