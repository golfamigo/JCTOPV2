import { EventReport } from '@jctop-event/shared-types';
import apiClient from './apiClient';

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

class ReportService {
  /**
   * Get comprehensive event report
   */
  async getEventReport(eventId: string): Promise<EventReport> {
    const response = await apiClient.get(`/events/${eventId}/report`);
    return response.data;
  }

  /**
   * Export event report in specified format
   */
  async exportEventReport(eventId: string, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> {
    const response = await apiClient.get(`/events/${eventId}/report/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Download exported report file
   */
  downloadFile(blob: Blob, filename: string): void {
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
}

export default new ReportService();