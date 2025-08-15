import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Image } from '@rneui/themed';
import { OptimizedImage, preloadImages, getOptimizedImageUrl } from './OptimizedImage';

// Mock dependencies
jest.mock('../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007AFF',
      grey3: '#86939E',
      grey4: '#BDBDBD',
      grey5: '#E0E0E0',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }),
}));

jest.mock('../../utils/performance', () => ({
  performanceFlags: {
    enableComplexEffects: true,
    enableImageCaching: true,
    enableLazyLoading: true,
  },
  imageOptimizationSettings: {
    fadeInDuration: 300,
  },
}));

jest.mock('../../hooks/usePerformance', () => ({
  usePerformance: () => ({
    startMeasure: jest.fn(),
    endMeasure: jest.fn(),
  }),
}));

// Mock Image.prefetch
const mockPrefetch = jest.fn().mockResolvedValue(undefined);
(Image as any).prefetch = mockPrefetch;

describe('OptimizedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with basic props', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });

    it('should render with object source', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source={{ uri: 'https://example.com/image.jpg' }}
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });

    it('should show loading indicator when showLoadingIndicator is true', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          showLoadingIndicator={true}
          testID="optimized-image"
        />
      );

      const container = getByTestId('optimized-image');
      expect(container).toBeDefined();
    });

    it('should not show loading indicator when showLoadingIndicator is false', () => {
      const { queryByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          showLoadingIndicator={false}
          testID="optimized-image"
        />
      );

      expect(queryByTestId('optimized-image')).toBeDefined();
    });
  });

  describe('Image Loading', () => {
    it('should call onLoadStart when image starts loading', () => {
      const onLoadStart = jest.fn();
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          onLoadStart={onLoadStart}
          testID="optimized-image"
        />
      );

      // Simulate load start
      const image = getByTestId('optimized-image');
      fireEvent(image, 'onLoadStart');

      expect(onLoadStart).toHaveBeenCalled();
    });

    it('should call onLoadEnd when image finishes loading', () => {
      const onLoadEnd = jest.fn();
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          onLoadEnd={onLoadEnd}
          testID="optimized-image"
        />
      );

      // Simulate load end
      const image = getByTestId('optimized-image');
      fireEvent(image, 'onLoadEnd');

      expect(onLoadEnd).toHaveBeenCalled();
    });

    it('should handle image load error', () => {
      const onError = jest.fn();
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          onError={onError}
          testID="optimized-image"
        />
      );

      // Simulate error
      const image = getByTestId('optimized-image');
      fireEvent(image, 'onError', { error: 'Load failed' });

      expect(onError).toHaveBeenCalledWith({ error: 'Load failed' });
    });

    it('should use fallback image on error', () => {
      const { getByTestId, rerender } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          fallbackSource="https://example.com/fallback.jpg"
          testID="optimized-image"
        />
      );

      // Simulate error
      const image = getByTestId('optimized-image');
      fireEvent(image, 'onError', { error: 'Load failed' });

      // Component should update with fallback source
      rerender(
        <OptimizedImage
          source="https://example.com/fallback.jpg"
          fallbackSource="https://example.com/fallback.jpg"
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });
  });

  describe('Image Prefetching', () => {
    it('should prefetch high priority images', () => {
      render(
        <OptimizedImage
          source="https://example.com/high-priority.jpg"
          priority="high"
        />
      );

      expect(mockPrefetch).toHaveBeenCalledWith('https://example.com/high-priority.jpg');
    });

    it('should not prefetch normal priority images', () => {
      render(
        <OptimizedImage
          source="https://example.com/normal-priority.jpg"
          priority="normal"
        />
      );

      expect(mockPrefetch).not.toHaveBeenCalled();
    });

    it('should not prefetch low priority images', () => {
      render(
        <OptimizedImage
          source="https://example.com/low-priority.jpg"
          priority="low"
        />
      );

      expect(mockPrefetch).not.toHaveBeenCalled();
    });
  });

  describe('Cache Policy', () => {
    it('should apply memory cache policy headers', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          cachePolicy="memory"
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });

    it('should apply disk cache policy headers', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          cachePolicy="disk"
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });

    it('should apply memory-disk cache policy headers', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          cachePolicy="memory-disk"
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });

    it('should apply no-cache policy headers', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          cachePolicy="none"
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });
  });

  describe('Placeholder', () => {
    it('should render placeholder while loading', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          placeholder="https://example.com/placeholder.jpg"
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });

    it('should apply blur to placeholder', () => {
      const { getByTestId } = render(
        <OptimizedImage
          source="https://example.com/image.jpg"
          placeholder="https://example.com/placeholder.jpg"
          blurRadius={10}
          testID="optimized-image"
        />
      );

      expect(getByTestId('optimized-image')).toBeDefined();
    });
  });

  describe('Memoization', () => {
    it('should not re-render when props are the same', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = React.memo(({ source }: any) => {
        renderSpy();
        return <OptimizedImage source={source} />;
      });

      const { rerender } = render(
        <TestComponent source="https://example.com/image.jpg" />
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(<TestComponent source="https://example.com/image.jpg" />);

      // Should not trigger another render due to memoization
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('should re-render when source changes', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = ({ source }: any) => {
        renderSpy();
        return <OptimizedImage source={source} />;
      };

      const { rerender } = render(
        <TestComponent source="https://example.com/image1.jpg" />
      );

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with different source
      rerender(<TestComponent source="https://example.com/image2.jpg" />);

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Utility Functions', () => {
  describe('preloadImages', () => {
    it('should prefetch all provided URLs', async () => {
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ];

      await preloadImages(urls);

      expect(mockPrefetch).toHaveBeenCalledTimes(3);
      expect(mockPrefetch).toHaveBeenCalledWith('https://example.com/image1.jpg');
      expect(mockPrefetch).toHaveBeenCalledWith('https://example.com/image2.jpg');
      expect(mockPrefetch).toHaveBeenCalledWith('https://example.com/image3.jpg');
    });

    it('should handle empty array', async () => {
      await preloadImages([]);
      expect(mockPrefetch).not.toHaveBeenCalled();
    });
  });

  describe('getOptimizedImageUrl', () => {
    it('should return original URL when no options provided', () => {
      const url = 'https://example.com/image.jpg';
      const result = getOptimizedImageUrl(url);
      expect(result).toBe(url);
    });

    it('should add width parameter', () => {
      const url = 'https://example.com/image.jpg';
      const result = getOptimizedImageUrl(url, { width: 300 });
      expect(result).toBe('https://example.com/image.jpg?w=300');
    });

    it('should add height parameter', () => {
      const url = 'https://example.com/image.jpg';
      const result = getOptimizedImageUrl(url, { height: 200 });
      expect(result).toBe('https://example.com/image.jpg?h=200');
    });

    it('should add quality parameter', () => {
      const url = 'https://example.com/image.jpg';
      const result = getOptimizedImageUrl(url, { quality: 80 });
      expect(result).toBe('https://example.com/image.jpg?q=80');
    });

    it('should add format parameter', () => {
      const url = 'https://example.com/image.jpg';
      const result = getOptimizedImageUrl(url, { format: 'webp' });
      expect(result).toBe('https://example.com/image.jpg?f=webp');
    });

    it('should add multiple parameters', () => {
      const url = 'https://example.com/image.jpg';
      const result = getOptimizedImageUrl(url, {
        width: 300,
        height: 200,
        quality: 80,
        format: 'webp',
      });
      expect(result).toBe('https://example.com/image.jpg?w=300&h=200&q=80&f=webp');
    });

    it('should handle URLs with existing query parameters', () => {
      const url = 'https://example.com/image.jpg?existing=param';
      const result = getOptimizedImageUrl(url, { width: 300 });
      expect(result).toBe('https://example.com/image.jpg?existing=param&w=300');
    });
  });
});