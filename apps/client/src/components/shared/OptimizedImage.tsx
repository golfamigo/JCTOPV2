import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, ImageStyle, Platform } from 'react-native';
import { Image, ImageProps, Text } from '@rneui/themed';
import { useAppTheme } from '@/theme';
import { performanceFlags, imageOptimizationSettings } from '../../utils/performance';
import { usePerformance } from '../../hooks/usePerformance';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  source: string | { uri: string };
  placeholder?: string;
  cachePolicy?: 'memory' | 'disk' | 'memory-disk' | 'none';
  priority?: 'low' | 'normal' | 'high';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  fallbackSource?: string;
  progressive?: boolean;
  containerStyle?: ViewStyle;
  imageStyle?: ImageStyle;
  showLoadingIndicator?: boolean;
  loadingIndicatorSize?: 'small' | 'large';
  blurRadius?: number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  source,
  placeholder,
  cachePolicy = 'memory-disk',
  priority = 'normal',
  onLoadStart,
  onLoadEnd,
  onError,
  fallbackSource,
  progressive = true,
  containerStyle,
  imageStyle,
  showLoadingIndicator = true,
  loadingIndicatorSize = 'small',
  blurRadius = 0,
  resizeMode = 'cover',
  ...imageProps
}) => {
  const { colors, spacing } = useAppTheme();
  const { startMeasure, endMeasure } = usePerformance();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSource, setImageSource] = useState<string | { uri: string }>(source);

  // Convert source to proper format
  const normalizedSource = useMemo(() => {
    if (typeof imageSource === 'string') {
      return { uri: imageSource };
    }
    return imageSource;
  }, [imageSource]);

  // Placeholder source
  const placeholderSource = useMemo(() => {
    if (placeholder) {
      return typeof placeholder === 'string' ? { uri: placeholder } : placeholder;
    }
    return null;
  }, [placeholder]);

  // Handle image load start
  const handleLoadStart = useCallback(() => {
    startMeasure(`image-load-${normalizedSource.uri}`);
    setIsLoading(true);
    onLoadStart?.();
  }, [normalizedSource.uri, onLoadStart, startMeasure]);

  // Handle image load end
  const handleLoadEnd = useCallback(() => {
    endMeasure(`image-load-${normalizedSource.uri}`);
    setIsLoading(false);
    setHasError(false);
    onLoadEnd?.();
  }, [normalizedSource.uri, onLoadEnd, endMeasure]);

  // Handle image error
  const handleError = useCallback((error: any) => {
    endMeasure(`image-load-${normalizedSource.uri}`);
    setIsLoading(false);
    setHasError(true);
    
    if (fallbackSource && imageSource !== fallbackSource) {
      // Try fallback image
      setImageSource(fallbackSource);
      setHasError(false);
      setIsLoading(true);
    } else {
      onError?.(error);
    }
  }, [normalizedSource.uri, fallbackSource, imageSource, onError, endMeasure]);

  // Preload high priority images
  useEffect(() => {
    if (priority === 'high' && typeof source === 'string') {
      Image.prefetch(source);
    }
  }, [source, priority]);

  // Get cache headers based on policy
  const getCacheHeaders = useCallback(() => {
    switch (cachePolicy) {
      case 'none':
        return { 'Cache-Control': 'no-cache, no-store, must-revalidate' };
      case 'memory':
        return { 'Cache-Control': 'private, max-age=3600' };
      case 'disk':
        return { 'Cache-Control': 'public, max-age=86400' };
      case 'memory-disk':
      default:
        return { 'Cache-Control': 'public, max-age=604800' };
    }
  }, [cachePolicy]);

  const styles = StyleSheet.create({
    container: {
      position: 'relative' as const,
      overflow: 'hidden',
      backgroundColor: colors.grey5,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.grey5,
    },
    errorContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.grey5,
      padding: spacing.md,
    },
    errorText: {
      color: colors.grey3,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
  });

  // Don't render complex effects on low-end devices
  const shouldUseFadeIn = performanceFlags.enableComplexEffects && progressive;
  const fadeInDuration = imageOptimizationSettings.fadeInDuration;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Placeholder or Loading State */}
      {(isLoading || hasError) && (
        <View style={styles.loadingContainer}>
          {hasError ? (
            <View style={styles.errorContainer}>
              {fallbackSource ? (
                <ActivityIndicator size={loadingIndicatorSize} color={colors.primary} />
              ) : (
                <>
                  <View style={{ width: 48, height: 48, backgroundColor: colors.grey4, borderRadius: 8 }} />
                  <Text style={styles.errorText}>圖片載入失敗</Text>
                </>
              )}
            </View>
          ) : (
            <>
              {placeholderSource && (
                <Image
                  source={placeholderSource}
                  style={[styles.image, imageStyle]}
                  resizeMode={resizeMode}
                  blurRadius={blurRadius || 10}
                />
              )}
              {showLoadingIndicator && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size={loadingIndicatorSize} color={colors.primary} />
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Main Image */}
      <Image
        {...imageProps}
        source={{
          ...normalizedSource,
          headers: getCacheHeaders(),
          cache: cachePolicy !== 'none' ? 'default' : 'reload',
        }}
        style={[
          styles.image,
          imageStyle,
          { opacity: isLoading ? 0 : 1 },
        ]}
        resizeMode={resizeMode}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        transition={shouldUseFadeIn}
        transitionDuration={fadeInDuration}
        progressiveRenderingEnabled={progressive && Platform.OS === 'android'}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return (
    prevProps.source === nextProps.source &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.cachePolicy === nextProps.cachePolicy &&
    prevProps.priority === nextProps.priority
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Image preloader utility
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => Image.prefetch(url));
  await Promise.all(promises);
};

// WebP support detection
export const supportsWebP = (): boolean => {
  // React Native supports WebP on both platforms with proper setup
  return true;
};

// Get optimized image URL based on device
export const getOptimizedImageUrl = (
  baseUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  }
): string => {
  if (!options) return baseUrl;
  
  // If using a CDN that supports image transformation
  // This is an example - adjust based on your CDN
  const params = new URLSearchParams();
  
  if (options.width) params.append('w', options.width.toString());
  if (options.height) params.append('h', options.height.toString());
  if (options.quality) params.append('q', options.quality.toString());
  if (options.format) params.append('f', options.format);
  
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${params.toString()}`;
};

export default OptimizedImage;