// Use environment variable or fallback to production URL
const API_BASE_URL = process?.env?.EXPO_PUBLIC_API_URL || 'https://jctop.zeabur.app/api/v1';

export interface EventStatistics {
  eventId: string;
  totalRegistrations: number;
  checkedInCount: number;
  attendanceRate: number;
  lastUpdated: string;
}

export interface StatisticsServiceResponse {
  success: boolean;
  data?: EventStatistics;
  error?: string;
}

export class StatisticsService {
  private static instance: StatisticsService;
  private cache: Map<string, { data: EventStatistics; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds timeout

  static getInstance(): StatisticsService {
    if (!StatisticsService.instance) {
      StatisticsService.instance = new StatisticsService();
    }
    return StatisticsService.instance;
  }

  async getEventStatistics(eventId: string, forceRefresh = false): Promise<StatisticsServiceResponse> {
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cached = this.getCachedStatistics(eventId);
        if (cached) {
          return { success: true, data: cached };
        }
      }

      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      // Create AbortController for request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}/events/${eventId}/statistics`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, error: 'Authentication failed' };
        }
        if (response.status === 403) {
          return { success: false, error: 'Access denied' };
        }
        if (response.status === 404) {
          return { success: false, error: 'Event not found' };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const statistics: EventStatistics = await response.json();
      
      // Cache the result
      this.setCachedStatistics(eventId, statistics);

      return { success: true, data: statistics };
    } catch (error) {
      console.error('Failed to get event statistics:', error);
      
      // Handle different error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Request timeout - please try again' };
        }
        return { success: false, error: error.message };
      }
      
      return { success: false, error: 'Failed to get statistics' };
    }
  }

  async refreshEventStatistics(eventId: string): Promise<StatisticsServiceResponse> {
    return this.getEventStatistics(eventId, true);
  }

  private getCachedStatistics(eventId: string): EventStatistics | null {
    const cached = this.cache.get(eventId);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(eventId);
      return null;
    }

    return cached.data;
  }

  private setCachedStatistics(eventId: string, statistics: EventStatistics): void {
    this.cache.set(eventId, {
      data: statistics,
      timestamp: Date.now()
    });
  }

  clearCache(eventId?: string): void {
    if (eventId) {
      this.cache.delete(eventId);
    } else {
      this.cache.clear();
    }
  }
}

export default StatisticsService.getInstance();