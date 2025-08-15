import { useState, useCallback, useRef, useEffect } from 'react';
import { BatchProcessor } from '../utils/performance';

interface UseLazyLoadOptions<T> {
  initialData?: T[];
  pageSize?: number;
  threshold?: number;
  fetchData: (page: number, pageSize: number) => Promise<T[]>;
  onError?: (error: Error) => void;
  enableInfiniteScroll?: boolean;
  cachePages?: boolean;
}

interface UseLazyLoadReturn<T> {
  data: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
  currentPage: number;
  totalPages: number | null;
}

export function useLazyLoad<T>({
  initialData = [],
  pageSize = 20,
  threshold = 0.8,
  fetchData,
  onError,
  enableInfiniteScroll = true,
  cachePages = true,
}: UseLazyLoadOptions<T>): UseLazyLoadReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  
  const isLoadingRef = useRef(false);
  const cachedPages = useRef<Map<number, T[]>>(new Map());
  const batchProcessor = useRef<BatchProcessor<T> | null>(null);

  // Initialize batch processor for efficient data updates
  useEffect(() => {
    if (!batchProcessor.current) {
      batchProcessor.current = new BatchProcessor<T>(
        (items) => {
          setData(prev => [...prev, ...items]);
        },
        pageSize / 2,
        100
      );
    }

    return () => {
      batchProcessor.current?.clear();
    };
  }, [pageSize]);

  // Load a specific page
  const loadPage = useCallback(async (page: number): Promise<T[]> => {
    // Check cache first
    if (cachePages && cachedPages.current.has(page)) {
      return cachedPages.current.get(page)!;
    }

    try {
      const newData = await fetchData(page, pageSize);
      
      // Cache the page
      if (cachePages) {
        cachedPages.current.set(page, newData);
      }
      
      // Check if there's more data
      if (newData.length < pageSize) {
        setHasMore(false);
      }
      
      return newData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    }
  }, [fetchData, pageSize, cachePages, onError]);

  // Load more data
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !enableInfiniteScroll) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const newData = await loadPage(nextPage);
      
      if (newData.length > 0) {
        // Use batch processor for efficient updates
        if (batchProcessor.current) {
          newData.forEach(item => batchProcessor.current!.add(item));
        } else {
          setData(prev => [...prev, ...newData]);
        }
        
        setCurrentPage(nextPage);
      }
    } catch (err) {
      // Error already handled in loadPage
    } finally {
      isLoadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, currentPage, enableInfiniteScroll, loadPage]);

  // Refresh data (reload from first page)
  const refresh = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);
    setHasMore(true);

    try {
      // Clear cache
      cachedPages.current.clear();
      batchProcessor.current?.clear();
      
      // Load first page
      const newData = await loadPage(1);
      setData(newData);
      setCurrentPage(1);
    } catch (err) {
      // Error already handled in loadPage
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [loadPage]);

  // Reset to initial state
  const reset = useCallback(() => {
    setData(initialData);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    setIsLoadingMore(false);
    cachedPages.current.clear();
    batchProcessor.current?.clear();
    isLoadingRef.current = false;
  }, [initialData]);

  // Initial load
  useEffect(() => {
    if (data.length === 0 && initialData.length === 0) {
      refresh();
    }
  }, []);

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    reset,
    currentPage,
    totalPages,
  };
}

// Hook for intersection observer-based lazy loading
export function useIntersectionLazyLoad(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const observer = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
      ...options,
    };

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback();
        }
      });
    }, observerOptions);

    observer.current.observe(elementRef.current);

    return () => {
      if (observer.current && elementRef.current) {
        observer.current.unobserve(elementRef.current);
      }
    };
  }, [callback, options]);

  return elementRef;
}

// Hook for viewport-based lazy loading
export function useViewportLazyLoad<T>(
  items: T[],
  options?: {
    overscan?: number;
    itemHeight?: number;
    containerHeight?: number;
  }
) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const [scrollTop, setScrollTop] = useState(0);
  
  const {
    overscan = 3,
    itemHeight = 100,
    containerHeight = 600,
  } = options || {};

  useEffect(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
    
    setVisibleRange({
      start: Math.max(0, visibleStart - overscan),
      end: Math.min(items.length, visibleEnd + overscan),
    });
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const handleScroll = useCallback((event: any) => {
    setScrollTop(event.nativeEvent.contentOffset.y);
  }, []);

  const visibleItems = items.slice(visibleRange.start, visibleRange.end);
  
  return {
    visibleItems,
    visibleRange,
    handleScroll,
    totalHeight: items.length * itemHeight,
    offsetY: visibleRange.start * itemHeight,
  };
}

export default useLazyLoad;