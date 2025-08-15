// Use React Native's built-in performance API
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Polyfill for performance API if not available
const performance = global.performance || {
  now: () => Date.now(),
  mark: () => {},
  measure: () => {},
  getEntriesByType: () => [],
  getEntriesByName: () => [],
};

// Mock PerformanceObserver if not available
const PerformanceObserver = (global as any).PerformanceObserver || class {
  constructor(callback: any) {}
  observe(options: any) {}
  disconnect() {}
};

export interface PerformanceBaseline {
  timestamp: string;
  bundleSize?: BundleMetrics;
  launchTime?: LaunchMetrics;
  memoryUsage?: MemoryMetrics;
  frameRates?: FrameRateMetrics;
  deviceInfo: DeviceMetrics;
}

export interface BundleMetrics {
  totalSize: number;
  jsBundle: number;
  assets: number;
  nativeModules: number;
}

export interface LaunchMetrics {
  coldStart: number;
  warmStart: number;
  timeToInteractive: number;
  splashScreenDuration: number;
}

export interface MemoryMetrics {
  initial: number;
  afterLoad: number;
  peak: number;
  average: number;
}

export interface FrameRateMetrics {
  scrolling: {
    average: number;
    min: number;
    max: number;
    droppedFrames: number;
  };
  navigation: {
    average: number;
    transitionTime: number;
  };
  animations: {
    average: number;
    smoothness: number;
  };
}

export interface DeviceMetrics {
  platform: string;
  osVersion: string;
  deviceModel: string;
  totalMemory?: number;
  cpuCores?: number;
}

