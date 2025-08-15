import reportService, { ExportOptions, ExportProgress } from './reportService';
import apiClient from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { addToExportHistory } from '../components/features/organizer/ExportHistoryList';
import { showExportToast } from '../components/molecules/ExportToast';

jest.mock('./apiClient');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-file-system');
jest.mock('expo-sharing');
jest.mock('../components/features/organizer/ExportHistoryList');
jest.mock('../components/molecules/ExportToast');

describe('ReportService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reportService.clearCache();
  });

  describe('getEventReport', () => {
    it('fetches event report successfully', async () => {
      const mockReport = { id: '1', title: 'Test Event' };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockReport });

      const result = await reportService.getEventReport('event-1');

      expect(apiClient.get).toHaveBeenCalledWith('/events/event-1/report');
      expect(result).toEqual(mockReport);
    });
  });

  describe('exportEventReport', () => {
    it('exports event report in specified format', async () => {
      const mockBlob = new Blob(['test']);
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockBlob });

      const result = await reportService.exportEventReport('event-1', 'pdf');

      expect(apiClient.get).toHaveBeenCalledWith('/events/event-1/report/export', {
        params: { format: 'pdf' },
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });
  });

  describe('getFinancialReport', () => {
    it('returns cached data if available', async () => {
      const mockReport = { reportId: '1', eventId: 'event-1' };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockReport });

      // First call - should fetch from API
      const result1 = await reportService.getFinancialReport('event-1');
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Second call - should return from cache
      const result2 = await reportService.getFinancialReport('event-1');
      expect(apiClient.get).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(result1);
    });

    it('falls back to AsyncStorage on network error', async () => {
      const mockReport = { reportId: '1', eventId: 'event-1' };
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network error'));
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockReport));

      const result = await reportService.getFinancialReport('event-1');

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('report-event-1');
      expect(result).toEqual(mockReport);
    });
  });

  describe('exportWithProgress', () => {
    it('exports data with progress tracking', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockBlob });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (addToExportHistory as jest.Mock).mockResolvedValue(undefined);
      (showExportToast as jest.Mock).mockImplementation(() => {});

      const options: ExportOptions = {
        dataTypes: ['attendees', 'revenue'],
        format: 'csv',
        eventName: 'Test Event',
      };

      const progressUpdates: ExportProgress[] = [];
      const progressCallback = (progress: ExportProgress) => {
        progressUpdates.push(progress);
      };

      const exportId = await reportService.exportWithProgress(options, progressCallback);

      expect(exportId).toBeDefined();

      // Wait for export to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify progress callbacks were called
      expect(progressUpdates.some(p => p.stage === 'preparing')).toBe(true);
      expect(progressUpdates.some(p => p.stage === 'generating')).toBe(true);
      expect(progressUpdates.some(p => p.stage === 'downloading')).toBe(true);
      expect(progressUpdates.some(p => p.stage === 'complete')).toBe(true);

      // Verify API call
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/reports/export',
        expect.objectContaining({
          format: 'csv',
          dataTypes: ['attendees', 'revenue'],
          includeAttendees: true,
          includeRevenue: true,
        }),
        expect.objectContaining({
          responseType: 'blob',
        })
      );

      // Verify history and toast
      expect(addToExportHistory).toHaveBeenCalled();
      expect(showExportToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'success',
          title: 'Export Successful',
        })
      );
    });

    it('shows error toast on export failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Export failed'));
      (showExportToast as jest.Mock).mockImplementation(() => {});

      const options: ExportOptions = {
        dataTypes: ['attendees'],
        format: 'pdf',
      };

      await reportService.exportWithProgress(options);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(showExportToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
          title: 'Export Failed',
        })
      );
    });
  });

  describe('Export Queue', () => {
    it('processes multiple exports in queue', async () => {
      const mockBlob = new Blob(['test']);
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockBlob });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: true });
      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (addToExportHistory as jest.Mock).mockResolvedValue(undefined);
      (showExportToast as jest.Mock).mockImplementation(() => {});

      const options1: ExportOptions = {
        dataTypes: ['attendees'],
        format: 'csv',
        eventName: 'Event 1',
      };

      const options2: ExportOptions = {
        dataTypes: ['revenue'],
        format: 'pdf',
        eventName: 'Event 2',
      };

      const id1 = await reportService.exportWithProgress(options1);
      const id2 = await reportService.exportWithProgress(options2);

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);

      // Check queue status
      const status = reportService.getQueueStatus();
      expect(status.isProcessing).toBe(true);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 4000));

      // Both exports should be completed
      expect(apiClient.post).toHaveBeenCalledTimes(2);
      expect(addToExportHistory).toHaveBeenCalledTimes(2);
    });

    it('cancels export from queue', () => {
      const options: ExportOptions = {
        dataTypes: ['attendees'],
        format: 'csv',
      };

      const exportId = reportService.exportWithProgress(options);
      
      const statusBefore = reportService.getQueueStatus();
      expect(statusBefore.queueLength).toBeGreaterThan(0);

      reportService.cancelExport(exportId);

      const statusAfter = reportService.getQueueStatus();
      expect(statusAfter.queueLength).toBeLessThan(statusBefore.queueLength);
    });
  });

  describe('Helper Methods', () => {
    it('generates correct filename', () => {
      const filename = reportService.generateFilename('Test Event!@#', 'pdf');
      
      expect(filename).toMatch(/Test_Event___Report_\d{4}-\d{2}-\d{2}\.pdf/);
    });

    it('returns correct content type', () => {
      expect(reportService.getContentType('pdf')).toBe('application/pdf');
      expect(reportService.getContentType('csv')).toBe('text/csv');
      expect(reportService.getContentType('excel')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });

  describe('Platform-specific download', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', {
        get: () => originalPlatform,
      });
    });

    it('downloads file on web platform', async () => {
      Object.defineProperty(Platform, 'OS', {
        get: () => 'web',
      });

      // Mock DOM methods
      const mockCreateElement = jest.fn(() => ({
        click: jest.fn(),
        href: '',
        download: '',
      }));
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockCreateObjectURL = jest.fn(() => 'blob:url');
      const mockRevokeObjectURL = jest.fn();

      global.document = {
        createElement: mockCreateElement,
        body: {
          appendChild: mockAppendChild,
          removeChild: mockRemoveChild,
        },
      } as any;
      global.window = {
        URL: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL,
        },
      } as any;

      const mockBlob = new Blob(['test']);
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockBlob });
      (addToExportHistory as jest.Mock).mockResolvedValue(undefined);
      (showExportToast as jest.Mock).mockImplementation(() => {});

      const options: ExportOptions = {
        dataTypes: ['attendees'],
        format: 'csv',
      };

      await reportService.exportWithProgress(options);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    it('saves file on mobile platform', async () => {
      Object.defineProperty(Platform, 'OS', {
        get: () => 'ios',
      });

      const mockBlob = new Blob(['test']);
      (apiClient.post as jest.Mock).mockResolvedValue({ data: mockBlob });
      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({ exists: false });
      (FileSystem.makeDirectoryAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(undefined);
      (FileSystem.documentDirectory as any) = '/documents/';
      (addToExportHistory as jest.Mock).mockResolvedValue(undefined);
      (showExportToast as jest.Mock).mockImplementation(() => {});

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onloadend: null as any,
        result: 'data:text/csv;base64,dGVzdA==',
      };
      global.FileReader = jest.fn(() => mockFileReader) as any;

      const options: ExportOptions = {
        dataTypes: ['attendees'],
        format: 'csv',
      };

      const exportPromise = reportService.exportWithProgress(options);

      // Wait a bit then trigger FileReader onloadend
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (mockFileReader.onloadend) {
        await mockFileReader.onloadend();
      }

      await exportPromise;
      await new Promise(resolve => setTimeout(resolve, 500));

      expect(FileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        '/documents/exports',
        { intermediates: true }
      );
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    it('clears all caches', async () => {
      const mockReport = { reportId: '1', eventId: 'event-1' };
      (apiClient.get as jest.Mock).mockResolvedValue({ data: mockReport });

      // Load data to populate cache
      await reportService.getFinancialReport('event-1');
      
      // Clear cache
      reportService.clearCache();

      // Next call should hit API again
      await reportService.getFinancialReport('event-1');
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});