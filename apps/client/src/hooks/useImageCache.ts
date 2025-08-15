import { useState, useEffect, useCallback, useRef } from 'react';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MemoryCache } from '../utils/performance';

interface ImageCacheOptions {
  maxMemoryCacheSize?: number;
  maxDiskCacheSize?: number;
  ttl?: number; // Time to live in milliseconds
}

interface CachedImage {
  uri: string;
  timestamp: number;
  size?: number;
}

class ImageCacheManager {
  private memoryCache: MemoryCache<string, string>;
  private diskCacheKey = '@image_cache';
  private maxDiskCacheSize: number;
  private ttl: number;

  constructor(options: ImageCacheOptions = {}) {
    this.memoryCache = new MemoryCache(options.maxMemoryCacheSize || 50);
    this.maxDiskCacheSize = options.maxDiskCacheSize || 100 * 1024 * 1024; // 100MB
    this.ttl = options.ttl || 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  async getCachedImage(uri: string): Promise<string | null> {
    // Check memory cache first
    const memCached = this.memoryCache.get(uri);
    if (memCached) {
      return memCached;
    }

    // Check disk cache
    try {
      const diskCache = await this.getDiskCache();
      const cached = diskCache[uri];
      
      if (cached && this.isValid(cached)) {
        // Add to memory cache for faster access
        this.memoryCache.set(uri, cached.uri);
        return cached.uri;
      }
    } catch (error) {
      console.warn('Failed to get disk cache:', error);
    }

    return null;
  }

  async cacheImage(uri: string, localUri?: string): Promise<void> {
    const cacheUri = localUri || uri;
    
    // Add to memory cache
    this.memoryCache.set(uri, cacheUri);

    // Add to disk cache
    try {
      const diskCache = await this.getDiskCache();
      diskCache[uri] = {
        uri: cacheUri,
        timestamp: Date.now(),
      };
      
      await this.saveDiskCache(diskCache);
    } catch (error) {
      console.warn('Failed to save to disk cache:', error);
    }
  }

  async clearCache(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      await AsyncStorage.removeItem(this.diskCacheKey);
    } catch (error) {
      console.warn('Failed to clear disk cache:', error);
    }
  }

  async cleanupExpiredCache(): Promise<void> {
    try {
      const diskCache = await this.getDiskCache();
      const now = Date.now();
      const cleaned: Record<string, CachedImage> = {};

      Object.entries(diskCache).forEach(([key, value]) => {
        if (this.isValid(value)) {
          cleaned[key] = value;
        }
      });

      await this.saveDiskCache(cleaned);
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }

  private isValid(cached: CachedImage): boolean {
    return Date.now() - cached.timestamp < this.ttl;
  }

  private async getDiskCache(): Promise<Record<string, CachedImage>> {
    try {
      const cached = await AsyncStorage.getItem(this.diskCacheKey);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  }

  private async saveDiskCache(cache: Record<string, CachedImage>): Promise<void> {
    await AsyncStorage.setItem(this.diskCacheKey, JSON.stringify(cache));
  }

  async getCacheSize(): Promise<{ memory: number; disk: number }> {
    const memorySize = this.memoryCache.size;
    
    try {
      const diskCache = await this.getDiskCache();
      const diskSize = Object.keys(diskCache).length;
      
      return { memory: memorySize, disk: diskSize };
    } catch {
      return { memory: memorySize, disk: 0 };
    }
  }
}

// Singleton instance
let cacheManager: ImageCacheManager | null = null;

export const useImageCache = (options?: ImageCacheOptions) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingImages = useRef<Set<string>>(new Set());

  // Initialize cache manager
  useEffect(() => {
    if (!cacheManager) {
      cacheManager = new ImageCacheManager(options);
    }
    
    // Cleanup expired cache on mount
    cacheManager.cleanupExpiredCache();
  }, []);

  const getCachedImage = useCallback(async (uri: string): Promise<string | null> => {
    if (!cacheManager) return null;
    
    try {
      return await cacheManager.getCachedImage(uri);
    } catch (error) {
      console.warn('Failed to get cached image:', error);
      return null;
    }
  }, []);

  const cacheImage = useCallback(async (uri: string): Promise<void> => {
    if (!cacheManager || loadingImages.current.has(uri)) return;
    
    loadingImages.current.add(uri);
    setIsLoading(true);
    setError(null);
    
    try {
      // Prefetch the image
      await Image.prefetch(uri);
      
      // Cache it
      await cacheManager.cacheImage(uri);
    } catch (err) {
      setError(err as Error);
      console.warn('Failed to cache image:', err);
    } finally {
      loadingImages.current.delete(uri);
      setIsLoading(loadingImages.current.size > 0);
    }
  }, []);

  const preloadImages = useCallback(async (uris: string[]): Promise<void> => {
    if (!cacheManager) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Process in batches to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < uris.length; i += batchSize) {
        const batch = uris.slice(i, i + batchSize);
        await Promise.all(batch.map(uri => cacheImage(uri)));
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [cacheImage]);

  const clearCache = useCallback(async (): Promise<void> => {
    if (!cacheManager) return;
    
    try {
      await cacheManager.clearCache();
    } catch (err) {
      setError(err as Error);
      console.warn('Failed to clear cache:', err);
    }
  }, []);

  const getCacheSize = useCallback(async (): Promise<{ memory: number; disk: number }> => {
    if (!cacheManager) return { memory: 0, disk: 0 };
    
    try {
      return await cacheManager.getCacheSize();
    } catch (err) {
      console.warn('Failed to get cache size:', err);
      return { memory: 0, disk: 0 };
    }
  }, []);

  return {
    getCachedImage,
    cacheImage,
    preloadImages,
    clearCache,
    getCacheSize,
    isLoading,
    error,
  };
};

export default useImageCache;