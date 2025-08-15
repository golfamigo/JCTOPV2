import apiClient from './apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  role?: 'user' | 'organizer' | 'admin';
}

interface PlatformStatistics {
  totalUsers: number;
  activeEvents: number;
  totalRevenue: number;
  totalRegistrations: number;
  userGrowth: {
    date: string;
    count: number;
  }[];
  eventGrowth: {
    date: string;
    count: number;
  }[];
}

interface SystemHealth {
  api: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'critical';
    connections: number;
    maxConnections: number;
  };
  server: {
    status: 'healthy' | 'warning' | 'critical';
    cpuUsage: number;
    memoryUsage: number;
  };
  lastChecked: Date;
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  details?: any;
}

interface PaginationParams {
  page: number;
  limit: number;
}

interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  hasMore: boolean;
}

export const adminService = {
  // Platform Statistics
  async getPlatformStatistics(timeRange: 'today' | 'week' | 'month' | 'year' = 'month'): Promise<PlatformStatistics> {
    try {
      // Mock implementation - replace with actual API call
      return {
        totalUsers: 1234,
        activeEvents: 42,
        totalRevenue: 567890,
        totalRegistrations: 8901,
        userGrowth: [
          { date: '2025-01-01', count: 10 },
          { date: '2025-01-02', count: 15 },
          { date: '2025-01-03', count: 12 },
          { date: '2025-01-04', count: 20 },
          { date: '2025-01-05', count: 18 },
        ],
        eventGrowth: [
          { date: '2025-01-01', count: 2 },
          { date: '2025-01-02', count: 3 },
          { date: '2025-01-03', count: 1 },
          { date: '2025-01-04', count: 4 },
          { date: '2025-01-05', count: 2 },
        ],
      };
    } catch (error) {
      console.error('Failed to fetch platform statistics:', error);
      throw error;
    }
  },

  // User Management
  async getAllUsers(params: PaginationParams): Promise<UserListResponse> {
    try {
      // Mock implementation - replace with actual API call
      const mockUsers: User[] = Array.from({ length: 20 }, (_, i) => ({
        id: `user-${params.page}-${i}`,
        name: `User ${(params.page - 1) * params.limit + i + 1}`,
        email: `user${(params.page - 1) * params.limit + i + 1}@example.com`,
        phone: `0912-345-${String(i).padStart(3, '0')}`,
        status: i % 3 === 0 ? 'suspended' : 'active',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        role: i % 10 === 0 ? 'admin' : i % 5 === 0 ? 'organizer' : 'user',
      }));

      return {
        users: mockUsers,
        total: 100,
        page: params.page,
        hasMore: params.page < 5,
      };
    } catch (error) {
      console.error('Failed to fetch users:', error);
      throw error;
    }
  },

  async updateUserStatus(userId: string, action: 'suspend' | 'activate' | 'delete'): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Updating user ${userId} status to ${action}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      throw error;
    }
  },

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      // Mock implementation - replace with actual API call
      return {
        api: {
          status: 'healthy',
          responseTime: 45,
        },
        database: {
          status: 'healthy',
          connections: 12,
          maxConnections: 100,
        },
        server: {
          status: 'warning',
          cpuUsage: 78,
          memoryUsage: 65,
        },
        lastChecked: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  },

  // Audit Log
  async getEventAuditLog(params: PaginationParams & { eventId?: string }): Promise<{
    entries: AuditLogEntry[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Mock implementation - replace with actual API call
      const mockEntries: AuditLogEntry[] = Array.from({ length: 10 }, (_, i) => ({
        id: `audit-${i}`,
        userId: `user-${i}`,
        userName: `User ${i}`,
        action: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'][i % 5],
        resource: ['EVENT', 'USER', 'TICKET', 'PAYMENT'][i % 4],
        resourceId: `resource-${i}`,
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000),
        ipAddress: `192.168.1.${i}`,
        userAgent: 'Mozilla/5.0',
        details: {},
      }));

      return {
        entries: mockEntries,
        total: 50,
        hasMore: params.page < 5,
      };
    } catch (error) {
      console.error('Failed to fetch audit log:', error);
      throw error;
    }
  },

  // Event Management
  async getAllEvents(params: PaginationParams & { status?: string }): Promise<{
    events: any[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Mock implementation - replace with actual API call
      return {
        events: [],
        total: 0,
        hasMore: false,
      };
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  },

  async unpublishEvent(eventId: string): Promise<void> {
    try {
      // Mock implementation - replace with actual API call
      console.log(`Unpublishing event ${eventId}`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Failed to unpublish event:', error);
      throw error;
    }
  },

  // Reports
  async generateReport(type: 'users' | 'events' | 'revenue', format: 'pdf' | 'csv' | 'excel'): Promise<Blob> {
    try {
      // Mock implementation - replace with actual API call
      const mockData = new Blob(['Mock report data'], { type: 'text/plain' });
      return mockData;
    } catch (error) {
      console.error('Failed to generate report:', error);
      throw error;
    }
  },
};