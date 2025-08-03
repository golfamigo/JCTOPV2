import { CheckInService } from './checkinService';
import { apiClient } from './apiClient';

jest.mock('./apiClient');

describe('CheckInService', () => {
  let service: CheckInService;
  const mockEventId = 'event-123';
  const mockQrCode = 'encrypted-qr-data';

  beforeEach(() => {
    service = CheckInService.getInstance();
    jest.clearAllMocks();
  });

  describe('checkInAttendee', () => {
    it('should successfully check in an attendee', async () => {
      const mockResponse = {
        data: {
          success: true,
          attendee: {
            name: 'John Doe',
            email: 'john@example.com',
            ticketType: 'VIP Pass',
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.checkInAttendee(mockEventId, mockQrCode);

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        `/events/${mockEventId}/checkin`,
        { qrCode: mockQrCode }
      );
    });

    it('should handle already checked in error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'This ticket has already been checked in',
          },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const result = await service.checkInAttendee(mockEventId, mockQrCode);

      expect(result).toEqual({
        success: false,
        error: 'This ticket has already been checked in',
        errorCode: 'ALREADY_CHECKED_IN',
      });
    });

    it('should handle ticket not found error', async () => {
      const mockError = {
        response: {
          status: 404,
          data: {},
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const result = await service.checkInAttendee(mockEventId, mockQrCode);

      expect(result).toEqual({
        success: false,
        error: 'Ticket not found',
        errorCode: 'TICKET_NOT_FOUND',
      });
    });

    it('should handle invalid QR code error', async () => {
      const mockError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid QR code format',
          },
        },
      };

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const result = await service.checkInAttendee(mockEventId, mockQrCode);

      expect(result).toEqual({
        success: false,
        error: 'Invalid QR code format',
        errorCode: 'INVALID_QR_CODE',
      });
    });

    it('should handle network errors', async () => {
      const mockError = new Error('Network error');

      (apiClient.post as jest.Mock).mockRejectedValue(mockError);

      const result = await service.checkInAttendee(mockEventId, mockQrCode);

      expect(result).toEqual({
        success: false,
        error: 'Check-in failed: Network error',
      });
    });
  });

  describe('processQRCodeCheckIn', () => {
    const mockQrData = {
      type: 'registration',
      data: 'encrypted-data',
      timestamp: new Date().toISOString(),
    };

    it('should process valid QR code data', async () => {
      const mockResponse = {
        data: {
          success: true,
          attendee: {
            name: 'John Doe',
            email: 'john@example.com',
            ticketType: 'General Admission',
          },
        },
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.processQRCodeCheckIn(mockEventId, mockQrData);

      expect(result).toEqual({
        success: true,
        data: mockResponse.data,
      });

      expect(apiClient.post).toHaveBeenCalledWith(
        `/events/${mockEventId}/checkin`,
        { qrCode: 'encrypted-data' }
      );
    });

    it('should reject invalid QR data format', async () => {
      const invalidQrData = {
        type: 'invalid',
        data: 'some-data',
      };

      const result = await service.processQRCodeCheckIn(mockEventId, invalidQrData);

      expect(result).toEqual({
        success: false,
        error: 'Invalid QR code format',
        errorCode: 'INVALID_QR_CODE',
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should reject missing QR data', async () => {
      const result = await service.processQRCodeCheckIn(mockEventId, null);

      expect(result).toEqual({
        success: false,
        error: 'Invalid QR code format',
        errorCode: 'INVALID_QR_CODE',
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });

    it('should reject QR data without encrypted data', async () => {
      const invalidQrData = {
        type: 'registration',
        timestamp: new Date().toISOString(),
      };

      const result = await service.processQRCodeCheckIn(mockEventId, invalidQrData as any);

      expect(result).toEqual({
        success: false,
        error: 'Invalid QR code format',
        errorCode: 'INVALID_QR_CODE',
      });

      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });
});