import React from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert as RNAlert } from 'react-native';
import { Card, Text, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { EventStatistics } from '../../../services/statisticsService';
import { useAppTheme } from '../../../theme';

interface CheckInStatisticsHeaderProps {
  statistics: EventStatistics | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const CheckInStatisticsHeader: React.FC<CheckInStatisticsHeaderProps> = ({
  statistics,
  isLoading,
  error,
  onRefresh,
  isRefreshing = false,
}) => {
  const { colors } = useAppTheme();

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 70) return colors.success;
    if (rate >= 40) return colors.warning;
    return colors.error;
  };

  if (isLoading && !statistics) {
    return (
      <Card containerStyle={[styles.loadingCard, { backgroundColor: colors.card, borderColor: colors.grey4 }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Card>
    );
  }

  if (error && !statistics) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.error + '10', borderColor: colors.error }]}>
        <Icon
          name="error"
          type="material"
          color={colors.error}
          size={20}
          containerStyle={styles.errorIcon}
        />
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load statistics: {error}
        </Text>
      </View>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Refresh Button */}
      <TouchableOpacity
        onPress={onRefresh}
        disabled={isRefreshing}
        style={styles.refreshButton}
        activeOpacity={0.7}
      >
        {isRefreshing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Icon
            name="refresh"
            type="material"
            color={colors.primary}
            size={24}
          />
        )}
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        {/* Total Registrations */}
        <Card containerStyle={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.grey4 }]}>
          <View style={styles.statContent}>
            <Text style={[styles.statLabel, { color: colors.grey2 }]}>
              Total Registrations
            </Text>
            <Text style={[styles.statNumber, { color: colors.primary }]}>
              {statistics.totalRegistrations.toLocaleString()}
            </Text>
          </View>
        </Card>
        
        {/* Checked In */}
        <Card containerStyle={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.grey4 }]}>
          <View style={styles.statContent}>
            <Text style={[styles.statLabel, { color: colors.grey2 }]}>
              Checked In
            </Text>
            <Text style={[styles.statNumber, { color: colors.success }]}>
              {statistics.checkedInCount.toLocaleString()}
            </Text>
            <Text style={[styles.statHelp, { color: colors.success }]}>
              {statistics.totalRegistrations > 0 ? statistics.attendanceRate.toFixed(1) : '0.0'}%
            </Text>
          </View>
        </Card>
        
        {/* Pending */}
        <Card containerStyle={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.grey4 }]}>
          <View style={styles.statContent}>
            <Text style={[styles.statLabel, { color: colors.grey2 }]}>
              Pending
            </Text>
            <Text style={[
              styles.statNumber, 
              { color: getAttendanceRateColor(100 - statistics.attendanceRate) }
            ]}>
              {(statistics.totalRegistrations - statistics.checkedInCount).toLocaleString()}
            </Text>
            <Text style={[
              styles.statHelp,
              { color: getAttendanceRateColor(100 - statistics.attendanceRate) }
            ]}>
              {statistics.totalRegistrations > 0 ? (100 - statistics.attendanceRate).toFixed(1) : '100.0'}%
            </Text>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  refreshButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 20,
  },
  statContent: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statHelp: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
});