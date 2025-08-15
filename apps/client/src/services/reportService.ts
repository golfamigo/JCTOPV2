import { EventReport } from '@jctop-event/shared-types';
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { addToExportHistory } from '../components/features/organizer/ExportHistoryList';
import { showExportToast } from '../components/molecules/ExportToast';

// Export constants to avoid magic numbers
const EXPORT_CONSTANTS = {
  QUEUE_PROCESSING_DELAY: 1000,
  PROGRESS_STAGES: {
    PREPARING: { MIN: 0, MAX: 30 },
    GENERATING: { MIN: 30, MAX: 70 },
    DOWNLOADING: { MIN: 70, MAX: 100 }
  },
  FILE_EXPIRY_DAYS: 7,
  MAX_HISTORY_ITEMS: 50,
  LARGE_DATASET_THRESHOLD: 10000,
  PAGE_SIZE: 5000,
  MAX_FILENAME_LENGTH: 255,
  ESTIMATED_TIME: {
    PREPARING: 30,
    GENERATING: 20,
    DOWNLOADING: 5,
    LARGE_EXPORT: 60
  }
};

export interface ExportFormat {
  format: 'pdf' | 'csv' | 'excel';
  label: string;
  extension: string;
}

export const EXPORT_FORMATS: ExportFormat[] = [
  { format: 'pdf', label: 'PDF Report', extension: 'pdf' },
  { format: 'csv', label: 'CSV Data', extension: 'csv' },
  { format: 'excel', label: 'Excel Spreadsheet', extension: 'xlsx' },
];

export interface ExportOptions {
  dataTypes: string[];
  format: 'pdf' | 'csv' | 'excel';
  eventId?: string;
  eventName?: string;
}

export interface ExportProgress {
  stage: 'preparing' | 'generating' | 'downloading' | 'complete';
  progress: number;
  estimatedTime?: number;
}

export type ExportProgressCallback = (progress: ExportProgress) => void;

interface FinancialReport {
  reportId: string;
  eventId: string;
  eventTitle: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  revenue: {
    total: number;
    byTicketType: Array<{
      type: string;
      amount: number;
      quantity: number;
    }>;
    byPaymentMethod: Array<{
      method: string;
      amount: number;
    }>;
  };
  expenses: {
    total: number;
    categories: Array<{
      category: string;
      amount: number;
    }>;
  };
  netProfit: number;
  transactions: Transaction[];
  generatedAt: string;
}

interface Transaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense' | 'refund';
  description: string;
  amount: number;
  paymentMethod?: string;
  attendeeName?: string;
  ticketType?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface ReportFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  eventIds?: string[];
  transactionTypes?: ('revenue' | 'expense' | 'refund')[];
  paymentMethods?: string[];
  minAmount?: number;
  maxAmount?: number;
}

class ReportService {
  private financialCache: Map<string, { data: FinancialReport; timestamp: number }> = new Map();
  private transactionCache: Map<string, { data: Transaction[]; timestamp: number }> = new Map();
  private readonly FINANCIAL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly TRANSACTION_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  private exportQueue: Array<{ id: string; options: ExportOptions; callback?: ExportProgressCallback }> = [];
  private isProcessingQueue = false;
  /**
   * Get comprehensive event report
   */
  async getEventReport(eventId: string): Promise<EventReport> {
    return await apiClient.get<EventReport>(`/events/${eventId}/report`);
  }

  /**
   * Export event report in specified format
   */
  async exportEventReport(eventId: string, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> {
    const response = await fetch(`${apiClient['baseURL']}/events/${eventId}/report/export?format=${format}`, {
      headers: await apiClient['getAuthHeaders']() as HeadersInit,
    });
    if (!response.ok) {
      throw new Error('Export failed');
    }
    return await response.blob();
  }

  /**
   * Get financial report for an event
   */
  async getFinancialReport(eventId: string): Promise<FinancialReport> {
    const cacheKey = `financial-${eventId}`;
    const cached = this.financialCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.FINANCIAL_CACHE_TTL) {
      return cached.data;
    }

    try {
      const data = await apiClient.get<FinancialReport>(`/api/v1/events/${eventId}/financial-report`);
      
      this.financialCache.set(cacheKey, { data, timestamp: Date.now() });
      
      // Store in AsyncStorage for offline support
      await AsyncStorage.setItem(`report-${eventId}`, JSON.stringify(data));
      
      return data;
    } catch (error) {
      // Try to load from offline cache if network fails
      const offlineData = await AsyncStorage.getItem(`report-${eventId}`);
      if (offlineData) {
        return JSON.parse(offlineData);
      }
      throw error;
    }
  }

