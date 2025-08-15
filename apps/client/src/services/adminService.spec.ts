import { adminService } from './adminService';
import apiClient from './apiClient';

jest.mock('./apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPlatformStatistics', () => {
    it('should fetch platform statistics for specified time range', async () => {
      const mockStats = {
        totalUsers: 1000,
        activeEvents: 50,
        totalRevenue: 500000,
        totalRegistrations: 2500,
        userGrowth: [],
        eventGrowth: [],
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await adminService.getPlatformStatistics('month');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/statistics', {
        params: { timeRange: 'month' },
      });
      expect(result).toEqual(mockStats);
    });

    it('should handle API errors when fetching statistics', async () => {
      const error = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getPlatformStatistics('week')).rejects.toThrow('Network error');
      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/statistics', {
        params: { timeRange: 'week' },
      });
    });

    it('should default to month if no time range specified', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: {} });

      await adminService.getPlatformStatistics();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/statistics', {
        params: { timeRange: 'month' },
      });
    });
  });

  describe('getAllUsers', () => {
    it('should fetch paginated users', async () => {
      const mockUsers = {
        users: [
          { id: '1', name: 'User 1', email: 'user1@test.com' },
          { id: '2', name: 'User 2', email: 'user2@test.com' },
        ],
        total: 100,
        page: 1,
        pageSize: 20,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockUsers });

      const result = await adminService.getAllUsers(1, 20);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/users', {
        params: { page: 1, pageSize: 20 },
      });
      expect(result).toEqual(mockUsers);
    });

    it('should use default pagination values', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: { users: [] } });

      await adminService.getAllUsers();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/users', {
        params: { page: 1, pageSize: 50 },
      });
    });

    it('should handle search query parameter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: { users: [] } });

      await adminService.getAllUsers(1, 20, 'john');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/users', {
        params: { page: 1, pageSize: 20, search: 'john' },
      });
    });

    it('should handle status filter parameter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: { users: [] } });

      await adminService.getAllUsers(1, 20, undefined, 'active');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/users', {
        params: { page: 1, pageSize: 20, status: 'active' },
      });
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status to suspended', async () => {
      const mockResponse = { success: true, user: { id: '123', status: 'suspended' } };
      (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.updateUserStatus('123', 'suspended');

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/admin/users/123/status', {
        status: 'suspended',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update user status to active', async () => {
      const mockResponse = { success: true, user: { id: '456', status: 'active' } };
      (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.updateUserStatus('456', 'active');

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/admin/users/456/status', {
        status: 'active',
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when updating user status', async () => {
      const error = new Error('Unauthorized');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(adminService.updateUserStatus('789', 'deleted')).rejects.toThrow('Unauthorized');
    });
  });

  describe('getSystemHealth', () => {
    it('should fetch system health data', async () => {
      const mockHealth = {
        api: { status: 'healthy', responseTime: 120 },
        database: { status: 'healthy', connections: 45 },
        server: { status: 'warning', cpuUsage: 75 },
        lastChecked: new Date().toISOString(),
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockHealth });

      const result = await adminService.getSystemHealth();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/system-health');
      expect(result).toEqual(mockHealth);
    });

    it('should handle network errors when fetching health', async () => {
      const error = new Error('Connection timeout');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getSystemHealth()).rejects.toThrow('Connection timeout');
    });

    it('should include cache buster parameter', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: {} });

      await adminService.getSystemHealth();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/api/v1/admin/system-health',
        expect.objectContaining({
          params: expect.objectContaining({
            _t: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('getEventAuditLog', () => {
    it('should fetch audit log for an event', async () => {
      const mockAuditLog = [
        { id: '1', action: 'created', timestamp: '2024-01-01T00:00:00Z', user: 'admin' },
        { id: '2', action: 'updated', timestamp: '2024-01-02T00:00:00Z', user: 'organizer' },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockAuditLog });

      const result = await adminService.getEventAuditLog('event-123');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/events/event-123/audit');
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle errors when fetching audit log', async () => {
      const error = new Error('Event not found');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getEventAuditLog('invalid-id')).rejects.toThrow('Event not found');
    });

    it('should support pagination for audit log', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({ data: [] });

      await adminService.getEventAuditLog('event-456', 2, 25);

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/events/event-456/audit', {
        params: { page: 2, pageSize: 25 },
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const mockResponse = { success: true, message: 'User deleted' };
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.deleteUser('user-123');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/admin/users/user-123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when deleting user', async () => {
      const error = new Error('Cannot delete admin user');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(adminService.deleteUser('admin-user')).rejects.toThrow('Cannot delete admin user');
    });
  });

  describe('getEventStatistics', () => {
    it('should fetch statistics for a specific event', async () => {
      const mockEventStats = {
        registrations: 500,
        revenue: 50000,
        attendanceRate: 0.85,
      };

      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockEventStats });

      const result = await adminService.getEventStatistics('event-789');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/admin/events/event-789/statistics');
      expect(result).toEqual(mockEventStats);
    });
  });

  describe('unpublishEvent', () => {
    it('should unpublish an event', async () => {
      const mockResponse = { success: true, event: { id: 'evt-1', status: 'draft' } };
      (apiClient.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await adminService.unpublishEvent('evt-1');

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/admin/events/evt-1/unpublish');
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when unpublishing event', async () => {
      const error = new Error('Event has active registrations');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      await expect(adminService.unpublishEvent('evt-2')).rejects.toThrow('Event has active registrations');
    });
  });

  describe('retry logic', () => {
    it('should retry failed requests up to 3 times', async () => {
      const error = new Error('Network error');
      (apiClient.get as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ data: { success: true } });

      const result = await adminService.getSystemHealth();

      expect(apiClient.get).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ success: true });
    });

    it('should fail after maximum retry attempts', async () => {
      const error = new Error('Persistent error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(adminService.getSystemHealth()).rejects.toThrow('Persistent error');
      expect(apiClient.get).toHaveBeenCalledTimes(3);
    });
  });
});