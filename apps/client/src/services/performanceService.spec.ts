import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import performanceService from './performanceService';

// Mock dependencies
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: '14.0',
    select: jest.fn((options) => options.ios || options.default),
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/documents/',
  bundleDirectory: '/mock/bundle/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  readAsStringAsync: jest.fn(),
  getInfoAsync: jest.fn(),
}));

// Mock global performance API
const mockPerformance = {
  now: jest.fn(() => 1000),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    jsHeapSizeLimit: 256 * 1024 * 1024, // 256MB
  },
};

(global as any).performance = mockPerformance;
(global as any).PerformanceObserver = class {
  constructor(callback: any) {}
  observe(options: any) {}
  disconnect() {}
};

describe('PerformanceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  describe('initialize', () => {
    it('should initialize performance monitoring', async () => {
      await performanceService.initialize();
      
      expect(mockPerformance.mark).toHaveBeenCalledWith('app-init-start');
    });
  });

  describe('measureBundleSize', () => {
    it('should measure bundle size in development', async () => {
      const originalDEV = __DEV__;
      Object.defineProperty(global, '__DEV__', {
        value: true,
        writable: true,
      });

      const result = await performanceService.measureBundleSize();

      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('jsBundle');
      expect(result).toHaveProperty('assets');
      expect(result).toHaveProperty('nativeModules');
      expect(result.totalSize).toBeGreaterThan(0);

      Object.defineProperty(global, '__DEV__', {
        value: originalDEV,
        writable: true,
      });
    });

    it('should measure bundle size in production', async () => {
      const originalDEV = __DEV__;
      Object.defineProperty(global, '__DEV__', {
        value: false,
        writable: true,
      });

      (FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
        size: 5000000, // 5MB
      });

      const result = await performanceService.measureBundleSize();

      expect(FileSystem.getInfoAsync).toHaveBeenCalledWith(
        '/mock/bundle/main.jsbundle'
      );
      expect(result.totalSize).toBe(5000000);

      Object.defineProperty(global, '__DEV__', {
        value: originalDEV,
        writable: true,
      });
    });

    it('should handle bundle size measurement errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (FileSystem.getInfoAsync as jest.Mock).mockRejectedValue(
        new Error('File not found')
      );

      const result = await performanceService.measureBundleSize();

      expect(result.totalSize).toBe(-1);
      expect(result.jsBundle).toBe(-1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('measureLaunchTime', () => {
    it('should measure launch time with navigation timing', () => {
      mockPerformance.getEntriesByType.mockReturnValue([
        {
          loadEventEnd: 3000,
          fetchStart: 0,
          responseEnd: 1500,
          responseStart: 500,
        },
      ]);
      mockPerformance.now.mockReturnValue(2500);

      const result = performanceService.measureLaunchTime();

      expect(result).toEqual({
        coldStart: 3000,
        warmStart: 1500,
        timeToInteractive: 2500,
        splashScreenDuration: 500,
      });
    });

    it('should use fallback values when navigation timing not available', () => {
      mockPerformance.getEntriesByType.mockReturnValue([]);
      mockPerformance.now.mockReturnValue(2000);

      const result = performanceService.measureLaunchTime();

      expect(result).toEqual({
        coldStart: 2000,
        warmStart: 1000,
        timeToInteractive: 2000,
        splashScreenDuration: 1000,
      });
    });
  });

  describe('measureMemoryUsage', () => {
    it('should measure memory usage', async () => {
      const result = await performanceService.measureMemoryUsage();

      expect(result).toHaveProperty('initial');
      expect(result).toHaveProperty('afterLoad');
      expect(result).toHaveProperty('peak');
      expect(result).toHaveProperty('average');
      expect(result.afterLoad).toBe(50 * 1024 * 1024);
    });

    it('should track memory measurements over time', async () => {
      // First measurement
      await performanceService.measureMemoryUsage();
      
      // Change memory value
      mockPerformance.memory.usedJSHeapSize = 60 * 1024 * 1024;
      
      // Second measurement
      const result = await performanceService.measureMemoryUsage();

      expect(result.peak).toBe(60 * 1024 * 1024);
      expect(result.average).toBeGreaterThan(0);
    });
  });

  describe('startFrameRateMeasurement', () => {
    jest.useFakeTimers();

    it('should start frame rate measurement', () => {
      performanceService.startFrameRateMeasurement('scrolling');

      // Fast forward time to trigger measurements
      jest.advanceTimersByTime(5100);

      // Should auto-stop after 5 seconds
      expect(mockPerformance.now).toHaveBeenCalled();
    });

    it('should measure frame rates for different types', () => {
      performanceService.startFrameRateMeasurement('navigation');
      jest.advanceTimersByTime(5100);

      performanceService.startFrameRateMeasurement('animations');
      jest.advanceTimersByTime(5100);

      expect(mockPerformance.now).toHaveBeenCalled();
    });

    jest.useRealTimers();
  });

  describe('recordMeasurement', () => {
    it('should record custom measurements', () => {
      performanceService.recordMeasurement('custom-metric', 150);
      performanceService.recordMeasurement('custom-metric', 200);
      performanceService.recordMeasurement('custom-metric', 175);

      // Measurements should be stored internally
      // We can verify this indirectly through captureBaseline
    });
  });

  describe('captureBaseline', () => {
    it('should capture complete performance baseline', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

      const baseline = await performanceService.captureBaseline();

      expect(baseline).toHaveProperty('timestamp');
      expect(baseline).toHaveProperty('bundleSize');
      expect(baseline).toHaveProperty('launchTime');
      expect(baseline).toHaveProperty('memoryUsage');
      expect(baseline).toHaveProperty('frameRates');
      expect(baseline).toHaveProperty('deviceInfo');

      expect(FileSystem.writeAsStringAsync).toHaveBeenCalledWith(
        '/mock/documents/performance-baseline.json',
        expect.any(String)
      );

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance baseline captured')
      );

      consoleLogSpy.mockRestore();
    });

    it('should handle baseline save errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValue(
        new Error('Write failed')
      );

      await performanceService.captureBaseline();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save baseline:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadBaseline', () => {
    it('should load existing baseline', async () => {
      const mockBaseline = {
        timestamp: '2024-01-01T00:00:00Z',
        bundleSize: { totalSize: 5000000 },
        launchTime: { coldStart: 2000 },
      };

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(mockBaseline)
      );

      const result = await performanceService.loadBaseline();

      expect(result).toEqual(mockBaseline);
      expect(FileSystem.readAsStringAsync).toHaveBeenCalledWith(
        '/mock/documents/performance-baseline.json'
      );
    });

    it('should return null when no baseline exists', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(
        new Error('File not found')
      );

      const result = await performanceService.loadBaseline();

      expect(result).toBeNull();
      expect(consoleLogSpy).toHaveBeenCalledWith('No existing baseline found');

      consoleLogSpy.mockRestore();
    });
  });

  describe('compareWithBaseline', () => {
    it('should compare current metrics with baseline', async () => {
      const mockBaseline = {
        timestamp: '2024-01-01T00:00:00Z',
        bundleSize: { totalSize: 5000000 },
        launchTime: { coldStart: 2000 },
        memoryUsage: { average: 50 * 1024 * 1024 },
        frameRates: { scrolling: { average: 58 } },
      };

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue(
        JSON.stringify(mockBaseline)
      );

      const comparison = await performanceService.compareWithBaseline();

      expect(comparison).toHaveProperty('bundleSize');
      expect(comparison).toHaveProperty('launchTime');
      expect(comparison).toHaveProperty('memory');
      expect(comparison).toHaveProperty('frameRate');

      expect(comparison.bundleSize).toHaveProperty('current');
      expect(comparison.bundleSize).toHaveProperty('baseline');
      expect(comparison.bundleSize).toHaveProperty('change');
    });

    it('should return null when no baseline exists', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      (FileSystem.readAsStringAsync as jest.Mock).mockRejectedValue(
        new Error('File not found')
      );

      const comparison = await performanceService.compareWithBaseline();

      expect(comparison).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No baseline to compare against'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('generateReport', () => {
    it('should generate performance report', async () => {
      // First capture a baseline
      await performanceService.captureBaseline();

      const report = performanceService.generateReport();

      expect(report).toContain('Performance Baseline Report');
      expect(report).toContain('Bundle Size');
      expect(report).toContain('Launch Performance');
      expect(report).toContain('Memory Usage');
      expect(report).toContain('Frame Rates');
      expect(report).toContain('Device: ios 14.0');
    });

    it('should return error message when no baseline', () => {
      // Clear any existing baseline
      (performanceService as any).baseline = null;

      const report = performanceService.generateReport();

      expect(report).toBe(
        'No baseline data available. Run captureBaseline() first.'
      );
    });
  });

  describe('Device Info', () => {
    it('should capture iOS device info', () => {
      (Platform.OS as any) = 'ios';
      (Platform.Version as any) = '14.0';
      (Platform.select as jest.Mock).mockReturnValue('iOS Device');

      const deviceInfo = (performanceService as any).getDeviceInfo();

      expect(deviceInfo).toEqual({
        platform: 'ios',
        osVersion: '14.0',
        deviceModel: 'iOS Device',
        totalMemory: 256 * 1024 * 1024,
        cpuCores: undefined,
      });
    });

    it('should capture Android device info', () => {
      (Platform.OS as any) = 'android';
      (Platform.Version as any) = 30;
      (Platform.select as jest.Mock).mockReturnValue('Android Device');

      const deviceInfo = (performanceService as any).getDeviceInfo();

      expect(deviceInfo).toEqual({
        platform: 'android',
        osVersion: '30',
        deviceModel: 'Android Device',
        totalMemory: 256 * 1024 * 1024,
        cpuCores: undefined,
      });
    });
  });
});