class PerformanceService {
  private baseline: PerformanceBaseline | null = null;
  private measurements: Map<string, number[]> = new Map();
  private frameRateObserver: any = null;

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    // Set up performance observer for navigation timing
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list: any) => {
        list.getEntries().forEach((entry: any) => {
          this.recordMeasurement(entry.name, entry.duration);
        });
      });
      
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }

    // Mark app initialization
    performance.mark('app-init-start');
  }

  /**
   * Measure current bundle size
   */
  async measureBundleSize(): Promise<BundleMetrics> {
    try {
      // Get bundle info from Metro bundler output
      // In production, this would analyze the actual bundle files
      const bundleInfo = {
        totalSize: 0,
        jsBundle: 0,
        assets: 0,
        nativeModules: 0,
      };

      // Check if we can access bundle stats (development only)
      if (__DEV__) {
        // Estimate based on loaded modules
        const modules = require.cache ? Object.keys(require.cache).length : 0;
        bundleInfo.jsBundle = modules * 5000; // Rough estimate: 5KB per module
        bundleInfo.assets = 2000000; // 2MB estimated for assets
        bundleInfo.nativeModules = 3000000; // 3MB for native modules
        bundleInfo.totalSize = bundleInfo.jsBundle + bundleInfo.assets + bundleInfo.nativeModules;
      } else {
        // In production, read actual bundle size from file system
        const bundlePath = `${FileSystem.bundleDirectory}main.jsbundle`;
        const bundleInfo = await FileSystem.getInfoAsync(bundlePath);
        if (bundleInfo.exists && bundleInfo.size) {
          (bundleInfo as any).totalSize = bundleInfo.size;
        }
      }

      return bundleInfo;
    } catch (error) {
      console.error('Failed to measure bundle size:', error);
      return {
        totalSize: -1,
        jsBundle: -1,
        assets: -1,
        nativeModules: -1,
      };
    }
  }

  /**
   * Measure app launch time
   */
  measureLaunchTime(): LaunchMetrics {
    const now = performance.now();
    
    // Get navigation timing if available
    const navTiming = performance.getEntriesByType('navigation')[0] as any;
    
    return {
      coldStart: navTiming?.loadEventEnd - navTiming?.fetchStart || now,
      warmStart: navTiming?.responseEnd - navTiming?.fetchStart || now / 2,
      timeToInteractive: now,
      splashScreenDuration: navTiming?.responseStart - navTiming?.fetchStart || 1000,
    };
  }

  /**
   * Measure memory usage
   */
  async measureMemoryUsage(): Promise<MemoryMetrics> {
    const measurements = this.measurements.get('memory') || [];
    
    // Get current memory if available
    const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
    measurements.push(currentMemory);
    
    this.measurements.set('memory', measurements);
    
    return {
      initial: measurements[0] || currentMemory,
      afterLoad: currentMemory,
      peak: Math.max(...measurements, currentMemory),
      average: measurements.reduce((a, b) => a + b, 0) / measurements.length || currentMemory,
    };
  }

  /**
   * Start measuring frame rates
   */
  startFrameRateMeasurement(type: 'scrolling' | 'navigation' | 'animations'): void {
    const frameRates: number[] = [];
    let lastFrameTime = performance.now();
    let droppedFrames = 0;

    const measureFrame = () => {
      const currentTime = performance.now();
      const frameDuration = currentTime - lastFrameTime;
      const fps = 1000 / frameDuration;
      
      frameRates.push(fps);
      
      if (fps < 55) { // Below 55 fps is considered dropped
        droppedFrames++;
      }
      
      lastFrameTime = currentTime;
    };

    // Store the measurement function for later stopping
    this.frameRateObserver = measureFrame;
    
    // Start measuring
    const interval = setInterval(measureFrame, 16); // ~60fps
    
    // Auto-stop after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      this.stopFrameRateMeasurement(type, frameRates, droppedFrames);
    }, 5000);
  }

  /**
   * Stop frame rate measurement and calculate metrics
   */
  private stopFrameRateMeasurement(
    type: string,
    frameRates: number[],
    droppedFrames: number
  ): void {
    if (frameRates.length === 0) return;

    const metrics = {
      average: frameRates.reduce((a, b) => a + b, 0) / frameRates.length,
      min: Math.min(...frameRates),
      max: Math.max(...frameRates),
      droppedFrames,
    };

    this.measurements.set(`frameRate-${type}`, frameRates);
    console.log(`Frame rate metrics for ${type}:`, metrics);
  }

  /**
   * Get device information
   */
  private getDeviceInfo(): DeviceMetrics {
    return {
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceModel: Platform.select({
        ios: 'iOS Device',
        android: 'Android Device',
        default: 'Unknown',
      }),
      totalMemory: (performance as any).memory?.jsHeapSizeLimit,
      cpuCores: undefined, // Would need native module for this
    };
  }

  /**
   * Record a custom measurement
   */
  recordMeasurement(name: string, value: number): void {
    const measurements = this.measurements.get(name) || [];
    measurements.push(value);
    this.measurements.set(name, measurements);
  }

  /**
   * Capture all performance baselines
   */
  async captureBaseline(): Promise<PerformanceBaseline> {
    console.log('📊 Capturing performance baseline...');

    const baseline: PerformanceBaseline = {
      timestamp: new Date().toISOString(),
      bundleSize: await this.measureBundleSize(),
      launchTime: this.measureLaunchTime(),
      memoryUsage: await this.measureMemoryUsage(),
      frameRates: this.getFrameRateMetrics(),
      deviceInfo: this.getDeviceInfo(),
    };

    this.baseline = baseline;
    await this.saveBaseline(baseline);
    
    console.log('✅ Performance baseline captured:', baseline);
    return baseline;
  }

  /**
   * Get frame rate metrics from measurements
   */
  private getFrameRateMetrics(): FrameRateMetrics {
    const scrollingRates = this.measurements.get('frameRate-scrolling') || [60];
    const navigationRates = this.measurements.get('frameRate-navigation') || [60];
    const animationRates = this.measurements.get('frameRate-animations') || [60];

    return {
      scrolling: {
        average: scrollingRates.reduce((a, b) => a + b, 0) / scrollingRates.length || 60,
        min: Math.min(...scrollingRates) || 60,
        max: Math.max(...scrollingRates) || 60,
        droppedFrames: scrollingRates.filter(fps => fps < 55).length,
      },
      navigation: {
        average: navigationRates.reduce((a, b) => a + b, 0) / navigationRates.length || 60,
        transitionTime: 300, // Default navigation transition time
      },
      animations: {
        average: animationRates.reduce((a, b) => a + b, 0) / animationRates.length || 60,
        smoothness: animationRates.filter(fps => fps >= 58).length / animationRates.length || 1,
      },
    };
  }

  /**
   * Save baseline to file system
   */
  private async saveBaseline(baseline: PerformanceBaseline): Promise<void> {
    try {
      const baselineJson = JSON.stringify(baseline, null, 2);
      const filePath = `${FileSystem.documentDirectory}performance-baseline.json`;
      
      await FileSystem.writeAsStringAsync(filePath, baselineJson);
      console.log('📁 Baseline saved to:', filePath);
    } catch (error) {
      console.error('Failed to save baseline:', error);
    }
  }

  /**
   * Load existing baseline
   */
  async loadBaseline(): Promise<PerformanceBaseline | null> {
    try {
      const filePath = `${FileSystem.documentDirectory}performance-baseline.json`;
      const baselineJson = await FileSystem.readAsStringAsync(filePath);
      
      this.baseline = JSON.parse(baselineJson);
      console.log('📂 Baseline loaded from:', filePath);
      return this.baseline;
    } catch (error) {
      console.log('No existing baseline found');
      return null;
    }
  }

  /**
   * Compare current metrics with baseline
   */
  async compareWithBaseline(): Promise<any> {
    const current = await this.captureBaseline();
    const baseline = this.baseline || await this.loadBaseline();

    if (!baseline) {
      console.warn('No baseline to compare against');
      return null;
    }

    const comparison = {
      bundleSize: {
        current: current.bundleSize?.totalSize || 0,
        baseline: baseline.bundleSize?.totalSize || 0,
        change: ((current.bundleSize?.totalSize || 0) - (baseline.bundleSize?.totalSize || 0)) / (baseline.bundleSize?.totalSize || 1) * 100,
      },
      launchTime: {
        current: current.launchTime?.coldStart || 0,
        baseline: baseline.launchTime?.coldStart || 0,
        change: ((current.launchTime?.coldStart || 0) - (baseline.launchTime?.coldStart || 0)) / (baseline.launchTime?.coldStart || 1) * 100,
      },
      memory: {
        current: current.memoryUsage?.average || 0,
        baseline: baseline.memoryUsage?.average || 0,
        change: ((current.memoryUsage?.average || 0) - (baseline.memoryUsage?.average || 0)) / (baseline.memoryUsage?.average || 1) * 100,
      },
      frameRate: {
        current: current.frameRates?.scrolling.average || 60,
        baseline: baseline.frameRates?.scrolling.average || 60,
        change: ((current.frameRates?.scrolling.average || 60) - (baseline.frameRates?.scrolling.average || 60)),
      },
    };

    console.log('📊 Performance Comparison:', comparison);
    return comparison;
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const baseline = this.baseline;
    if (!baseline) {
      return 'No baseline data available. Run captureBaseline() first.';
    }

    const report = `
# Performance Baseline Report
Generated: ${baseline.timestamp}
Device: ${baseline.deviceInfo.platform} ${baseline.deviceInfo.osVersion}

## Bundle Size
- Total: ${(baseline.bundleSize?.totalSize || 0) / 1024 / 1024}MB
- JS Bundle: ${(baseline.bundleSize?.jsBundle || 0) / 1024 / 1024}MB
- Assets: ${(baseline.bundleSize?.assets || 0) / 1024 / 1024}MB
- Native Modules: ${(baseline.bundleSize?.nativeModules || 0) / 1024 / 1024}MB

## Launch Performance
- Cold Start: ${baseline.launchTime?.coldStart}ms
- Warm Start: ${baseline.launchTime?.warmStart}ms
- Time to Interactive: ${baseline.launchTime?.timeToInteractive}ms
- Splash Screen: ${baseline.launchTime?.splashScreenDuration}ms

## Memory Usage
- Initial: ${(baseline.memoryUsage?.initial || 0) / 1024 / 1024}MB
- After Load: ${(baseline.memoryUsage?.afterLoad || 0) / 1024 / 1024}MB
- Peak: ${(baseline.memoryUsage?.peak || 0) / 1024 / 1024}MB
- Average: ${(baseline.memoryUsage?.average || 0) / 1024 / 1024}MB

## Frame Rates
### Scrolling
- Average: ${baseline.frameRates?.scrolling.average}fps
- Min: ${baseline.frameRates?.scrolling.min}fps
- Max: ${baseline.frameRates?.scrolling.max}fps
- Dropped Frames: ${baseline.frameRates?.scrolling.droppedFrames}

### Navigation
- Average: ${baseline.frameRates?.navigation.average}fps
- Transition Time: ${baseline.frameRates?.navigation.transitionTime}ms

### Animations
- Average: ${baseline.frameRates?.animations.average}fps
- Smoothness: ${(baseline.frameRates?.animations.smoothness || 0) * 100}%
    `;

    return report.trim();
  }
}

export const performanceService = new PerformanceService();
export default performanceService;