import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DiscountCodeResponse, CreateDiscountCodeDto, UpdateDiscountCodeDto } from '@jctop-event/shared-types';

interface CachedData<T> {
  data: T;
  timestamp: number;
}

class DiscountCodeService {
  private cache: Map<string, CachedData<any>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CACHE_KEY_PREFIX = 'discount_codes_';
  /**
   * Create a new discount code for an event
   */
  async createDiscountCode(eventId: string, discountCodeData: CreateDiscountCodeDto): Promise<DiscountCodeResponse> {
    try {
      const response = await apiClient.post<DiscountCodeResponse>(`/events/${eventId}/discount-codes`, discountCodeData);
      // Invalidate cache after creation
      this.invalidateCache(eventId);
      return response;
    } catch (error) {
      console.error('Error creating discount code:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create discount code');
    }
  }

  /**
   * Get all discount codes for an event (with caching)
   */
  async getDiscountCodes(eventId: string): Promise<DiscountCodeResponse[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${eventId}`;
    
    // Check memory cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const response = await apiClient.get<DiscountCodeResponse[]>(`/events/${eventId}/discount-codes`);
      
      // Update caches
      this.cache.set(cacheKey, { data: response, timestamp: Date.now() });
      await AsyncStorage.setItem(cacheKey, JSON.stringify(response));
      
      return response;
    } catch (error) {
      // Try to load from AsyncStorage if network fails
      try {
        const offlineData = await AsyncStorage.getItem(cacheKey);
        if (offlineData) {
          return JSON.parse(offlineData);
        }
      } catch (storageError) {
        console.error('Error loading from storage:', storageError);
      }
      
      console.error('Error fetching discount codes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch discount codes');
    }
  }

  /**
   * Update a discount code (with optimistic updates)
   */
  async updateDiscountCode(eventId: string, codeId: string, updateData: UpdateDiscountCodeDto): Promise<DiscountCodeResponse> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${eventId}`;
    
    // Optimistic update in cache
    const cached = this.cache.get(cacheKey);
    let originalData: DiscountCodeResponse[] | null = null;
    
    if (cached) {
      originalData = [...cached.data];
      const updatedData = cached.data.map((code: DiscountCodeResponse) =>
        code.id === codeId ? { ...code, ...updateData } : code
      );
      this.cache.set(cacheKey, { data: updatedData, timestamp: cached.timestamp });
    }

    try {
      const response = await apiClient.put<DiscountCodeResponse>(`/events/${eventId}/discount-codes/${codeId}`, updateData);
      // Invalidate cache to force refresh on next get
      this.invalidateCache(eventId);
      return response;
    } catch (error) {
      // Rollback optimistic update on error
      if (originalData && cached) {
        this.cache.set(cacheKey, { data: originalData, timestamp: cached.timestamp });
      }
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
      // Invalidate cache after deletion
      this.invalidateCache(eventId);
    } catch (error) {
      console.error('Error deleting discount code:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete discount code');
    }
  }

  /**
   * Bulk create discount codes
   */
  async bulkCreateDiscountCodes(eventId: string, codes: CreateDiscountCodeDto[]): Promise<DiscountCodeResponse[]> {
    try {
      const promises = codes.map(code => 
        apiClient.post<DiscountCodeResponse>(`/events/${eventId}/discount-codes`, code)
      );
      const results = await Promise.all(promises);
      this.invalidateCache(eventId);
      return results;
    } catch (error) {
      console.error('Error bulk creating discount codes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to bulk create discount codes');
    }
  }

  /**
   * Bulk delete discount codes
   */
  async bulkDeleteDiscountCodes(eventId: string, codeIds: string[]): Promise<void> {
    try {
      const promises = codeIds.map(codeId => 
        apiClient.delete(`/events/${eventId}/discount-codes/${codeId}`)
      );
      await Promise.all(promises);
      this.invalidateCache(eventId);
    } catch (error) {
      console.error('Error bulk deleting discount codes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to bulk delete discount codes');
    }
  }

  /**
   * Toggle discount code status (active/inactive)
   */
  async toggleDiscountCodeStatus(eventId: string, codeId: string, isActive: boolean): Promise<DiscountCodeResponse> {
    return this.updateDiscountCode(eventId, codeId, { status: isActive ? 'active' : 'inactive' } as any);
  }

  /**
   * Validate discount code
   */
  async validateDiscountCode(eventId: string, code: string): Promise<{ valid: boolean; discount?: DiscountCodeResponse; message?: string }> {
    try {
      const codes = await this.getDiscountCodes(eventId);
      const discount = codes.find(c => c.code === code.toUpperCase());
      
      if (!discount) {
        return { valid: false, message: 'Invalid discount code' };
      }
      
      if ((discount as any).status === 'inactive') {
        return { valid: false, message: 'Discount code is inactive' };
      }
      
      if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
        return { valid: false, message: 'Discount code has expired' };
      }
      
      return { valid: true, discount };
    } catch (error) {
      console.error('Error validating discount code:', error);
      return { valid: false, message: 'Failed to validate discount code' };
    }
  }

  /**
   * Invalidate cache for an event
   */
  private invalidateCache(eventId: string): void {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${eventId}`;
    this.cache.delete(cacheKey);
    AsyncStorage.removeItem(cacheKey).catch(console.error);
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.cache.clear();
    // Clear AsyncStorage entries
    AsyncStorage.getAllKeys().then(keys => {
      const discountKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      if (discountKeys.length > 0) {
        AsyncStorage.multiRemove(discountKeys).catch(console.error);
      }
    }).catch(console.error);
  }
}

const discountCodeService = new DiscountCodeService();
export default discountCodeService;