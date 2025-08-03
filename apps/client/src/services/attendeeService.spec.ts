import attendeeService, { AttendeeQueryParams, AttendeeExportParams } from './attendeeService';
import apiClient from './apiClient';

// Mock the apiClient
jest.mock('./apiClient', () => ({
  get: jest.fn(),
  __esModule: true,
  default: {
    get: jest.fn(),
    getAuthHeaders: jest.fn(),
    baseURL: 'http://localhost:3000/api/v1',
  },
}));

// Mock global fetch for export functionality
global.fetch = jest.fn();

// Mock window.URL
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
});

// Mock DOM methods
Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: jest.fn(),
  })),
});

Object.defineProperty(document.body, 'appendChild', {
  value: jest.fn(),
});

Object.defineProperty(document.body, 'removeChild', {
  value: jest.fn(),
});

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AttendeeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventAttendees', () => {
    const mockAttendeeResponse = {
      attendees: [
        {
          id: 'reg-1',
          userId: 'user-1',
          eventId: 'event-1',
          status: 'paid',
          paymentStatus: 'completed',
          totalAmount: 100,
          discountAmount: 10,
          finalAmount: 90,
          customFieldValues: { company: 'Tech Corp' },
          ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 1, price: 100 }],
          createdAt: '2023-01-01T10:00:00Z',
          updatedAt: '2023-01-01T11:00:00Z',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          userPhone: '+1234567890',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    };

    it('should fetch attendees without query parameters', async () => {
      mockApiClient.get.mockResolvedValue(mockAttendeeResponse);

      const result = await attendeeService.getEventAttendees('event-1');

      expect(mockApiClient.get).toHaveBeenCalledWith('/events/event-1/attendees');
      expect(result).toEqual(mockAttendeeResponse);
    });

    it('should fetch attendees with query parameters', async () => {
      mockApiClient.get.mockResolvedValue(mockAttendeeResponse);

      const params: AttendeeQueryParams = {
        status: 'paid',
        search: 'john',
        sortBy: 'userName',
        sortOrder: 'ASC',
        page: 2,
        limit: 10,
      };

      await attendeeService.getEventAttendees('event-1', params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/events/event-1/attendees?status=paid&search=john&sortBy=userName&sortOrder=ASC&page=2&limit=10'
      );
    });

    it('should fetch attendees with partial query parameters', async () => {
      mockApiClient.get.mockResolvedValue(mockAttendeeResponse);

      const params: AttendeeQueryParams = {
        status: 'pending',
        page: 1,
      };

      await attendeeService.getEventAttendees('event-1', params);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/events/event-1/attendees?status=pending&page=1'
      );
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(attendeeService.getEventAttendees('event-1')).rejects.toThrow('API Error');
    });
  });

  describe('exportEventAttendees', () => {
    const mockBlob = new Blob(['test data'], { type: 'text/csv' });
    const mockResponse = {
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
      headers: {
        get: jest.fn().mockReturnValue('attachment; filename="attendees.csv"'),
      },
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      mockApiClient.getAuthHeaders = jest.fn().mockResolvedValue({
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json',
      });
      
      // Mock DOM elements
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      (document.createElement as jest.Mock).mockReturnValue(mockLink);
    });

    it('should export attendees as CSV', async () => {
      const params: AttendeeExportParams = {
        format: 'csv',
      };

      await attendeeService.exportEventAttendees('event-1', params);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/events/event-1/attendees/export?format=csv',
        {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      );
    });

    it('should export attendees as Excel with filters', async () => {
      const params: AttendeeExportParams = {
        format: 'excel',
        status: 'paid',
        search: 'john',
      };

      await attendeeService.exportEventAttendees('event-1', params);

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/events/event-1/attendees/export?format=excel&status=paid&search=john',
        expect.any(Object)
      );
    });

    it('should handle export errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: 'Not Found',
      });

      const params: AttendeeExportParams = {
        format: 'csv',
      };

      await expect(
        attendeeService.exportEventAttendees('event-1', params)
      ).rejects.toThrow('Export failed: Not Found');
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const params: AttendeeExportParams = {
        format: 'csv',
      };

      await expect(
        attendeeService.exportEventAttendees('event-1', params)
      ).rejects.toThrow('Network error');
    });

    it('should create download link with correct filename', async () => {
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      (document.createElement as jest.Mock).mockReturnValue(mockLink);

      const params: AttendeeExportParams = {
        format: 'csv',
      };

      await attendeeService.exportEventAttendees('event-1', params);

      expect(mockLink.download).toBe('attendees.csv');
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should use default filename when content-disposition is missing', async () => {
      const mockResponseWithoutHeaders = {
        ...mockResponse,
        headers: {
          get: jest.fn().mockReturnValue(null),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponseWithoutHeaders);

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn(),
      };
      (document.createElement as jest.Mock).mockReturnValue(mockLink);

      const params: AttendeeExportParams = {
        format: 'excel',
      };

      await attendeeService.exportEventAttendees('event-1', params);

      expect(mockLink.download).toBe('attendees.xlsx');
    });
  });
});