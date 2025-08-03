import apiClient from './apiClient';
import { UpdateEventStatusDto, EventStatusChangeDto } from '@jctop-event/shared-types';

export interface EventStatusResponse {
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

class EventStatusService {
  /**
   * Update an event's status
   */
  async updateEventStatus(
    eventId: string,
    status: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended',
    reason?: string
  ): Promise<EventStatusResponse> {
    try {
      const statusDto: UpdateEventStatusDto = { status };
      if (reason) {
        statusDto.reason = reason;
      }

      const response = await apiClient.put<EventStatusResponse>(
        `/events/${eventId}/status`,
        statusDto
      );
      return response;
    } catch (error) {
      console.error('Error updating event status:', error);
      throw new Error('Failed to update event status');
    }
  }

  /**
   * Get event status change history
   */
  async getEventStatusHistory(eventId: string): Promise<EventStatusChangeDto[]> {
    try {
      const response = await apiClient.get<EventStatusChangeDto[]>(
        `/events/${eventId}/status-history`
      );
      return response;
    } catch (error) {
      console.error('Error fetching event status history:', error);
      throw new Error('Failed to fetch event status history');
    }
  }

  /**
   * Get public events (only published events)
   */
  async getPublicEvents(): Promise<EventStatusResponse[]> {
    try {
      const response = await apiClient.get<EventStatusResponse[]>('/events/public');
      return response;
    } catch (error) {
      console.error('Error fetching public events:', error);
      throw new Error('Failed to fetch public events');
    }
  }

  /**
   * Get a specific public event by ID
   */
  async getPublicEvent(eventId: string): Promise<EventStatusResponse> {
    try {
      const response = await apiClient.get<EventStatusResponse>(`/events/public/${eventId}`);
      return response;
    } catch (error) {
      console.error('Error fetching public event:', error);
      throw new Error('Failed to fetch public event');
    }
  }

  /**
   * Get an event by ID (for authenticated users)
   * Organizers can see their events regardless of status
   * Other users can only see published events
   */
  async getEventById(eventId: string): Promise<EventStatusResponse> {
    try {
      const response = await apiClient.get<EventStatusResponse>(`/events/${eventId}`);
      return response;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Failed to fetch event');
    }
  }

  /**
   * Validate if a status transition is allowed
   */
  isValidStatusTransition(
    currentStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended',
    newStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended'
  ): boolean {
    const validTransitions: Record<string, string[]> = {
      draft: ['published'],
      published: ['unpublished', 'paused', 'ended'],
      unpublished: ['published', 'ended'],
      paused: ['published', 'ended'],
      ended: [], // No transitions from ended
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  /**
   * Get available status transitions for current status
   */
  getAvailableTransitions(
    currentStatus: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended'
  ): Array<'draft' | 'published' | 'unpublished' | 'paused' | 'ended'> {
    const validTransitions: Record<string, Array<'draft' | 'published' | 'unpublished' | 'paused' | 'ended'>> = {
      draft: ['published'],
      published: ['unpublished', 'paused', 'ended'],
      unpublished: ['published', 'ended'],
      paused: ['published', 'ended'],
      ended: [],
    };

    return validTransitions[currentStatus] || [];
  }
}

const eventStatusService = new EventStatusService();
export default eventStatusService;