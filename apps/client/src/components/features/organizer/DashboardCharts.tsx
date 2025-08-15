import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Card,
  Text,
  Divider,
} from '@rneui/themed';
import {
  LineChart,
  BarChart,
  PieChart,
} from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { EventWithStatistics } from '../../../services/dashboardAnalyticsService';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardChartsProps {
  events: EventWithStatistics[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ events }) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  // Responsive chart width
  const chartWidth = screenWidth - (spacing.lg * 2);
  const isMobile = screenWidth < 768;
  const chartHeight = isMobile ? 200 : 250;

  // Prepare data for charts
  const prepareRegistrationData = () => {
    const sortedEvents = [...events]
      .filter(e => e.statistics)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(-7); // Last 7 events

    const labels = sortedEvents.map(e => {
      const date = new Date(e.startDate);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

    const registrations = sortedEvents.map(e => e.statistics?.totalRegistrations || 0);
    const checkIns = sortedEvents.map(e => e.statistics?.checkedInCount || 0);

    return {
      labels,
      datasets: [
        {
          data: registrations,
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2,
        },
        {
          data: checkIns,
          color: (opacity = 1) => colors.success,
          strokeWidth: 2,
        },
      ],
      legend: [t('organizer.registrations'), t('organizer.checkIns')],
    };
  };

  const prepareAttendanceData = () => {
    const sortedEvents = [...events]
      .filter(e => e.statistics)
      .sort((a, b) => (b.statistics?.totalRegistrations || 0) - (a.statistics?.totalRegistrations || 0))
      .slice(0, 5); // Top 5 events

    const labels = sortedEvents.map(e => {
      const title = e.title.length > 15 ? e.title.substring(0, 12) + '...' : e.title;
      return title;
    });

    const data = sortedEvents.map(e => e.statistics?.attendanceRate || 0);

    return {
      labels,
      data,
    };
  };

  const prepareStatusData = () => {
    const statusCounts = events.reduce((acc, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
      name: t(`organizer.${status}`),
      population: count,
      color: status === 'published' ? colors.success : 
             status === 'draft' ? colors.warning : 
             colors.midGrey,
      legendFontColor: colors.dark,
      legendFontSize: 14,
    }));

    return pieData;
  };

  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  if (!events || events.length === 0) {
    return null;
  }

  const registrationData = prepareRegistrationData();
  const attendanceData = prepareAttendanceData();
  const statusData = prepareStatusData();

  return (
    <ScrollView horizontal={!isMobile} showsHorizontalScrollIndicator={false}>
      <View style={styles.chartsContainer}>
        {/* Registration Trends Chart */}
        {registrationData.labels.length > 0 && (
          <Card containerStyle={[styles.chartCard, { backgroundColor: colors.white }]}>
            <Text h4 style={{ marginBottom: spacing.md }}>
              {t('organizer.registrationTrends')}
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              {t('organizer.registrationTrendsDesc')}
            </Text>
            <Divider style={{ marginVertical: spacing.sm }} />
            <LineChart
              data={registrationData}
              width={isMobile ? chartWidth : 400}
              height={chartHeight}
              yAxisSuffix=""
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </Card>
        )}

        {/* Attendance Rate Chart */}
        {attendanceData.labels.length > 0 && (
          <Card containerStyle={[styles.chartCard, { backgroundColor: colors.white }]}>
            <Text h4 style={{ marginBottom: spacing.md }}>
              {t('organizer.topEventsByAttendance')}
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              {t('organizer.topEventsByAttendanceDesc')}
            </Text>
            <Divider style={{ marginVertical: spacing.sm }} />
            <BarChart
              data={{
                labels: attendanceData.labels,
                datasets: [{
                  data: attendanceData.data,
                }],
              }}
              width={isMobile ? chartWidth : 400}
              height={chartHeight}
              yAxisSuffix="%"
              yAxisLabel=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => colors.success,
              }}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </Card>
        )}

        {/* Event Status Distribution */}
        {statusData.length > 0 && (
          <Card containerStyle={[styles.chartCard, { backgroundColor: colors.white }]}>
            <Text h4 style={{ marginBottom: spacing.md }}>
              {t('organizer.eventStatusDistribution')}
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>
              {t('organizer.eventStatusDistributionDesc')}
            </Text>
            <Divider style={{ marginVertical: spacing.sm }} />
            <View style={styles.pieChartContainer}>
              <PieChart
                data={statusData}
                width={isMobile ? chartWidth : 350}
                height={200}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  chartsContainer: {
    flexDirection: 'row',
    paddingVertical: 16,
  },
  chartCard: {
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 16,
    minWidth: 320,
  },
  chartSubtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
});

export default DashboardCharts;