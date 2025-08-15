import apiClient from './apiClient';

export interface AttendeeDto {
  id: string;
  userId: string;
  eventId: string;
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  customFieldValues: Record<string, any>;
  ticketSelections: Array<{
    ticketTypeId: string;
    quantity: number;
    price: number;
  }>;
  createdAt: string;
  updatedAt: string;
  qrCode?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
}

export interface AttendeeQueryParams {
  status?: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  search?: string;
  sortBy?: 'createdAt' | 'status' | 'userName' | 'finalAmount';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export interface AttendeeListResponse {
  attendees: AttendeeDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AttendeeExportParams {
  format: 'csv' | 'excel';
  status?: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  search?: string;
}

class AttendeeService {
  async getEventAttendees(eventId: string, params?: AttendeeQueryParams): Promise<AttendeeListResponse> {
    const queryString = new URLSearchParams();
    
    if (params?.status) queryString.append('status', params.status);
    if (params?.search) queryString.append('search', params.search);
    if (params?.sortBy) queryString.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryString.append('sortOrder', params.sortOrder);
    if (params?.page) queryString.append('page', params.page.toString());
    if (params?.limit) queryString.append('limit', params.limit.toString());

    const query = queryString.toString() ? `?${queryString.toString()}` : '';
    return apiClient.get<AttendeeListResponse>(`/events/${eventId}/attendees${query}`);
  }

  async resendTicket(eventId: string, attendeeId: string): Promise<void> {
    await apiClient.post(`/events/${eventId}/attendees/${attendeeId}/resend-ticket`);
  }

  async checkInAttendee(eventId: string, attendeeId: string): Promise<AttendeeDto> {
    return await apiClient.post<AttendeeDto>(`/events/${eventId}/attendees/${attendeeId}/check-in`);
  }

  async cancelRegistration(eventId: string, attendeeId: string): Promise<AttendeeDto> {
    return await apiClient.post<AttendeeDto>(`/events/${eventId}/attendees/${attendeeId}/cancel`);
  }

  async exportEventAttendees(eventId: string, params: AttendeeExportParams): Promise<void> {
    if (!eventId) {
      throw new Error('Event ID is required');
    }

    const queryString = new URLSearchParams();
    queryString.append('format', params.format);
    
    if (params.status) queryString.append('status', params.status);
    if (params.search?.trim()) queryString.append('search', params.search.trim());

    const query = queryString.toString();
    
    try {
      // Get auth headers
      const headers = await apiClient['getAuthHeaders']() as Record<string, string>;
      if (!headers || !headers['Authorization']) {
        throw new Error('Authentication required');
      }

      // Create a temporary anchor element for download
      const response = await fetch(`${apiClient['baseURL']}/events/${eventId}/attendees/export?${query}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Export failed: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Use default error message if response is not JSON
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('No data to export');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `attendees.${params.format === 'csv' ? 'csv' : 'xlsx'}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      throw error instanceof Error ? error : new Error('Export failed');
    }
  }
}

const attendeeService = new AttendeeService();
export default attendeeService;