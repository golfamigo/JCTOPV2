import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  FlatList,
  FlatListProps,
  View,
  ActivityIndicator,
  Text,
  RefreshControl,
  ViewToken,
  StyleSheet,
} from 'react-native';
import { useAppTheme } from '@/theme';
import { getOptimalBatchSize, performanceFlags } from '../../utils/performance';
import { usePerformance } from '../../hooks/usePerformance';

interface LazyFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  renderItem: FlatListProps<T>['renderItem'];
  onEndReachedThreshold?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  updateCellsBatchingPeriod?: number;
  removeClippedSubviews?: boolean;
  itemHeight?: number; // For fixed height items
  estimatedItemSize?: number; // For variable height items
  onLoadMore?: () => Promise<T[]>;
  hasMore?: boolean;
  loadingComponent?: React.ReactElement;
  emptyComponent?: React.ReactElement;
  errorComponent?: React.ReactElement;
  onVisibleItemsChanged?: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void;
  enableVirtualization?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
}

export function LazyFlatList<T>({
  data,
  renderItem,
  onEndReachedThreshold = 0.5,
  initialNumToRender,
  maxToRenderPerBatch,
  windowSize,
  updateCellsBatchingPeriod = 50,
  removeClippedSubviews = true,
  itemHeight,
  estimatedItemSize = 100,
  onLoadMore,
  hasMore = false,
  loadingComponent,
  emptyComponent,
  errorComponent,
  onVisibleItemsChanged,
  enableVirtualization = true,
  enablePagination = false,
  pageSize = 20,
  ...flatListProps
}: LazyFlatListProps<T>) {
  const { colors, spacing } = useAppTheme();
  const { startMeasure, endMeasure } = usePerformance();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [visibleData, setVisibleData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const flatListRef = useRef<FlatList<T>>(null);
  const loadingMoreRef = useRef(false);

  // Calculate optimal settings based on device performance
  const optimalBatchSize = useMemo(() => {
    return maxToRenderPerBatch || getOptimalBatchSize();
  }, [maxToRenderPerBatch]);

  const optimalInitialRender = useMemo(() => {
    return initialNumToRender || optimalBatchSize;
  }, [initialNumToRender, optimalBatchSize]);

  const optimalWindowSize = useMemo(() => {
    return windowSize || (performanceFlags.enableLazyLoading ? 10 : 21);
  }, [windowSize]);

  // Initialize visible data for pagination
  useEffect(() => {
    if (enablePagination) {
      const endIndex = currentPage * pageSize;
      setVisibleData(data.slice(0, endIndex));
    } else {
      setVisibleData(data);
    }
  }, [data, enablePagination, currentPage, pageSize]);

  // Get item layout for better performance with fixed height items
  const getItemLayout = useCallback(
    (data: T[] | null | undefined, index: number) => {
      if (!itemHeight) return undefined;
      
      return {
        length: itemHeight,
        offset: itemHeight * index,
        index,
      };
    },
    [itemHeight]
  );

  // Handle end reached for loading more data
  const handleEndReached = useCallback(async () => {
    if (loadingMoreRef.current || isLoadingMore || !hasMore) {
      return;
    }

    if (enablePagination && visibleData.length < data.length) {
      // Load next page from existing data
      setCurrentPage(prev => prev + 1);
      return;
    }

    if (onLoadMore) {
      loadingMoreRef.current = true;
      setIsLoadingMore(true);
      setError(null);
      
      startMeasure('lazy-load-more');
      
      try {
        await onLoadMore();
      } catch (err) {
        setError(err as Error);
        console.error('Failed to load more items:', err);
      } finally {
        endMeasure('lazy-load-more');
        setIsLoadingMore(false);
        loadingMoreRef.current = false;
      }
    }
  }, [
    isLoadingMore,
    hasMore,
    onLoadMore,
    enablePagination,
    visibleData.length,
    data.length,
    startMeasure,
    endMeasure,
  ]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!flatListProps.onRefresh) return;
    
    setIsRefreshing(true);
    setError(null);
    startMeasure('lazy-list-refresh');
    
    try {
      await flatListProps.onRefresh();
      if (enablePagination) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      endMeasure('lazy-list-refresh');
      setIsRefreshing(false);
    }
  }, [flatListProps.onRefresh, enablePagination, startMeasure, endMeasure]);

  // Render footer component
  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        loadingComponent || (
          <View style={styles.footerContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.footerText, { color: colors.grey3 }]}>載入更多...</Text>
          </View>
        )
      );
    }

    if (error && errorComponent) {
      return errorComponent;
    }

    if (!hasMore && data.length > 0) {
      return (
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.grey3 }]}>沒有更多內容</Text>
        </View>
      );
    }

    return null;
  }, [isLoadingMore, error, hasMore, data.length, loadingComponent, errorComponent, colors]);

  // Render empty component
  const renderEmpty = useCallback(() => {
    if (isLoadingMore || isRefreshing) return null;
    
    return (
      emptyComponent || (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.grey3 }]}>暫無資料</Text>
        </View>
      )
    );
  }, [isLoadingMore, isRefreshing, emptyComponent, colors]);

  // Viewability config for tracking visible items
  const viewabilityConfig = useMemo(() => ({
    minimumViewTime: 250,
    viewAreaCoveragePercentThreshold: 50,
    waitForInteraction: false,
  }), []);

  // Handle visible items change
  const handleViewableItemsChanged = useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      onVisibleItemsChanged?.(info);
    },
    [onVisibleItemsChanged]
  );

  const styles = StyleSheet.create({
    footerContainer: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerText: {
      marginTop: spacing.sm,
      fontSize: 14,
    },
    emptyContainer: {
      flex: 1,
      paddingVertical: spacing.xl * 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      fontSize: 16,
    },
  });

  const listData = enablePagination ? visibleData : data;

  return (
    <FlatList
      {...flatListProps}
      ref={flatListRef}
      data={listData}
      renderItem={renderItem}
      keyExtractor={(item, index) => 
        (flatListProps.keyExtractor?.(item, index) || index.toString())
      }
      // Performance optimizations
      removeClippedSubviews={removeClippedSubviews}
      maxToRenderPerBatch={optimalBatchSize}
      initialNumToRender={optimalInitialRender}
      windowSize={optimalWindowSize}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      getItemLayout={itemHeight ? getItemLayout as any : undefined}
      // Loading states
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        flatListProps.onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      // Viewability tracking
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
      // Additional optimizations
      legacyImplementation={false}
      progressViewOffset={50}
      maintainVisibleContentPosition={
        enableVirtualization
          ? {
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10,
            }
          : undefined
      }
    />
  );
}

// Memoized version for better performance
export const MemoizedLazyFlatList = React.memo(LazyFlatList) as typeof LazyFlatList;

export default LazyFlatList;