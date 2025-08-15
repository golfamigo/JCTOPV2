import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, RefreshControl, FlatList } from 'react-native';
import { Text, Button, Icon, SearchBar, ButtonGroup } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import EventCard from './EventCard';
import EmptyState from '../../shared/EmptyState';
import eventService from '../../../services/eventService';
import { EventWithRelations, PaginatedEventsResponse } from '@jctop-event/shared-types';
import { useAppTheme } from '@/theme';
import { useDebounce } from '../../../hooks/useDebounce';
import { useResponsive } from '../../../hooks/useResponsive';
import ResponsiveGrid from '../../shared/ResponsiveGrid';

interface EventsListProps {
  onEventClick?: (eventId: string) => void;
  onFavorite?: (eventId: string, isFavorited: boolean) => void;
  favoritedEvents?: Set<string>;
  title?: string;
  showTitle?: boolean;
  itemsPerPage?: number;
}

const EventsList: React.FC<EventsListProps> = ({
  onEventClick,
  onFavorite,
  favoritedEvents = new Set(),
  title,
  showTitle = true,
  itemsPerPage = 12,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const responsive = useResponsive();

  // State management
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [allEvents, setAllEvents] = useState<EventWithRelations[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Categories
  const categories = [
    t('events.allCategories'),
    t('events.music'),
    t('events.sports'),
    t('events.education'),
    t('events.business'),
    t('events.arts'),
    t('events.food'),
    t('events.technology'),
  ];

  // Calculate number of columns based on screen width
  const numColumns = useMemo(() => {
    if (responsive.isDesktop) return 3;
    if (responsive.isTablet) return 2;
    return 1;
  }, [responsive.isDesktop, responsive.isTablet]);

  // Fetch events function
  const fetchEvents = async (page: number = 1, limit: number = itemsPerPage, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const response: PaginatedEventsResponse = await eventService.getPublicEvents(page, limit);
      
      setAllEvents(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('errors.networkError');
      setError(errorMessage);
      setAllEvents([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Filter events based on search and category
  const filteredEvents = useMemo(() => {
    let filtered = allEvents;

    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(event => {
        const searchableText = [
          event.title,
          event.description,
          event.location,
          event.venue?.name,
          event.category?.name
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchableText.includes(query);
      });
    }

    // Filter by category
    if (selectedCategoryIndex > 0) {
      const categoryMap: { [key: string]: string } = {
        [t('events.music')]: 'music',
        [t('events.sports')]: 'sports', 
        [t('events.education')]: 'education',
        [t('events.business')]: 'business',
        [t('events.arts')]: 'arts',
        [t('events.food')]: 'food',
        [t('events.technology')]: 'technology',
      };
      
      const selectedCategory = categories[selectedCategoryIndex];
      const categoryKey = categoryMap[selectedCategory];
      
      if (categoryKey) {
        filtered = filtered.filter(event =>
          event.category?.name?.toLowerCase() === categoryKey
        );
      }
    }

    return filtered;
  }, [allEvents, debouncedSearchQuery, selectedCategoryIndex, categories, t]);

  // Initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    fetchEvents(1, itemsPerPage, true);
  };

  // Handle retry
  const handleRetry = () => {
    fetchEvents();
  };

  // Handle event click
  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (eventId: string, isFavorited: boolean) => {
    if (onFavorite) {
      onFavorite(eventId, isFavorited);
    }
  };

  // Handle search
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  // Handle category change
  const handleCategoryPress = (selectedIndex: number) => {
    setSelectedCategoryIndex(selectedIndex);
  };

  // Render empty state
  const renderEmptyState = () => (
    <EmptyState
      title={searchQuery ? t('events.noEventsMatchSearch') : t('events.noEvents')}
      description={searchQuery ? t('events.tryDifferentSearch') : t('events.checkBackLater')}
      icon="calendar"
      iconType="material-community"
      actionLabel={t('common.retry')}
      onAction={handleRetry}
    />
  );

  // Render error state
  const renderErrorState = () => (
    <View style={{ 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: spacing.xxxl,
      paddingHorizontal: spacing.lg 
    }}>
      <Icon
        name="alert-circle"
        type="material-community"
        size={60}
        color={colors.danger}
        containerStyle={{ marginBottom: spacing.lg }}
      />
      <Text h3 style={{ 
        color: colors.dark, 
        textAlign: 'center', 
        marginBottom: spacing.sm 
      }}>
        {t('errors.somethingWentWrong')}
      </Text>
      <Text style={{ 
        color: colors.midGrey, 
        textAlign: 'center', 
        marginBottom: spacing.lg,
        lineHeight: 20 
      }}>
        {error || t('errors.networkError')}
      </Text>
      <Button
        title={t('errors.retry')}
        onPress={handleRetry}
        buttonStyle={{
          backgroundColor: colors.danger,
          borderRadius: 8,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
        }}
        titleStyle={{ fontSize: 16, fontWeight: '600' }}
      />
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      testID="events-list-scroll"
    >
      <View style={{ padding: spacing.md }}>
        {/* Header */}
        {showTitle && (
          <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <Text h1 style={{ 
              color: colors.dark,
              textAlign: 'center',
              marginBottom: spacing.sm 
            }}>
              {title || t('events.discoverEvents')}
            </Text>
            <Text style={{ 
              color: colors.midGrey,
              textAlign: 'center',
              fontSize: 16,
              lineHeight: 24,
              maxWidth: 400 
            }}>
              {t('events.noEventsDescription')}
            </Text>
          </View>
        )}

        {/* Search Bar */}
        <SearchBar
          placeholder={t('events.searchEvents')}
          onChangeText={handleSearchChange}
          value={searchQuery}
          containerStyle={{
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            borderBottomWidth: 0,
            paddingHorizontal: 0,
            marginBottom: spacing.md,
          }}
          inputContainerStyle={{
            backgroundColor: colors.lightGrey,
            borderRadius: 8,
          }}
          inputStyle={{
            fontSize: 16,
            color: colors.text,
          }}
          placeholderTextColor={colors.midGrey}
          searchIcon={{
            name: 'magnify',
            type: 'material-community',
            color: colors.midGrey,
          }}
          clearIcon={{
            name: 'close',
            type: 'material-community',
            color: colors.midGrey,
          }}
          testID="events-search-bar"
        />

        {/* Category Filters */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: spacing.lg }}
          contentContainerStyle={{ paddingHorizontal: spacing.xs }}
        >
          <ButtonGroup
            buttons={categories}
            selectedIndex={selectedCategoryIndex}
            onPress={handleCategoryPress}
            containerStyle={{
              marginLeft: 0,
              marginRight: 0,
              borderRadius: 8,
            }}
            buttonStyle={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
            }}
            selectedButtonStyle={{
              backgroundColor: colors.primary,
            }}
            textStyle={{
              color: colors.midGrey,
              fontSize: 14,
            }}
            selectedTextStyle={{
              color: colors.white,
              fontWeight: '600',
            }}
          />
        </ScrollView>

        {/* Content */}
        <View style={{ minHeight: 400 }}>
          {error ? (
            renderErrorState()
          ) : isLoading ? (
            <FlatList
              data={Array.from({ length: 6 })}
              renderItem={() => (
                <EventCard
                  event={{} as EventWithRelations}
                  isLoading={true}
                />
              )}
              keyExtractor={(_, index) => `skeleton-${index}`}
              numColumns={numColumns}
              key={numColumns} // Force re-render when columns change
              scrollEnabled={false}
            />
          ) : filteredEvents.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredEvents}
              renderItem={({ item }) => (
                <EventCard
                  key={item.id}
                  event={item}
                  onEventClick={handleEventClick}
                  onFavorite={onFavorite ? handleFavoriteToggle : undefined}
                  isFavorited={favoritedEvents.has(item.id)}
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              key={numColumns} // Force re-render when columns change
              scrollEnabled={false}
              testID="events-list-flatlist"
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default EventsList;