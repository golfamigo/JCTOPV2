import apiClient from './apiClient';
import { DiscountCodeResponse, CreateDiscountCodeDto, UpdateDiscountCodeDto } from '@jctop-event/shared-types';

class DiscountCodeService {
  /**
   * Create a new discount code for an event
   */
  async createDiscountCode(eventId: string, discountCodeData: CreateDiscountCodeDto): Promise<DiscountCodeResponse> {
    try {
      const response = await apiClient.post<DiscountCodeResponse>(`/events/${eventId}/discount-codes`, discountCodeData);
      return response;
    } catch (error) {
      console.error('Error creating discount code:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create discount code');
    }
  }

  /**
   * Get all discount codes for an event
   */
  async getDiscountCodes(eventId: string): Promise<DiscountCodeResponse[]> {
    try {
      const response = await apiClient.get<DiscountCodeResponse[]>(`/events/${eventId}/discount-codes`);
      return response;
    } catch (error) {
      console.error('Error fetching discount codes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch discount codes');
    }
  }

  /**
   * Update a discount code
   */
  async updateDiscountCode(eventId: string, codeId: string, updateData: UpdateDiscountCodeDto): Promise<DiscountCodeResponse> {
    try {
      const response = await apiClient.put<DiscountCodeResponse>(`/events/${eventId}/discount-codes/${codeId}`, updateData);
      return response;
    } catch (error) {
      console.error('Error updating discount code:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to update discount code');
    }
  }

  /**
   * Delete a discount code
   */
  async deleteDiscountCode(eventId: string, codeId: string): Promise<void> {
    try {
      await apiClient.delete(`/events/${eventId}/discount-codes/${codeId}`);
    } catch (error) {
      console.error('Error deleting discount code:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete discount code');
    }
  }
}

const discountCodeService = new DiscountCodeService();
export default discountCodeService;