import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { LazyFlatList } from './LazyFlatList';

// Mock dependencies
jest.mock('../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007AFF',
      grey3: '#86939E',
    },
    spacing: {
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }),
}));

jest.mock('../../utils/performance', () => ({
  getOptimalBatchSize: () => 10,
  performanceFlags: {
    enableLazyLoading: true,
    enableComplexEffects: true,
  },
}));

jest.mock('../../hooks/usePerformance', () => ({
  usePerformance: () => ({
    startMeasure: jest.fn(),
    endMeasure: jest.fn(),
  }),
}));

describe('LazyFlatList', () => {
  const mockData = Array.from({ length: 50 }, (_, i) => ({
    id: i.toString(),
    title: `Item ${i}`,
  }));

  const renderItem = ({ item }: any) => (
    <Text testID={`item-${item.id}`}>{item.title}</Text>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render data items', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 5)}
          renderItem={renderItem}
          testID="lazy-list"
        />
      );

      expect(getByTestId('lazy-list')).toBeDefined();
      expect(getByTestId('item-0')).toBeDefined();
      expect(getByTestId('item-1')).toBeDefined();
    });

    it('should render empty state when no data', () => {
      const { getByText } = render(
        <LazyFlatList
          data={[]}
          renderItem={renderItem}
        />
      );

      expect(getByText('暫無資料')).toBeDefined();
    });

    it('should render custom empty component', () => {
      const emptyComponent = <Text testID="custom-empty">No items found</Text>;
      
      const { getByTestId } = render(
        <LazyFlatList
          data={[]}
          renderItem={renderItem}
          emptyComponent={emptyComponent}
        />
      );

      expect(getByTestId('custom-empty')).toBeDefined();
    });
  });

  describe('Lazy Loading', () => {
    it('should call onLoadMore when end reached', async () => {
      const onLoadMore = jest.fn().mockResolvedValue([]);
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          onLoadMore={onLoadMore}
          hasMore={true}
          onEndReachedThreshold={0.5}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      
      // Simulate scroll to end
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        expect(onLoadMore).toHaveBeenCalled();
      });
    });

    it('should not call onLoadMore when hasMore is false', () => {
      const onLoadMore = jest.fn();
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          onLoadMore={onLoadMore}
          hasMore={false}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      fireEvent(list, 'onEndReached');

      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it('should show loading indicator when loading more', async () => {
      const onLoadMore = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const { getByTestId, getByText } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          onLoadMore={onLoadMore}
          hasMore={true}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        expect(getByText('載入更多...')).toBeDefined();
      });
    });

    it('should show custom loading component', async () => {
      const loadingComponent = <Text testID="custom-loading">Loading...</Text>;
      const onLoadMore = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          onLoadMore={onLoadMore}
          hasMore={true}
          loadingComponent={loadingComponent}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        expect(getByTestId('custom-loading')).toBeDefined();
      });
    });

    it('should show no more content message when all data loaded', () => {
      const { getByText } = render(
        <LazyFlatList
          data={mockData}
          renderItem={renderItem}
          hasMore={false}
        />
      );

      expect(getByText('沒有更多內容')).toBeDefined();
    });
  });

  describe('Pagination', () => {
    it('should paginate data when enablePagination is true', () => {
      const { getByTestId, queryByTestId } = render(
        <LazyFlatList
          data={mockData}
          renderItem={renderItem}
          enablePagination={true}
          pageSize={10}
          testID="lazy-list"
        />
      );

      // Should only render first page
      expect(getByTestId('item-0')).toBeDefined();
      expect(getByTestId('item-9')).toBeDefined();
      expect(queryByTestId('item-10')).toBeNull();
    });

    it('should load next page on end reached with pagination', async () => {
      const { getByTestId, queryByTestId } = render(
        <LazyFlatList
          data={mockData}
          renderItem={renderItem}
          enablePagination={true}
          pageSize={10}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      
      // Initially should not have item 10
      expect(queryByTestId('item-10')).toBeNull();

      // Simulate scroll to end
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        // Now should have item 10 from next page
        expect(getByTestId('item-10')).toBeDefined();
      });
    });
  });

  describe('Refresh', () => {
    it('should call onRefresh when pull to refresh', async () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          onRefresh={onRefresh}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      
      // Get refresh control from list props
      const refreshControl = list.props.refreshControl;
      expect(refreshControl).toBeDefined();

      // Simulate refresh
      fireEvent(refreshControl, 'onRefresh');

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled();
      });
    });

    it('should reset pagination on refresh', async () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData}
          renderItem={renderItem}
          onRefresh={onRefresh}
          enablePagination={true}
          pageSize={10}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      
      // Load second page
      fireEvent(list, 'onEndReached');

      // Refresh
      const refreshControl = list.props.refreshControl;
      fireEvent(refreshControl, 'onRefresh');

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Performance Optimizations', () => {
    it('should use getItemLayout for fixed height items', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          itemHeight={50}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.getItemLayout).toBeDefined();

      // Test getItemLayout function
      const layout = list.props.getItemLayout(mockData, 5);
      expect(layout).toEqual({
        length: 50,
        offset: 250,
        index: 5,
      });
    });

    it('should not use getItemLayout for variable height items', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.getItemLayout).toBeUndefined();
    });

    it('should apply removeClippedSubviews optimization', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          removeClippedSubviews={true}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.removeClippedSubviews).toBe(true);
    });

    it('should use optimal batch size', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.maxToRenderPerBatch).toBe(10); // From mocked getOptimalBatchSize
    });

    it('should override batch size when provided', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          maxToRenderPerBatch={5}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.maxToRenderPerBatch).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should show error component on load error', async () => {
      const errorComponent = <Text testID="custom-error">Error loading data</Text>;
      const onLoadMore = jest.fn().mockRejectedValue(new Error('Load failed'));
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          onLoadMore={onLoadMore}
          hasMore={true}
          errorComponent={errorComponent}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      fireEvent(list, 'onEndReached');

      await waitFor(() => {
        expect(getByTestId('custom-error')).toBeDefined();
      });
    });

    it('should handle refresh error gracefully', async () => {
      const onRefresh = jest.fn().mockRejectedValue(new Error('Refresh failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          onRefresh={onRefresh}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      const refreshControl = list.props.refreshControl;
      
      fireEvent(refreshControl, 'onRefresh');

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Visible Items Tracking', () => {
    it('should call onVisibleItemsChanged when items become visible', () => {
      const onVisibleItemsChanged = jest.fn();
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 10)}
          renderItem={renderItem}
          onVisibleItemsChanged={onVisibleItemsChanged}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      
      // Simulate viewable items change
      fireEvent(list, 'onViewableItemsChanged', {
        viewableItems: [
          { item: mockData[0], key: '0', index: 0, isViewable: true },
          { item: mockData[1], key: '1', index: 1, isViewable: true },
        ],
        changed: [
          { item: mockData[0], key: '0', index: 0, isViewable: true },
        ],
      });

      expect(onVisibleItemsChanged).toHaveBeenCalledWith({
        viewableItems: expect.any(Array),
        changed: expect.any(Array),
      });
    });
  });

  describe('Virtual Scrolling', () => {
    it('should enable virtual scrolling by default', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData}
          renderItem={renderItem}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.maintainVisibleContentPosition).toBeDefined();
    });

    it('should disable virtual scrolling when specified', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData}
          renderItem={renderItem}
          enableVirtualization={false}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.maintainVisibleContentPosition).toBeUndefined();
    });
  });

  describe('Key Extraction', () => {
    it('should use custom keyExtractor when provided', () => {
      const keyExtractor = (item: any) => `custom-${item.id}`;
      
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 5)}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.keyExtractor(mockData[0], 0)).toBe('custom-0');
    });

    it('should use index as default key', () => {
      const { getByTestId } = render(
        <LazyFlatList
          data={mockData.slice(0, 5)}
          renderItem={renderItem}
          testID="lazy-list"
        />
      );

      const list = getByTestId('lazy-list');
      expect(list.props.keyExtractor(mockData[0], 0)).toBe('0');
    });
  });
});