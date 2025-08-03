import statisticsService, { StatisticsService, EventStatistics } from './statisticsService';

// Mock fetch globally
global.fetch = jest.fn();

describe('StatisticsService', () => {
  let service: StatisticsService;
  
  const mockEventId = 'test-event-id';
  const mockStatistics: EventStatistics = {
    eventId: mockEventId,
    totalRegistrations: 100,
    checkedInCount: 75,
    attendanceRate: 75.0,
    lastUpdated: '2024-01-01T12:00:00.000Z',
  };

  beforeEach(() => {
    service = StatisticsService.getInstance();
    service.clearCache();
    
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    service.clearCache();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = StatisticsService.getInstance();
      const instance2 = StatisticsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getEventStatistics', () => {
    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
    });

    it('should fetch statistics successfully', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatistics),
      });

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStatistics);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/v1/events/${mockEventId}/statistics`,
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer mock-token',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should return cached data when available and not force refresh', async () => {
      // Arrange - First call to populate cache
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatistics),
      });

      await service.getEventStatistics(mockEventId);
      jest.clearAllMocks();

      // Act - Second call should use cache
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStatistics);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should bypass cache when force refresh is true', async () => {
      // Arrange - First call to populate cache
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatistics),
      });

      await service.getEventStatistics(mockEventId);
      
      // Act - Force refresh should call API again
      const result = await service.getEventStatistics(mockEventId, true);

      // Assert
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should return error when no authentication token', async () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication required');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle 401 authentication error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
      });

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication failed');
    });

    it('should handle 403 access denied error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Access denied');
    });

    it('should handle 404 event not found error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Event not found');
    });

    it('should handle other HTTP errors', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('HTTP 500: Internal Server Error');
    });

    it('should handle network errors', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('refreshEventStatistics', () => {
    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
    });

    it('should force refresh statistics', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatistics),
      });

      const spy = jest.spyOn(service, 'getEventStatistics');

      // Act
      await service.refreshEventStatistics(mockEventId);

      // Assert
      expect(spy).toHaveBeenCalledWith(mockEventId, true);
    });
  });

  describe('cache management', () => {
    beforeEach(() => {
      (localStorage.getItem as jest.Mock).mockReturnValue('mock-token');
    });

    it('should cache statistics data', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatistics),
      });

      // Act
      await service.getEventStatistics(mockEventId);
      
      // Clear fetch mock to ensure cache is used
      jest.clearAllMocks();
      
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStatistics);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should clear cache for specific event', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatistics),
      });

      await service.getEventStatistics(mockEventId);
      
      // Act
      service.clearCache(mockEventId);
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockStatistics),
      });

      await service.getEventStatistics(mockEventId);
      
      // Act
      service.clearCache();
      const result = await service.getEventStatistics(mockEventId);

      // Assert
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});