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
      return await apiClient.get<InvoiceSettings>(`/events/${eventId}/invoice-settings`);
    } catch (error: any) {
      if (error.message?.includes('404')) {
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
    return await apiClient.post<InvoiceSettings>(`/events/${eventId}/invoice-settings`, settings);
  }

  /**
   * Update invoice settings for an event
   */
  async updateInvoiceSettings(
    eventId: string, 
    settings: UpdateInvoiceSettingsRequest
  ): Promise<InvoiceSettings> {
    return await apiClient.put<InvoiceSettings>(`/events/${eventId}/invoice-settings`, settings);
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