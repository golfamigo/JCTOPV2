import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Icon,
  Badge,
  Divider,
} from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/theme';
import { EventWithStatistics } from '../../../services/dashboardAnalyticsService';
import statisticsService, { EventStatistics } from '../../../services/statisticsService';

interface EventStatisticsCardProps {
  event: EventWithStatistics;
  onViewDetails?: () => void;
}

export const EventStatisticsCard: React.FC<EventStatisticsCardProps> = ({
  event,
  onViewDetails,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [statistics, setStatistics] = useState<EventStatistics | null>(
    event.statistics || null
  );
  const [isLoading, setIsLoading] = useState(!event.statistics);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!event.statistics) {
      loadStatistics();
    }
  }, [event.id]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await statisticsService.getEventStatistics(event.id);

      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setError(result.error || t('organizer.loadingFailed'));
      }
    } catch (error) {
      console.error('Failed to load event statistics:', error);
      setError(t('organizer.loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatistics = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const result = await statisticsService.refreshEventStatistics(event.id);

      if (result.success && result.data) {
        setStatistics(result.data);
        Alert.alert(
          t('organizer.statisticsUpdated'),
          t('organizer.statisticsRefreshed')
        );
      } else {
        setError(result.error || t('organizer.refreshFailed'));
      }
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      setError(t('organizer.refreshFailed'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewCheckIn = () => {
    router.push(`/organizer/events/${event.id}/checkin`);
  };

  const handleViewAttendees = () => {
    router.push(`/organizer/events/${event.id}/attendees`);
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 70) return colors.success;
    if (rate >= 40) return colors.warning;
    return colors.danger;
  };

  const getAttendanceRateText = (rate: number) => {
    if (rate >= 70) return t('organizer.excellent');
    if (rate >= 40) return t('organizer.good');
    return t('organizer.needsAttention');
  };

  const renderProgressBar = (rate: number) => {
    const color = getAttendanceRateColor(rate);
    const width = `${Math.min(100, Math.max(0, rate))}%`;

    return (
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            { backgroundColor: colors.lightGrey },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: width as any,
                backgroundColor: color,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {t('organizer.loadingStatistics')}
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text
            style={[styles.eventTitle, { color: colors.dark }]}
            numberOfLines={1}
          >
            {event.title}
          </Text>
          <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
            {new Date(event.startDate).toLocaleDateString()}
          </Text>
          <Badge
            value={
              event.status === 'published'
                ? t('organizer.published')
                : event.status === 'draft'
                ? t('organizer.draft')
                : t('organizer.completed')
            }
            badgeStyle={{
              backgroundColor:
                event.status === 'published'
                  ? colors.success
                  : event.status === 'draft'
                  ? colors.midGrey
                  : colors.primary,
              marginTop: spacing.xs,
            }}
          />
        </View>
        <TouchableOpacity
          onPress={refreshStatistics}
          disabled={isRefreshing}
          style={styles.refreshButton}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Icon
              name="refresh"
              type="material"
              color={colors.primary}
              size={20}
            />
          )}
        </TouchableOpacity>
      </View>

      <Divider style={{ marginVertical: spacing.sm }} />

      {/* Statistics */}
      {error ? (
        <View style={styles.errorContainer}>
          <Icon
            name="error-outline"
            type="material"
            color={colors.danger}
            size={24}
          />
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {error}
          </Text>
        </View>
      ) : statistics ? (
        <View>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('organizer.total')}
              </Text>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                {statistics.totalRegistrations}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('organizer.checkIns')}
              </Text>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {statistics.checkedInCount}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                {t('organizer.attendanceRate')}
              </Text>
              <Text
                style={[
                  styles.statNumber,
                  { color: getAttendanceRateColor(statistics.attendanceRate) },
                ]}
              >
                {statistics.attendanceRate.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {t('organizer.attendanceProgress')}
              </Text>
              <Text
                style={[
                  styles.progressText,
                  { color: getAttendanceRateColor(statistics.attendanceRate) },
                ]}
              >
                {getAttendanceRateText(statistics.attendanceRate)}
              </Text>
            </View>
            {renderProgressBar(statistics.attendanceRate)}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title={t('organizer.checkIn')}
              type="outline"
              size="sm"
              icon={
                <Icon
                  name="check-circle"
                  type="material"
                  color={colors.primary}
                  size={16}
                  style={{ marginRight: spacing.xs }}
                />
              }
              buttonStyle={[styles.actionButton]}
              titleStyle={{ fontSize: 14 }}
              onPress={handleViewCheckIn}
            />
            <Button
              title={t('organizer.attendees')}
              type="clear"
              size="sm"
              buttonStyle={[styles.actionButton]}
              titleStyle={{ fontSize: 14, color: colors.primary }}
              onPress={handleViewAttendees}
            />
          </View>

          {/* Last Updated */}
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            {t('organizer.updated')} {new Date(statistics.lastUpdated).toLocaleTimeString()}
          </Text>
        </View>
      ) : (
        <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
          {t('organizer.noStatisticsAvailable')}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    marginBottom: 4,
  },
  refreshButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    height: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  lastUpdated: {
    fontSize: 11,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default EventStatisticsCard;