import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Badge,
  Icon,
  Header,
  Divider,
} from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { EventReport } from '@jctop-event/shared-types';
import { useReportStore } from '../../../stores/reportStore';
import reportService, { EXPORT_FORMATS } from '../../../services/reportService';
import { ReportVisualization } from './ReportVisualization';
import { ReportExportControls } from './ReportExportControls';
import { useAppTheme } from '@/theme';

export const EventAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, spacing } = useAppTheme();
  const eventId = (route.params as any)?.eventId;
  
  const {
    currentReport,
    reportLoading,
    reportError,
    setReport,
    setReportLoading,
    setReportError,
    clearReport,
  } = useReportStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadReport();
    }

    return () => {
      clearReport();
    };
  }, [eventId]);

  const loadReport = async () => {
    if (!eventId) return;

    setReportLoading(true);
    setReportError(null);

    try {
      const report = await reportService.getEventReport(eventId);
      setReport(report);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load event report';
      setReportError(errorMessage);
    } finally {
      setReportLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadReport();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ended':
        return colors.success;
      case 'published':
        return colors.primary;
      case 'draft':
        return colors.warning;
      case 'paused':
        return colors.warning;
      default:
        return colors.grey3;
    }
  };

  const formatCurrency = (amount: number) => {
    return `NT$ ${amount.toLocaleString('zh-TW')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (reportLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.grey3 }]}>
            Loading event report...
          </Text>
        </View>
      </View>
    );
  }

  if (reportError) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Icon
            name="error-outline"
            type="material"
            color={colors.error}
            size={48}
          />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {reportError}
          </Text>
          <Button
            title="Retry"
            onPress={handleRefresh}
            buttonStyle={[styles.retryButton, { backgroundColor: colors.primary }]}
          />
        </View>
      </View>
    );
  }

  if (!currentReport) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.noDataText, { color: colors.grey3 }]}>
            No report data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        leftComponent={
          <Icon
            name="arrow-back"
            type="material"
            color={colors.white}
            onPress={() => navigation.goBack()}
          />
        }
        centerComponent={{ text: 'Event Analytics', style: { color: colors.white } }}
        rightComponent={
          <Icon
            name="refresh"
            type="material"
            color={colors.white}
            onPress={handleRefresh}
          />
        }
        backgroundColor={colors.primary}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Event Info Card */}
        <Card containerStyle={styles.card}>
          <View style={styles.cardHeader}>
            <Text h4>{currentReport.eventDetails.title}</Text>
            <Badge
              value={currentReport.eventDetails.status}
              badgeStyle={[
                styles.badge,
                { backgroundColor: getStatusColor(currentReport.eventDetails.status) }
              ]}
            />
          </View>
          <Divider style={styles.divider} />
          <View style={styles.eventInfo}>
            <View style={styles.infoRow}>
              <Icon name="event" type="material" size={16} color={colors.grey3} />
              <Text style={styles.infoText}>
                {formatDate(currentReport.eventDetails.startDate instanceof Date ? currentReport.eventDetails.startDate.toISOString() : currentReport.eventDetails.startDate)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="location-on" type="material" size={16} color={colors.grey3} />
              <Text style={styles.infoText}>{currentReport.eventDetails.location}</Text>
            </View>
          </View>
        </Card>

        {/* Summary Statistics */}
        <Card containerStyle={styles.card}>
          <Text h4 style={styles.cardTitle}>Summary</Text>
          <Divider style={styles.divider} />
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Revenue</Text>
              <Text style={styles.statValue}>
                {formatCurrency(currentReport.revenue.net)}
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Tickets Sold</Text>
              <Text style={styles.statValue}>
                {currentReport.registrationStats.total} / {(currentReport as any).totalCapacity || 0}
              </Text>
              <Text style={styles.statHelp}>
                {Math.round((currentReport.registrationStats.total / ((currentReport as any).totalCapacity || 1)) * 100)}% sold
              </Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Registrations</Text>
              <Text style={styles.statValue}>{currentReport.registrationStats.total}</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Check-ins</Text>
              <Text style={styles.statValue}>
                {currentReport.attendanceStats.checkedIn}
              </Text>
              <Text style={styles.statHelp}>
                {Math.round(currentReport.attendanceStats.rate * 100)}% attendance
              </Text>
            </View>
          </View>
        </Card>

        {/* Report Visualization */}
        <ReportVisualization report={currentReport} />

        {/* Export Controls */}
        <ReportExportControls
          eventId={eventId}
          eventTitle={currentReport.eventDetails.title}
        />
        
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    marginBottom: 10,
  },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 8,
  },
  divider: {
    marginVertical: 10,
  },
  eventInfo: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statCard: {
    width: '48%',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statHelp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
});

export default EventAnalyticsScreen;