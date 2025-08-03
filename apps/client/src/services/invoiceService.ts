import { InvoiceSettings } from '@jctop-event/shared-types';
import apiClient from './apiClient';

export interface CreateInvoiceSettingsRequest {
  companyName?: string;
  companyAddress?: string;
  taxNumber?: string;
  invoicePrefix?: string;
  invoiceFooter?: string;
  customFields?: Record<string, any>;
}

export interface UpdateInvoiceSettingsRequest extends CreateInvoiceSettingsRequest {}

class InvoiceService {
  /**
   * Get invoice settings for an event
   */
  async getInvoiceSettings(eventId: string): Promise<InvoiceSettings | null> {
    try {
      const response = await apiClient.get(`/events/${eventId}/invoice-settings`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create invoice settings for an event
   */
  async createInvoiceSettings(
    eventId: string, 
    settings: CreateInvoiceSettingsRequest
  ): Promise<InvoiceSettings> {
    const response = await apiClient.post(`/events/${eventId}/invoice-settings`, settings);
    return response.data;
  }

  /**
   * Update invoice settings for an event
   */
  async updateInvoiceSettings(
    eventId: string, 
    settings: UpdateInvoiceSettingsRequest
  ): Promise<InvoiceSettings> {
    const response = await apiClient.put(`/events/${eventId}/invoice-settings`, settings);
    return response.data;
  }

  /**
   * Delete invoice settings for an event
   */
  async deleteInvoiceSettings(eventId: string): Promise<void> {
    await apiClient.delete(`/events/${eventId}/invoice-settings`);
  }

  /**
   * Create or update invoice settings
   */
  async saveInvoiceSettings(
    eventId: string,
    settings: CreateInvoiceSettingsRequest | UpdateInvoiceSettingsRequest,
    isUpdate: boolean = false
  ): Promise<InvoiceSettings> {
    if (isUpdate) {
      return this.updateInvoiceSettings(eventId, settings);
    } else {
      return this.createInvoiceSettings(eventId, settings);
    }
  }
}

export default new InvoiceService();