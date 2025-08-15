import apiClient from './apiClient';
import { AttendeeSearchResult } from '../components/features/organizer/AttendeeSearchResults';

export interface AttendeeSearchParams {
  query: string;
  limit?: number;
  offset?: number;
}

export interface AttendeeSearchResponse {
  attendees: AttendeeSearchResult[];
  total: number;
  limit: number;
  offset: number;
}

export interface ManualCheckInResponse {
  success: boolean;
  attendee?: {
    name: string;
    email: string;
    ticketType: string;
  };
  error?: string;
  errorCode?: 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE';
}

class AttendeeSearchService {
  private static instance: AttendeeSearchService;
  private cache = new Map<string, { data: AttendeeSearchResponse; timestamp: number }>();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds cache

  public static getInstance(): AttendeeSearchService {
    if (!AttendeeSearchService.instance) {
      AttendeeSearchService.instance = new AttendeeSearchService();
    }
    return AttendeeSearchService.instance;
  }

  private getCacheKey(eventId: string, params: AttendeeSearchParams): string {
    return `${eventId}_${params.query}_${params.limit || 20}_${params.offset || 0}`;
  }

  private isValidCacheEntry(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  /**
   * Search for attendees by name or registration ID
   */
  async searchAttendees(
    eventId: string,
    params: AttendeeSearchParams
  ): Promise<AttendeeSearchResponse> {
    // Input validation
    if (!eventId || !params.query) {
      throw new Error('Event ID and search query are required');
    }

    const validation = this.validateSearchQuery(params.query);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid search query');
    }

    // Check cache
    const cacheKey = this.getCacheKey(eventId, params);
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult && this.isValidCacheEntry(cachedResult.timestamp)) {
      return cachedResult.data;
    }

    try {
      const queryParams = new URLSearchParams({
        query: params.query.trim(),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.offset && { offset: params.offset.toString() }),
      });

      const response = await apiClient.get(`/api/v1/events/${eventId}/attendees/search?${queryParams}`) as any;
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Search failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      // Cache the result
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      
      // Clean up old cache entries
      this.cleanupCache();
      
      return result;
    } catch (error) {
      console.error('Attendee search failed:', error);
      throw new Error(`Failed to search attendees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear cache entries that have expired
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidCacheEntry(entry.timestamp)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cached search results
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Manually check in an attendee
   */
  async manualCheckIn(
    eventId: string,
    registrationId: string
  ): Promise<ManualCheckInResponse> {
    // Input validation
    if (!eventId || !registrationId) {
      return {
        success: false,
        error: 'Event ID and registration ID are required',
      };
    }

    try {
      const response = await apiClient.post(`/api/v1/events/${eventId}/checkin`, {
        registrationId,
        manual: true,
      }) as any;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || `Check-in failed: ${response.status} ${response.statusText}`,
          errorCode: errorData.errorCode,
        };
      }

      const data = await response.json();
      
      // Clear cache after successful check-in to ensure fresh data
      this.clearCache();
      
      return {
        success: true,
        attendee: data.attendee,
      };
    } catch (error) {
      console.error('Manual check-in failed:', error);
      return {
        success: false,
        error: `Manual check-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get attendee details by registration ID
   */
  async getAttendeeByRegistrationId(
    eventId: string,
    registrationId: string
  ): Promise<AttendeeSearchResult | null> {
    try {
      const searchResult = await this.searchAttendees(eventId, {
        query: registrationId,
        limit: 1,
      });

      // Find exact match by registration ID
      const exactMatch = searchResult.attendees.find(
        attendee => attendee.registrationId === registrationId
      );

      return exactMatch || null;
    } catch (error) {
      console.error('Failed to get attendee by registration ID:', error);
      return null;
    }
  }

  /**
   * Validate search query
   */
  validateSearchQuery(query: string): { valid: boolean; error?: string } {
    if (!query || query.trim().length === 0) {
      return { valid: false, error: 'Search query cannot be empty' };
    }

    if (query.trim().length < 2) {
      return { valid: false, error: 'Search query must be at least 2 characters long' };
    }

    if (query.length > 100) {
      return { valid: false, error: 'Search query is too long (maximum 100 characters)' };
    }

    return { valid: true };
  }
}

export const attendeeSearchService = AttendeeSearchService.getInstance();
export default attendeeSearchService;