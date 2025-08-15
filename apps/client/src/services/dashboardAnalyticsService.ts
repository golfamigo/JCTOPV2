// Configure API base URL based on environment
const API_BASE_URL = process?.env?.EXPO_PUBLIC_API_URL || 'https://jctop.zeabur.app/api/v1';
import { Event } from '@jctop-event/shared-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import statisticsService, { EventStatistics } from './statisticsService';

export interface DashboardAnalytics {
  totalEvents: number;
  publishedEvents: number;
  totalRegistrations: number;
  totalCheckedIn: number;
  overallAttendanceRate: number;
  eventStatistics: EventWithStatistics[];
  lastUpdated: string;
}

export interface EventWithStatistics extends Event {
  statistics?: EventStatistics;
}

export interface DashboardAnalyticsServiceResponse {
  success: boolean;
  data?: DashboardAnalytics;
  error?: string;
}

export class DashboardAnalyticsService {
  private static instance: DashboardAnalyticsService;
  private cache: { data: DashboardAnalytics; timestamp: number } | null = null;
  private readonly CACHE_DURATION = 60000; // 1 minute
  private readonly OFFLINE_CACHE_KEY = 'dashboard_analytics_offline';

  static getInstance(): DashboardAnalyticsService {
    if (!DashboardAnalyticsService.instance) {
      DashboardAnalyticsService.instance = new DashboardAnalyticsService();
    }
    return DashboardAnalyticsService.instance;
  }

  async getDashboardAnalytics(forceRefresh = false): Promise<DashboardAnalyticsServiceResponse> {
    try {
      // Check memory cache first unless force refresh is requested
      if (!forceRefresh && this.cache) {
        const now = Date.now();
        if (now - this.cache.timestamp < this.CACHE_DURATION) {
          return { success: true, data: this.cache.data };
        }
      }

      // Try to load from offline cache if not forcing refresh
      if (!forceRefresh) {
        const offlineData = await this.loadFromOfflineCache();
        if (offlineData) {
          // Update memory cache with offline data
          this.cache = {
            data: offlineData,
            timestamp: Date.now()
          };
          // Return offline data but continue to fetch fresh data in background
          this.fetchAndUpdateInBackground();
          return { success: true, data: offlineData };
        }
      }

      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      // Get organizer events
      const eventsResponse = await fetch(`${API_BASE_URL}/organizer/events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!eventsResponse.ok) {
        if (eventsResponse.status === 401) {
          return { success: false, error: 'Authentication failed' };
        }
        throw new Error(`HTTP ${eventsResponse.status}: ${eventsResponse.statusText}`);
      }

      const events: Event[] = await eventsResponse.json();

      // Get statistics for each published event
      const eventStatistics: EventWithStatistics[] = [];
      let totalRegistrations = 0;
      let totalCheckedIn = 0;

      for (const event of events) {
        const eventWithStats: EventWithStatistics = { ...event };
        
        if (event.status === 'published') {
          try {
            const statsResult = await statisticsService.getEventStatistics(event.id);
            if (statsResult.success && statsResult.data) {
              eventWithStats.statistics = statsResult.data;
              totalRegistrations += statsResult.data.totalRegistrations;
              totalCheckedIn += statsResult.data.checkedInCount;
            }
          } catch (error) {
            console.warn(`Failed to get statistics for event ${event.id}:`, error);
          }
        }
        
        eventStatistics.push(eventWithStats);
      }

      const publishedEvents = events.filter(e => e.status === 'published').length;
      const overallAttendanceRate = totalRegistrations > 0 ? 
        Number(((totalCheckedIn / totalRegistrations) * 100).toFixed(1)) : 0;

      const analytics: DashboardAnalytics = {
        totalEvents: events.length,
        publishedEvents,
        totalRegistrations,
        totalCheckedIn,
        overallAttendanceRate,
        eventStatistics,
        lastUpdated: new Date().toISOString(),
      };

      // Cache the result in memory
      this.cache = {
        data: analytics,
        timestamp: Date.now()
      };

      // Save to offline cache
      await this.saveToOfflineCache(analytics);

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Failed to get dashboard analytics:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get dashboard analytics' 
      };
    }
  }

  async refreshDashboardAnalytics(): Promise<DashboardAnalyticsServiceResponse> {
    return this.getDashboardAnalytics(true);
  }

  async getEventStatistics(eventId: string): Promise<EventStatistics | null> {
    if (this.cache) {
      const event = this.cache.data.eventStatistics.find(e => e.id === eventId);
      return event?.statistics || null;
    }
    return null;
  }

  async clearCache(): Promise<void> {
    this.cache = null;
    // Also clear statistics service cache
    statisticsService.clearCache();
    // Clear offline cache
    try {
      await AsyncStorage.removeItem(this.OFFLINE_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear offline cache:', error);
    }
  }

  // Helper method to get summary statistics
  getSummaryStats(): { totalEvents: number; totalRegistrations: number; totalCheckedIn: number; attendanceRate: number } | null {
    if (!this.cache) return null;
    
    const { totalEvents, totalRegistrations, totalCheckedIn, overallAttendanceRate } = this.cache.data;
    return {
      totalEvents,
      totalRegistrations,
      totalCheckedIn,
      attendanceRate: overallAttendanceRate
    };
  }

  // Offline cache methods
  private async saveToOfflineCache(data: DashboardAnalytics): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: '1.0'
      };
      await AsyncStorage.setItem(this.OFFLINE_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save to offline cache:', error);
    }
  }

  private async loadFromOfflineCache(): Promise<DashboardAnalytics | null> {
    try {
      const cachedString = await AsyncStorage.getItem(this.OFFLINE_CACHE_KEY);
      if (!cachedString) return null;

      const cached = JSON.parse(cachedString);
      
      // Check if cache is not too old (24 hours)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (now - cached.timestamp > maxAge) {
        // Cache is too old, remove it
        await AsyncStorage.removeItem(this.OFFLINE_CACHE_KEY);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Failed to load from offline cache:', error);
      return null;
    }
  }

  private async fetchAndUpdateInBackground(): Promise<void> {
    try {
      // Fetch fresh data without using cache
      const result = await this.getDashboardAnalytics(true);
      if (result.success && result.data) {
        // Data will be automatically cached by getDashboardAnalytics
        console.log('Background data refresh completed');
      }
    } catch (error) {
      console.error('Background refresh failed:', error);
    }
  }
}

export default DashboardAnalyticsService.getInstance();