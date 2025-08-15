import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  ListItem,
  Badge,
  Icon,
  FAB,
  SpeedDial,
  Divider,
  Header,
} from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';
import { useResponsive } from '../../../hooks/useResponsive';
import { EventStatisticsCard } from './EventStatisticsCard';
import { DashboardFilters, FilterOptions } from './DashboardFilters';
import { DashboardCharts } from './DashboardCharts';
import dashboardAnalyticsService, {
  DashboardAnalytics,
  EventWithStatistics,
} from '../../../services/dashboardAnalyticsService';

export const OrganizerDashboard: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const responsive = useResponsive();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'date',
    sortOrder: 'desc',
    eventStatus: ['published', 'draft', 'completed'],
    dateRange: {
      start: null,
      end: null,
    },
  });

  useEffect(() => {
    loadDashboardAnalytics();
  }, []);

  const loadDashboardAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await dashboardAnalyticsService.getDashboardAnalytics();

      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        setError(result.error || t('organizer.loadingFailed'));
      }
    } catch (error) {
      console.error('Failed to load dashboard analytics:', error);
      setError(t('organizer.loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const result = await dashboardAnalyticsService.refreshDashboardAnalytics();

      if (result.success && result.data) {
        setAnalytics(result.data);
        Alert.alert(
          t('organizer.dashboardUpdated'),
          t('organizer.analyticsRefreshed')
        );
      } else {
        setError(result.error || t('organizer.refreshFailed'));
        Alert.alert(t('organizer.refreshFailed'), result.error || '');
      }
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      setError(t('organizer.refreshFailed'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateEvent = () => {
    router.push('/organizer/events/create');
    setSpeedDialOpen(false);
  };

  const handleViewAllEvents = () => {
    router.push('/organizer/events');
    setSpeedDialOpen(false);
  };

  const handlePaymentSettings = () => {
    router.push('/organizer/settings');
    setSpeedDialOpen(false);
  };

  const onRefresh = useCallback(() => {
    refreshAnalytics();
  }, []);

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 70) return colors.success;
    if (rate >= 40) return colors.warning;
    return colors.danger;
  };

  const renderStatCard = (
    title: string,
    value: number | string,
    subtitle?: string,
    color?: string
  ) => (
    <Card containerStyle={[styles.statCard, { backgroundColor: colors.white }]}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
        {title}
      </Text>
      <Text
        style={[
          styles.statNumber,
          { color: color || colors.primary },
        ]}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Text>
      {subtitle && (
        <Text style={[styles.statHelpText, { color: colors.textSecondary }]}>
          {subtitle}
        </Text>
      )}
    </Card>
  );

  const renderQuickActions = () => {
    if (isMobile) {
      return (
        <SpeedDial
          isOpen={speedDialOpen}
          icon={{ name: 'add', color: colors.white }}
          openIcon={{ name: 'close', color: colors.white }}
          onOpen={() => setSpeedDialOpen(!speedDialOpen)}
          onClose={() => setSpeedDialOpen(!speedDialOpen)}
          color={colors.primary}
        >
          <SpeedDial.Action
            icon={{ name: 'event', color: colors.white }}
            title={t('organizer.createEvent')}
            onPress={handleCreateEvent}
            color={colors.primary}
          />
          <SpeedDial.Action
            icon={{ name: 'list', color: colors.white }}
            title={t('organizer.manageEvents')}
            onPress={handleViewAllEvents}
            color={colors.primary}
          />
          <SpeedDial.Action
            icon={{ name: 'payment', color: colors.white }}
            title={t('organizer.paymentSettings')}
            onPress={handlePaymentSettings}
            color={colors.primary}
          />
        </SpeedDial>
      );
    }

    return (
      <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
        <Text h4 style={{ marginBottom: spacing.md }}>
          {t('organizer.quickActions')}
        </Text>
        <View style={styles.quickActionsGrid}>
          <Button
            title={t('organizer.createEvent')}
            icon={
              <Icon
                name="add-circle-outline"
                type="material"
                color={colors.white}
                size={20}
                style={{ marginRight: spacing.xs }}
              />
            }
            buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleCreateEvent}
          />
          <Button
            title={t('organizer.manageEvents')}
            icon={
              <Icon
                name="event-note"
                type="material"
                color={colors.white}
                size={20}
                style={{ marginRight: spacing.xs }}
              />
            }
            buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleViewAllEvents}
          />
          <Button
            title={t('organizer.paymentSettings')}
            icon={
              <Icon
                name="payment"
                type="material"
                color={colors.white}
                size={20}
                style={{ marginRight: spacing.xs }}
              />
            }
            buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handlePaymentSettings}
          />
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('organizer.loadingDashboard')}
          </Text>
        </View>
      </View>
    );
  }

  if (error && !analytics) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
          <View style={styles.errorContainer}>
            <Icon
              name="error-outline"
              type="material"
              color={colors.danger}
              size={48}
            />
            <Text style={[styles.errorText, { color: colors.danger }]}>
              {error}
            </Text>
            <Button
              title={t('common.retry')}
              onPress={loadDashboardAnalytics}
              buttonStyle={{ backgroundColor: colors.primary }}
            />
          </View>
        </Card>
      </View>
    );
  }

  // Apply filters to events
  const filteredAndSortedEvents = useMemo(() => {
    if (!analytics) return [];

    let events = analytics.eventStatistics.filter((e) => {
      // Status filter - map event statuses to filter categories
      const statusMap: Record<string, string> = {
        'published': 'published',
        'draft': 'draft',
        'ended': 'completed',
        'paused': 'draft',
        'unpublished': 'draft'
      };
      const mappedStatus = statusMap[e.status] || e.status;
      if (!filters.eventStatus.includes(mappedStatus as any)) return false;
      
      // Date range filter
      if (filters.dateRange.start && new Date(e.startDate) < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && new Date(e.startDate) > filters.dateRange.end) {
        return false;
      }
      
      // Only show events with statistics
      return e.statistics !== undefined;
    });

    // Sort events
    events.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'registrations':
          comparison = (a.statistics?.totalRegistrations || 0) - (b.statistics?.totalRegistrations || 0);
          break;
        case 'checkIns':
          comparison = (a.statistics?.checkedInCount || 0) - (b.statistics?.checkedInCount || 0);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
      }
      
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return events;
  }, [analytics, filters]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const gridColumns = responsive.isPhone ? 2 : responsive.isTablet ? 3 : 4;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text h3 style={{ color: colors.dark }}>
            {t('organizer.dashboard')}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('organizer.dashboardSubtitle')}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Button
            title=""
            icon={
              <Icon
                name="filter-list"
                type="material"
                color={colors.primary}
                size={24}
              />
            }
            type="outline"
            buttonStyle={styles.headerButton}
            onPress={() => setShowFilters(true)}
          />
          <Button
            title=""
            icon={
              <Icon
                name="refresh"
                type="material"
                color={colors.primary}
                size={24}
              />
            }
            type="outline"
            buttonStyle={styles.headerButton}
            onPress={refreshAnalytics}
            loading={isRefreshing}
          />
        </View>
      </View>

      {/* Summary Statistics */}
      {analytics && (
        <View
          style={[
            styles.statsGrid,
            { flexDirection: responsive.isPhone ? 'column' : 'row' },
          ]}
        >
          <View style={styles.statsRow}>
            {renderStatCard(
              t('organizer.totalEvents'),
              analytics.totalEvents,
              `${analytics.publishedEvents} ${t('organizer.publishedEvents')}`,
              colors.primary
            )}
            {renderStatCard(
              t('organizer.totalRegistrations'),
              analytics.totalRegistrations,
              undefined,
              colors.primary
            )}
          </View>
          <View style={styles.statsRow}>
            {renderStatCard(
              t('organizer.totalCheckIns'),
              analytics.totalCheckedIn,
              undefined,
              colors.success
            )}
            {renderStatCard(
              t('organizer.overallRate'),
              `${analytics.overallAttendanceRate.toFixed(1)}%`,
              undefined,
              getAttendanceRateColor(analytics.overallAttendanceRate)
            )}
          </View>
        </View>
      )}

      {/* Event Statistics */}
      <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text h4>{t('organizer.eventAnalytics')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('organizer.eventAnalyticsSubtitle')}
            </Text>
          </View>
          <Button
            title={t('organizer.viewAllEvents')}
            type="outline"
            titleStyle={{ fontSize: 14 }}
            buttonStyle={{ paddingHorizontal: spacing.md }}
            onPress={handleViewAllEvents}
          />
        </View>

        <Divider style={{ marginVertical: spacing.md }} />

        {filteredAndSortedEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="event-busy"
              type="material"
              color={colors.textSecondary}
              size={64}
            />
            <Text
              style={[
                styles.emptyStateTitle,
                { color: colors.textSecondary },
              ]}
            >
              {t('organizer.noActiveEvents')}
            </Text>
            <Text
              style={[styles.emptyStateText, { color: colors.textSecondary }]}
            >
              {t('organizer.noActiveEventsDesc')}
            </Text>
            <Button
              title={t('organizer.createFirstEvent')}
              icon={
                <Icon
                  name="add"
                  type="material"
                  color={colors.white}
                  size={20}
                  style={{ marginRight: spacing.xs }}
                />
              }
              buttonStyle={[
                styles.createButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleCreateEvent}
            />
          </View>
        ) : (
          <View
            style={[
              styles.eventGrid,
              {
                flexDirection: responsive.isPhone ? 'column' : 'row',
              },
            ]}
          >
            {filteredAndSortedEvents.map((event) => (
              <View
                key={event.id}
                style={[
                  styles.eventCardWrapper,
                  {
                    width: responsive.isPhone ? '100%' : responsive.isTablet ? '50%' : '33.33%',
                  },
                ]}
              >
                <EventStatisticsCard event={event} />
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Charts and Analytics */}
      {analytics && filteredAndSortedEvents.length > 0 && (
        <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text h4>{t('organizer.analyticsCharts')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('organizer.analyticsChartsSubtitle')}
              </Text>
            </View>
          </View>
          <Divider style={{ marginVertical: spacing.md }} />
          <DashboardCharts events={filteredAndSortedEvents} />
        </Card>
      )}

      {/* Quick Actions for larger screens */}
      {!isMobile && renderQuickActions()}

      {/* Last Updated */}
      {analytics && (
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
          {t('organizer.lastUpdated')}: {new Date(analytics.lastUpdated).toLocaleString()}
        </Text>
      )}

      {/* Quick Actions for mobile */}
      {isMobile && renderQuickActions()}

      {/* Filter Bottom Sheet */}
      <DashboardFilters
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        currentFilters={filters}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    padding: 0,
  },
  refreshButton: {
    width: 44,
    height: 44,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  statsGrid: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    flex: 1,
  },
  statCard: {
    flex: 1,
    margin: 4,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statHelpText: {
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  eventGrid: {
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  eventCardWrapper: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  actionButton: {
    margin: 4,
    flex: 1,
    minWidth: 150,
  },
  lastUpdated: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 100,
  },
});

export default OrganizerDashboard;