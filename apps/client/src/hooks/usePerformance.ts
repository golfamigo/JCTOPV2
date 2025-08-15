import { useRef, useCallback, useEffect } from 'react';
import performanceService from '../services/performanceService';

interface PerformanceHookReturn {
  startMeasure: (name: string) => void;
  endMeasure: (name: string) => void;
  measureRender: (componentName: string) => void;
  measureAsync: <T>(name: string, fn: () => Promise<T>) => Promise<T>;
  captureBaseline: () => Promise<void>;
  startFrameRateMeasurement: (type: 'scrolling' | 'navigation' | 'animations') => void;
}

/**
 * Hook for performance monitoring and measurement
 */
export const usePerformance = (): PerformanceHookReturn => {
  const measurementMarks = useRef<Map<string, number>>(new Map());
  const renderCount = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    // Initialize performance service on mount
    performanceService.initialize();
  }, []);

  /**
   * Start a performance measurement
   */
  const startMeasure = useCallback((name: string) => {
    const startTime = performance.now();
    measurementMarks.current.set(name, startTime);
    
    if (__DEV__) {
      console.log(`⏱️ [Performance] Started measuring: ${name}`);
    }
  }, []);

  /**
   * End a performance measurement
   */
  const endMeasure = useCallback((name: string) => {
    const startTime = measurementMarks.current.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    performanceService.recordMeasurement(name, duration);
    measurementMarks.current.delete(name);

    if (__DEV__) {
      console.log(`⏱️ [Performance] ${name}: ${duration.toFixed(2)}ms`);
    }

    // Warn if operation took too long
    if (duration > 1000) {
      console.warn(`⚠️ Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }
  }, []);

  /**
   * Measure component render performance
   */
  const measureRender = useCallback((componentName: string) => {
    const count = (renderCount.current.get(componentName) || 0) + 1;
    renderCount.current.set(componentName, count);

    if (__DEV__ && count > 10) {
      console.warn(`⚠️ Component "${componentName}" has rendered ${count} times`);
    }
  }, []);

  /**
   * Measure async operation performance
   */
  const measureAsync = useCallback(async <T,>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    startMeasure(name);
    try {
      const result = await fn();
      endMeasure(name);
      return result;
    } catch (error) {
      endMeasure(name);
      throw error;
    }
  }, [startMeasure, endMeasure]);

  /**
   * Capture performance baseline
   */
  const captureBaseline = useCallback(async () => {
    try {
      await performanceService.captureBaseline();
      console.log('✅ Performance baseline captured');
    } catch (error) {
      console.error('Failed to capture baseline:', error);
    }
  }, []);

  /**
   * Start frame rate measurement
   */
  const startFrameRateMeasurement = useCallback((
    type: 'scrolling' | 'navigation' | 'animations'
  ) => {
    performanceService.startFrameRateMeasurement(type);
  }, []);

  return {
    startMeasure,
    endMeasure,
    measureRender,
    measureAsync,
    captureBaseline,
    startFrameRateMeasurement,
  };
};

export default usePerformance;