  /**
   * Get cached financial report without making API call
   */
  async getCachedFinancialReport(eventId: string): Promise<FinancialReport | null> {
    const cacheKey = `financial-${eventId}`;
    const cached = this.financialCache.get(cacheKey);
    
    if (cached) {
      return cached.data;
    }
    
    // Try AsyncStorage
    const offlineData = await AsyncStorage.getItem(`report-${eventId}`);
    if (offlineData) {
      return JSON.parse(offlineData);
    }
    
    return null;
  }

  /**
   * Get financial summary for all organizer events
   */
  async getFinancialSummary(): Promise<FinancialReport[]> {
    const cacheKey = 'financial-summary';
    const cached = this.financialCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.FINANCIAL_CACHE_TTL) {
      return cached.data as any;
    }

    try {
      const data = await apiClient.get<any>('/api/v1/organizer/financial-summary');
      
      this.financialCache.set(cacheKey, { data: data as any, timestamp: Date.now() });
      
      await AsyncStorage.setItem('financial-summary', JSON.stringify(data));
      
      return data;
    } catch (error) {
      const offlineData = await AsyncStorage.getItem('financial-summary');
      if (offlineData) {
        return JSON.parse(offlineData);
      }
      throw error;
    }
  }

  /**
   * Get transactions with filters
   */
  async getTransactions(filters: ReportFilters): Promise<Transaction[]> {
    const cacheKey = `transactions-${JSON.stringify(filters)}`;
    const cached = this.transactionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.TRANSACTION_CACHE_TTL) {
      return cached.data;
    }

    const data = await apiClient.post<Transaction[]>('/api/v1/reports/transactions', filters);
    
    this.transactionCache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  }

  /**
   * Export financial report with filters
   */
  async exportFinancialReport(filters: ReportFilters, format: 'pdf' | 'csv' | 'excel'): Promise<void> {
    const response = await fetch(`${apiClient['baseURL']}/api/v1/reports/export`, {
      method: 'POST',
      headers: await apiClient['getAuthHeaders']() as HeadersInit,
      body: JSON.stringify({ ...filters, format })
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    const filename = this.generateFilename('Financial_Report', format);
    
    if (Platform.OS === 'web') {
      this.downloadFileWeb(blob, filename);
    } else {
      await this.downloadFileMobile(blob, filename, format);
    }
  }

  /**
   * Download file on web platform
   */
  private downloadFileWeb(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download file on mobile platform
   */
  private async downloadFileMobile(blob: Blob, filename: string, format: string): Promise<void> {
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          
          // Write file
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          // Share file
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: this.getContentType(format as any),
              dialogTitle: 'Export Financial Report',
            });
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
    });
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.financialCache.clear();
    this.transactionCache.clear();
  }

  /**
   * Generate filename for export
   */
  generateFilename(eventTitle: string, format: 'pdf' | 'csv' | 'excel'): string {
    const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const date = new Date().toISOString().split('T')[0];
    const extensions = {
      pdf: 'pdf',
      csv: 'csv',
      excel: 'xlsx',
    };
    return `${sanitizedTitle}_Report_${date}.${extensions[format]}`;
  }

  /**
   * Get content type for export format
   */
  getContentType(format: 'pdf' | 'csv' | 'excel'): string {
    const contentTypes = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return contentTypes[format];
  }

  /**
   * Export data with progress tracking
   */
  async exportWithProgress(
    options: ExportOptions,
    progressCallback?: ExportProgressCallback
  ): Promise<string> {
    const exportId = Math.random().toString(36).substr(2, 9);
    
    // Add to queue
    this.exportQueue.push({ id: exportId, options, callback: progressCallback });
    
    // Process queue if not already processing
    if (!this.isProcessingQueue) {
      this.processExportQueue();
    }
    
    return exportId;
  }

  /**
   * Process export queue
   */
  private async processExportQueue(): Promise<void> {
    if (this.isProcessingQueue || this.exportQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.exportQueue.length > 0) {
      const exportItem = this.exportQueue.shift();
      if (!exportItem) continue;
      
      try {
        await this.processExport(exportItem.options, exportItem.callback);
      } catch (error) {
        console.error('Export failed:', error);
        showExportToast({
          variant: 'error',
          title: 'Export Failed',
          message: 'Unable to export data. Please try again.',
        });
      }
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Process single export with pagination support
   */
  private async processExport(
    options: ExportOptions,
    progressCallback?: ExportProgressCallback
  ): Promise<void> {
    try {
      // Stage 1: Preparing
      progressCallback?.({
        stage: 'preparing',
        progress: 10,
        estimatedTime: EXPORT_CONSTANTS.ESTIMATED_TIME.PREPARING,
      });
      
      // Check if pagination is needed (large datasets)
      const needsPagination = await this.checkDataSize(options);
      
      if (needsPagination) {
        await this.processExportWithPagination(options, progressCallback);
        return;
      }
      
      // Stage 2: Generating
      progressCallback?.({
        stage: 'generating',
        progress: 40,
        estimatedTime: EXPORT_CONSTANTS.ESTIMATED_TIME.GENERATING,
      });
      
      // Build request data based on selected data types
      const requestData = this.buildExportRequest(options);
      
      // Make API call
      const response = await fetch(`${apiClient['baseURL']}/api/v1/reports/export`, {
        method: 'POST',
        headers: {
          ...(await apiClient['getAuthHeaders']() as HeadersInit),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Stage 3: Downloading
      progressCallback?.({
        stage: 'downloading',
        progress: 80,
        estimatedTime: EXPORT_CONSTANTS.ESTIMATED_TIME.DOWNLOADING,
      });
      
      const blob = await response.blob();
      const filename = this.sanitizeFilename(this.generateFilename(options.eventName || 'Export', options.format));
      let filePath: string | undefined;
      
      if (Platform.OS === 'web') {
        this.downloadFileWeb(blob, filename);
      } else {
        filePath = await this.saveFileMobile(blob, filename, options.format);
      }
      
      // Stage 4: Complete
      progressCallback?.({
        stage: 'complete',
        progress: 100,
      });
      
      // Add to export history
      await addToExportHistory({
        fileName: filename,
        format: options.format,
        dataTypes: options.dataTypes,
        exportDate: new Date().toISOString(),
        fileSize: blob.size,
        filePath: filePath ? this.sanitizePath(filePath) : undefined,
        status: 'success',
        eventName: options.eventName,
      });
      
      // Show success toast
      showExportToast({
        variant: 'success',
        title: 'Export Successful',
        message: `${filename} has been exported successfully`,
        fileName: filename,
        filePath,
      });
    } catch (error) {
      progressCallback?.({
        stage: 'complete',
        progress: 0,
      });
      throw error;
    }
  }

  /**
   * Check if data size requires pagination
   */
  private async checkDataSize(options: ExportOptions): Promise<boolean> {
    const LARGE_DATASET_THRESHOLD = EXPORT_CONSTANTS.LARGE_DATASET_THRESHOLD; // Records threshold for pagination
    
    try {
      const response = await apiClient.post<{ totalRecords: number }>('/api/v1/reports/count', {
        dataTypes: options.dataTypes,
        eventId: options.eventId,
      });
      
      return response.totalRecords > LARGE_DATASET_THRESHOLD;
    } catch {
      // If count check fails, proceed without pagination
      return false;
    }
  }

  /**
   * Process export with pagination for large datasets
   */
  private async processExportWithPagination(
    options: ExportOptions,
    progressCallback?: ExportProgressCallback
  ): Promise<void> {
    const PAGE_SIZE = EXPORT_CONSTANTS.PAGE_SIZE;
    let currentPage = 0;
    let hasMoreData = true;
    const chunks: Blob[] = [];
    
    progressCallback?.({
      stage: 'generating',
      progress: 20,
      estimatedTime: EXPORT_CONSTANTS.ESTIMATED_TIME.LARGE_EXPORT,
    });
    
    while (hasMoreData) {
      const requestData = {
        ...this.buildExportRequest(options),
        pagination: {
          page: currentPage,
          pageSize: PAGE_SIZE,
        },
      };
      
      const response = await fetch(`${apiClient['baseURL']}/api/v1/reports/export`, {
        method: 'POST',
        headers: {
          ...(await apiClient['getAuthHeaders']() as HeadersInit),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      chunks.push(blob);
      
      // Check if there's more data
      hasMoreData = response.headers.get('x-has-more-pages') === 'true';
      currentPage++;
      
      // Update progress
      const progress = Math.min(80, 20 + (currentPage * 10));
      progressCallback?.({
        stage: 'generating',
        progress,
        estimatedTime: Math.max(10, 60 - (currentPage * 5)),
      });
    }
    
    // Combine chunks
    const combinedBlob = new Blob(chunks, { type: chunks[0].type });
    const filename = this.sanitizeFilename(this.generateFilename(options.eventName || 'Export', options.format));
    
    progressCallback?.({
      stage: 'downloading',
      progress: 90,
      estimatedTime: EXPORT_CONSTANTS.ESTIMATED_TIME.DOWNLOADING,
    });
    
    if (Platform.OS === 'web') {
      this.downloadFileWeb(combinedBlob, filename);
    } else {
      await this.saveFileMobile(combinedBlob, filename, options.format);
    }
    
    progressCallback?.({
      stage: 'complete',
      progress: 100,
    });
    
    showExportToast({
      variant: 'success',
      title: 'Large Export Completed',
      message: `${filename} has been exported successfully (${currentPage} pages processed)`,
      fileName: filename,
    });
  }

  /**
   * Sanitize filename to prevent path traversal
   */
  private sanitizeFilename(filename: string): string {
    // Remove any path separators and dangerous characters
    return filename
      .replace(/[\/\\]/g, '_') // Replace path separators
      .replace(/\.\./g, '_')   // Remove parent directory references
      .replace(/[<>:"|?*]/g, '_') // Remove invalid filename characters
      .replace(/^\./, '_')     // Don't allow hidden files
      .substring(0, EXPORT_CONSTANTS.MAX_FILENAME_LENGTH);      // Limit filename length
  }

  /**
   * Sanitize file path to prevent traversal attacks
   */
  private sanitizePath(path: string): string {
    // Only allow alphanumeric, dash, underscore, and forward slash
    const sanitized = path.replace(/[^a-zA-Z0-9\-_\/\.]/g, '');
    
    // Prevent directory traversal
    if (sanitized.includes('..') || sanitized.includes('//')) {
      throw new Error('Invalid file path');
    }
    
    return sanitized;
  }

  /**
   * Build export request data
   */
  private buildExportRequest(options: ExportOptions): any {
    const request: any = {
      format: options.format,
      dataTypes: options.dataTypes,
    };
    
    if (options.eventId) {
      request.eventId = options.eventId;
    }
    
    // Add specific data based on selected types
    if (options.dataTypes.includes('attendees')) {
      request.includeAttendees = true;
    }
    if (options.dataTypes.includes('revenue')) {
      request.includeRevenue = true;
    }
    if (options.dataTypes.includes('tickets')) {
      request.includeTickets = true;
    }
    if (options.dataTypes.includes('analytics')) {
      request.includeAnalytics = true;
    }
    if (options.dataTypes.includes('transactions')) {
      request.includeTransactions = true;
    }
    
    return request;
  }

  /**
   * Save file on mobile and return path with security
   */
  private async saveFileMobile(blob: Blob, filename: string, format: string): Promise<string> {
    // Sanitize filename to prevent path traversal
    const safeFilename = this.sanitizeFilename(filename);
    const exportDir = `${FileSystem.documentDirectory}exports`;
    const fileUri = `${exportDir}/${safeFilename}`;
    
    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(exportDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });
    }
    
    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          
          // Write file with sanitized path
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          
          resolve(fileUri);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
    });
  }

  /**
   * Cancel export by ID
   */
  cancelExport(exportId: string): void {
    this.exportQueue = this.exportQueue.filter(item => item.id !== exportId);
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { queueLength: number; isProcessing: boolean } {
    return {
      queueLength: this.exportQueue.length,
      isProcessing: this.isProcessingQueue,
    };
  }
}

export default new ReportService();