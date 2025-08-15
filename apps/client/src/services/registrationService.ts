import apiClient from './apiClient';
import { CustomRegistrationField, CustomFieldResponse, DiscountValidationRequest, DiscountValidationResponse, Registration } from '@jctop-event/shared-types';

class RegistrationService {
  async getCustomFields(eventId: string): Promise<CustomRegistrationField[]> {
    const response = await apiClient.get<CustomFieldResponse>(`/events/${eventId}/registration-fields`);
    return response.fields;
  }

  async validateDiscountCode(eventId: string, code: string, totalAmount: number): Promise<DiscountValidationResponse> {
    const request: DiscountValidationRequest = { code, totalAmount };
    return apiClient.post<DiscountValidationResponse>(`/events/${eventId}/validate-discount`, request);
  }

  async getRegistration(registrationId: string): Promise<Registration> {
    return await apiClient.get<Registration>(`/registrations/${registrationId}`);
  }

  async getUserRegistrations(): Promise<Registration[]> {
    return await apiClient.get<Registration[]>('/registrations');
  }

  async completeRegistration(registrationId: string): Promise<{ success: boolean; registration: Registration }> {
    return await apiClient.post<{ success: boolean; registration: Registration }>(`/registrations/${registrationId}/complete`);
  }

  formatRegistrationStatus(status: Registration['status']): string {
    const statusMap = {
      pending: '待付款',
      paid: '已完成',
      cancelled: '已取消',
      checkedIn: '已入場'
    };
    return statusMap[status] || status;
  }

  formatPaymentStatus(paymentStatus: Registration['paymentStatus']): string {
    const statusMap = {
      pending: '等待付款',
      processing: '處理中',
      completed: '已完成',
      failed: '失敗',
      cancelled: '已取消'
    };
    return statusMap[paymentStatus] || paymentStatus;
  }

  getStatusColor(status: Registration['status']): string {
    const colorMap = {
      pending: 'orange',
      paid: 'green',
      cancelled: 'red',
      checkedIn: 'blue'
    };
    return colorMap[status] || 'gray';
  }

  calculateTotalTickets(ticketSelections: Registration['ticketSelections']): number {
    return ticketSelections.reduce((total, selection) => total + selection.quantity, 0);
  }

  formatTicketSummary(ticketSelections: Registration['ticketSelections']): string {
    const totalTickets = this.calculateTotalTickets(ticketSelections);
    return `共 ${totalTickets} 張票券`;
  }
}

const registrationService = new RegistrationService();
export default registrationService;