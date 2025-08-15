import { InteractionManager } from 'react-native';

/**
 * Defer expensive operations until after interactions
 */
export const deferExpensiveOperation = (callback: () => void): void => {
  InteractionManager.runAfterInteractions(() => {
    callback();
  });
};

/**
 * Batch multiple updates together
 */
export class BatchProcessor<T> {
  private queue: T[] = [];
  private isProcessing = false;
  private batchSize: number;
  private processFn: (items: T[]) => void;
  private delay: number;

  constructor(
    processFn: (items: T[]) => void,
    batchSize: number = 10,
    delay: number = 100
  ) {
    this.processFn = processFn;
    this.batchSize = batchSize;
    this.delay = delay;
  }

  add(item: T): void {
    this.queue.push(item);
    this.processQueue();
  }

  private processQueue = (): void => {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    setTimeout(() => {
      const batch = this.queue.splice(0, this.batchSize);
      if (batch.length > 0) {
        this.processFn(batch);
      }
      this.isProcessing = false;

      // Continue processing if there are more items
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }, this.delay);
  };

  clear(): void {
    this.queue = [];
  }
}

/**
 * Throttle function calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean = false;
  let lastResult: any;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    return lastResult;
  }) as T;
};

/**
 * Debounce function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  }) as T;
};

/**
 * Memory cache with size limit
 */
export class MemoryCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  set(key: K, value: V): void {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Request animation frame helper
 */
export const rafScheduler = {
  schedule(callback: () => void): number {
    return requestAnimationFrame(callback);
  },

  cancel(id: number): void {
    cancelAnimationFrame(id);
  },

  scheduleOnce(callback: () => void): void {
    let scheduled = false;
    const wrappedCallback = () => {
      callback();
      scheduled = false;
    };

    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(wrappedCallback);
    }
  },
};

/**
 * Measure function execution time
 */
export const measureTime = <T extends (...args: any[]) => any>(
  fn: T,
  name?: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;
    
    if (__DEV__) {
      console.log(`⏱️ ${name || fn.name || 'Function'}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
};

/**
 * Check if device is low-end
 */
export const isLowEndDevice = (): boolean => {
  // Simple heuristic based on available memory
  // In production, would use more sophisticated detection
  const totalMemory = (performance as any).memory?.jsHeapSizeLimit;
  
  if (!totalMemory) {
    return false; // Assume not low-end if we can't detect
  }
  
  // Consider low-end if less than 2GB of heap
  return totalMemory < 2 * 1024 * 1024 * 1024;
};

/**
 * Performance optimization flags
 */
export const performanceFlags = {
  enableAnimations: !isLowEndDevice(),
  enableComplexEffects: !isLowEndDevice(),
  enableImageCaching: true,
  enableLazyLoading: true,
  maxRenderBatch: isLowEndDevice() ? 5 : 10,
  scrollThrottle: isLowEndDevice() ? 32 : 16,
};

/**
 * Calculate optimal batch size based on device performance
 */
export const getOptimalBatchSize = (): number => {
  if (isLowEndDevice()) {
    return 5;
  }
  return 10;
};

/**
 * Image optimization settings
 */
export const imageOptimizationSettings = {
  enableProgressive: true,
  cachePolicy: 'memory-disk' as const,
  resizeMode: 'cover' as const,
  priority: 'normal' as const,
  fadeInDuration: isLowEndDevice() ? 0 : 300,
};

export const performanceUtils = {
  deferExpensiveOperation,
  BatchProcessor,
  throttle,
  debounce,
  MemoryCache,
  rafScheduler,
  measureTime,
  isLowEndDevice,
  performanceFlags,
  getOptimalBatchSize,
  imageOptimizationSettings,
};

export default performanceUtils;