import apiClient from './apiClient';

export interface CheckInRequest {
  qrCode: string;
}

export interface CheckInResponse {
  success: boolean;
  attendee?: {
    name: string;
    email: string;
    ticketType: string;
  };
  error?: string;
  errorCode?: 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE';
}

export interface CheckInServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

export class CheckInService {
  private static instance: CheckInService;

  static getInstance(): CheckInService {
    if (!CheckInService.instance) {
      CheckInService.instance = new CheckInService();
    }
    return CheckInService.instance;
  }

  /**
   * Validate and check-in an attendee using QR code
   */
  async checkInAttendee(eventId: string, qrCode: string): Promise<CheckInServiceResult<CheckInResponse>> {
    try {
      const response = await apiClient.post<CheckInResponse>(
        `/events/${eventId}/checkin`,
        { qrCode }
      );

      if (response.success) {
        return {
          success: true,
          data: response
        };
      }

      return {
        success: false,
        error: response.error || 'Check-in failed',
        errorCode: response.errorCode
      };
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message?.includes('already checked in')) {
          return {
            success: false,
            error: 'This ticket has already been checked in',
            errorCode: 'ALREADY_CHECKED_IN'
          };
        }
        return {
          success: false,
          error: errorData.message || 'Invalid QR code',
          errorCode: 'INVALID_QR_CODE'
        };
      }

      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'Ticket not found',
          errorCode: 'TICKET_NOT_FOUND'
        };
      }

      return {
        success: false,
        error: `Check-in failed: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Check in by QR code (alias for checkInAttendee)
   */
  async checkInByQRCode(eventId: string, qrCode: string): Promise<CheckInServiceResult<CheckInResponse>> {
    return this.checkInAttendee(eventId, qrCode);
  }

  /**
   * Process QR code and perform check-in
   */
  async processQRCodeCheckIn(eventId: string, qrData: any): Promise<CheckInServiceResult<CheckInResponse>> {
    // Validate QR data structure
    if (!qrData || !qrData.data || qrData.type !== 'registration') {
      return {
        success: false,
        error: 'Invalid QR code format',
        errorCode: 'INVALID_QR_CODE'
      };
    }

    // Extract encrypted data
    const qrCode = qrData.data;
    
    return this.checkInAttendee(eventId, qrCode);
  }
}