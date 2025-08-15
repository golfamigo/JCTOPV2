import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  RefreshControl, 
  StyleSheet,
  Dimensions,
} from 'react-native';
import { 
  Text, 
  ButtonGroup,
  Skeleton,
  Divider,
} from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { adminService } from '@/services/adminService';
import PlatformStatsCard from '@/components/features/admin/PlatformStatsCard';
import { LineChart, BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

interface PlatformStatistics {
  totalUsers: number;
  activeEvents: number;
  totalRevenue: number;
  totalRegistrations: number;
  userGrowth: {
    date: string;
    count: number;
  }[];
  eventGrowth: {
    date: string;
    count: number;
  }[];
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(2); // month
  const [statistics, setStatistics] = useState<PlatformStatistics | null>(null);

  const timeRangeButtons = [
    t('admin.statistics.timeRange.today'),
    t('admin.statistics.timeRange.week'),
    t('admin.statistics.timeRange.month'),
    t('admin.statistics.timeRange.year'),
  ];

  const timeRangeValues: ('today' | 'week' | 'month' | 'year')[] = ['today', 'week', 'month', 'year'];

  const loadStatistics = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const stats = await adminService.getPlatformStatistics(timeRangeValues[selectedTimeRange]);
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    loadStatistics();
  }, [selectedTimeRange]);

  const onRefresh = useCallback(() => {
    loadStatistics(true);
  }, [loadStatistics]);

  const formatCurrency = (amount: number) => {
    return `NT$${amount.toLocaleString('zh-TW')}`;
  };

  const chartConfig = {
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  if (loading && !statistics) {
    return (
      <ScrollView style={styles.container}>
        <View style={[styles.content, { padding: spacing.md }]}>
          <Skeleton animation="pulse" height={40} style={{ marginBottom: spacing.md }} />
          <View style={styles.statsGrid}>
            {[1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.statsCardContainer}>
                <Skeleton animation="pulse" height={120} style={{ borderRadius: 12 }} />
              </View>
            ))}
          </View>
          <Skeleton animation="pulse" height={200} style={{ marginTop: spacing.md }} />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      testID="dashboard-scroll-view"
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        <Text h3 style={styles.title}>{t('admin.dashboard')}</Text>
        
        <ButtonGroup
          buttons={timeRangeButtons}
          selectedIndex={selectedTimeRange}
          onPress={setSelectedTimeRange}
          containerStyle={styles.timeRangeSelector}
          selectedButtonStyle={{ backgroundColor: colors.primary }}
        />

        <View style={styles.statsGrid}>
          <View style={styles.statsCardContainer}>
            <PlatformStatsCard
              title={t('admin.statistics.totalUsers')}
              value={statistics?.totalUsers.toLocaleString() || '0'}
              icon="account-group"
              iconColor={colors.primary}
              trend={{ value: 12, isPositive: true }}
            />
          </View>
          <View style={styles.statsCardContainer}>
            <PlatformStatsCard
              title={t('admin.statistics.activeEvents')}
              value={statistics?.activeEvents || 0}
              icon="calendar-check"
              iconColor={colors.success}
              trend={{ value: 5, isPositive: true }}
            />
          </View>
          <View style={styles.statsCardContainer}>
            <PlatformStatsCard
              title={t('admin.statistics.totalRevenue')}
              value={formatCurrency(statistics?.totalRevenue || 0)}
              icon="cash-multiple"
              iconColor={colors.warning}
              trend={{ value: 18, isPositive: true }}
            />
          </View>
          <View style={styles.statsCardContainer}>
            <PlatformStatsCard
              title={t('admin.statistics.totalRegistrations')}
              value={statistics?.totalRegistrations.toLocaleString() || '0'}
              icon="ticket-confirmation"
              iconColor={colors.info}
              trend={{ value: 8, isPositive: false }}
            />
          </View>
        </View>

        <Divider style={{ marginVertical: spacing.lg }} />

        {statistics?.userGrowth && statistics.userGrowth.length > 0 && (
          <View style={styles.chartSection}>
            <Text h4 style={styles.chartTitle}>{t('admin.charts.userGrowth')}</Text>
            <LineChart
              data={{
                labels: statistics.userGrowth.map(d => d.date.split('-').pop() || ''),
                datasets: [{
                  data: statistics.userGrowth.map(d => d.count),
                }],
              }}
              width={screenWidth - spacing.md * 2}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {statistics?.eventGrowth && statistics.eventGrowth.length > 0 && (
          <View style={styles.chartSection}>
            <Text h4 style={styles.chartTitle}>{t('admin.charts.eventGrowth')}</Text>
            <BarChart
              data={{
                labels: statistics.eventGrowth.map(d => d.date.split('-').pop() || ''),
                datasets: [{
                  data: statistics.eventGrowth.map(d => d.count),
                }],
              }}
              width={screenWidth - spacing.md * 2}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
              fromZero
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
  },
  timeRangeSelector: {
    marginBottom: 20,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  statsCardContainer: {
    width: '50%',
    paddingHorizontal: 8,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});