import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert as RNAlert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Button,
  Badge,
  Card,
  Divider,
  Tab,
  TabView,
  Icon,
  Header,
  ListItem,
} from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CameraScanner } from './CameraScanner';
import { CameraService } from '../../../services/cameraService';
import { CheckInService } from '../../../services/checkinService';
import { CheckInSuccessModal } from './CheckInSuccessModal';
import { CheckInErrorModal } from './CheckInErrorModal';
import { AttendeeSearchForm } from './AttendeeSearchForm';
import { AttendeeSearchResults, AttendeeSearchResult } from './AttendeeSearchResults';
import eventService from '../../../services/eventService';
import registrationService from '../../../services/registrationService';
import attendeeSearchService from '../../../services/attendeeSearchService';
import { Event } from '@jctop-event/shared-types';
import statisticsService, { EventStatistics } from '../../../services/statisticsService';
import { CheckInStatisticsHeader } from './CheckInStatisticsHeader';
import { useAppTheme } from '@/theme';

interface ScannedTicket {
  registrationId: string;
  attendeeName: string;
  ticketType: string;
  status: 'valid' | 'invalid' | 'already_checked_in';
  errorMessage?: string;
  errorCode?: 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE';
}

export const CheckInModeScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const eventId = (route.params as any)?.eventId;
  const { colors, spacing } = useAppTheme();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [recentScans, setRecentScans] = useState<ScannedTicket[]>([]);
  const [currentScan, setCurrentScan] = useState<ScannedTicket | null>(null);
  const [error, setError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successAttendee, setSuccessAttendee] = useState<{ name: string; email: string; ticketType: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorCode, setErrorCode] = useState<'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE' | undefined>();
  
  // Manual search states
  const [searchResults, setSearchResults] = useState<AttendeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const cameraService = CameraService.getInstance();
  const checkInService = CheckInService.getInstance();

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  // Real-time statistics polling
  useEffect(() => {
    if (!eventId || !statistics) return;

    const interval = setInterval(() => {
      if (!isRefreshingStats) {
        statisticsService.getEventStatistics(eventId, true).then(result => {
          if (result.success && result.data) {
            setStatistics(result.data);
          }
        });
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [eventId, statistics, isRefreshingStats]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      const eventData = await eventService.getEventById(eventId!);
      setEvent(eventData);
      
      // Load check-in statistics
      await loadCheckInStats();
    } catch (error) {
      const errorMessage = `Failed to load event data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      RNAlert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadCheckInStats = async () => {
    try {
      setStatisticsLoading(true);
      setStatisticsError(null);
      
      const result = await statisticsService.getEventStatistics(eventId!);
      
      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setStatisticsError(result.error || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Failed to load check-in stats:', error);
      setStatisticsError('Failed to load statistics');
    } finally {
      setStatisticsLoading(false);
    }
  };

  const refreshStatistics = async () => {
    try {
      setIsRefreshingStats(true);
      setStatisticsError(null);
      
      const result = await statisticsService.refreshEventStatistics(eventId!);
      
      if (result.success && result.data) {
        setStatistics(result.data);
        RNAlert.alert('Success', 'Statistics have been refreshed');
      } else {
        setStatisticsError(result.error || 'Failed to refresh statistics');
        RNAlert.alert('Error', result.error || 'Failed to refresh statistics');
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error);
      setStatisticsError('Failed to refresh statistics');
      RNAlert.alert('Error', 'Failed to refresh statistics');
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const handleQRCodeScanned = async (qrCode: string) => {
    if (isScanning) return;
    
    setIsScanning(true);
    
    try {
      const result = await checkInService.checkInByQRCode(eventId!, qrCode);
      
      if (result.success && result.data) {
        const scanResult: ScannedTicket = {
          registrationId: qrCode,
          attendeeName: result.data.attendee?.name || 'Unknown',
          ticketType: result.data.attendee?.ticketType || 'General',
          status: 'valid',
        };
        
        setCurrentScan(scanResult);
        setRecentScans([scanResult, ...recentScans.slice(0, 9)]);
        setSuccessAttendee(result.data.attendee || null);
        setShowSuccessModal(true);
        
        // Refresh statistics after successful check-in
        loadCheckInStats();
      } else {
        const scanResult: ScannedTicket = {
          registrationId: qrCode,
          attendeeName: 'Unknown',
          ticketType: '',
          status: 'invalid',
          errorMessage: result.error,
          errorCode: result.errorCode as 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE' | undefined,
        };
        
        setCurrentScan(scanResult);
        setRecentScans([scanResult, ...recentScans.slice(0, 9)]);
        setErrorMessage(result.error || 'Invalid QR code');
        setErrorCode(result.errorCode as 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE' | undefined);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setErrorMessage('An unexpected error occurred');
      setShowErrorModal(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualCheckIn = async (attendeeId: string) => {
    try {
      setIsCheckingIn(true);
      setCheckingInId(attendeeId);
      
      const result = await attendeeSearchService.manualCheckIn(eventId!, attendeeId);
      
      if (result.success && result.attendee) {
        setSuccessAttendee(result.attendee || null);
        setShowSuccessModal(true);
        
        // Refresh search results and statistics
        if (searchResults.length > 0) {
          const updatedResults = searchResults.map(r => 
            r.id === attendeeId ? { ...r, checkedIn: true } : r
          );
          setSearchResults(updatedResults);
        }
        
        loadCheckInStats();
      } else {
        setErrorMessage(result.error || 'Failed to check in attendee');
        setErrorCode(result.errorCode);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Manual check-in error:', error);
      setErrorMessage('An unexpected error occurred');
      setShowErrorModal(true);
    } finally {
      setIsCheckingIn(false);
      setCheckingInId(undefined);
    }
  };

  const handleCameraError = (error: string) => {
    RNAlert.alert('Camera Error', error);
  };

  const handleExitCheckInMode = () => {
    (navigation as any).navigate('OrganizerAttendees', { eventId });
  };

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true);
      setSearchError('');
      
      const result = await attendeeSearchService.searchAttendees(eventId!, {
        query,
        limit: 20,
      });
      
      setSearchResults(result.attendees);
      if (result.attendees.length === 0) {
        setSearchError('No attendees found matching your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(error instanceof Error ? error.message : 'An error occurred during search');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEventData();
  };

  const getStatusColor = (status: ScannedTicket['status']) => {
    switch (status) {
      case 'valid':
        return colors.success;
      case 'already_checked_in':
        return colors.warning;
      case 'invalid':
      default:
        return colors.error;
    }
  };

  const getStatusIcon = (status: ScannedTicket['status']) => {
    switch (status) {
      case 'valid':
        return 'check-circle';
      case 'already_checked_in':
        return 'visibility';
      case 'invalid':
      default:
        return 'cancel';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          centerComponent={{ text: 'Check-in Mode', style: { color: colors.white } }}
          backgroundColor={colors.primary}
        />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading check-in mode...</Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          centerComponent={{ text: 'Check-in Mode', style: { color: colors.white } }}
          backgroundColor={colors.primary}
        />
        <View style={styles.centerContent}>
          <Icon name="error-outline" type="material" color={colors.error} size={48} />
          <Text style={[styles.errorText, { color: colors.error }]}>
            Event not found or access denied.
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
        centerComponent={{ text: `Check-in: ${event.title}`, style: { color: colors.white } }}
        rightComponent={
          <Icon
            name="exit-to-app"
            type="material"
            color={colors.white}
            onPress={handleExitCheckInMode}
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
        {/* Statistics Header */}
        {statistics && (
          <CheckInStatisticsHeader
            statistics={statistics}
            isLoading={statisticsLoading}
            error={statisticsError}
            onRefresh={refreshStatistics}
            isRefreshing={isRefreshingStats}
          />
        )}

        {/* Tab Navigation */}
        <Tab
          value={activeTab}
          onChange={setActiveTab}
          indicatorStyle={{ backgroundColor: colors.primary }}
        >
          <Tab.Item
            title="QR Scanner"
            titleStyle={{ fontSize: 14, color: activeTab === 0 ? colors.primary : colors.grey3 }}
            icon={{ name: 'qr-code-scanner', type: 'material', color: activeTab === 0 ? colors.primary : colors.grey3 }}
          />
          <Tab.Item
            title="Manual Search"
            titleStyle={{ fontSize: 14, color: activeTab === 1 ? colors.primary : colors.grey3 }}
            icon={{ name: 'search', type: 'material', color: activeTab === 1 ? colors.primary : colors.grey3 }}
          />
        </Tab>

        <TabView value={activeTab} onChange={setActiveTab} animationType="spring">
          {/* QR Scanner Tab */}
          <TabView.Item style={styles.tabContent}>
            <Card containerStyle={styles.card}>
              <CameraScanner
                onQRCodeScanned={handleQRCodeScanned}
                onError={handleCameraError}
                isScanning={isScanning}
              />
            </Card>

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <Card containerStyle={styles.card}>
                <Text h4 style={styles.cardTitle}>Recent Scans</Text>
                <Divider style={styles.divider} />
                {recentScans.map((scan, index) => (
                  <ListItem key={index} bottomDivider>
                    <Icon
                      name={getStatusIcon(scan.status)}
                      type="material"
                      color={getStatusColor(scan.status)}
                    />
                    <ListItem.Content>
                      <ListItem.Title>{scan.attendeeName}</ListItem.Title>
                      <ListItem.Subtitle>{scan.ticketType || scan.errorMessage}</ListItem.Subtitle>
                    </ListItem.Content>
                    <Badge
                      value={scan.status.replace('_', ' ').toUpperCase()}
                      badgeStyle={{ backgroundColor: getStatusColor(scan.status) }}
                    />
                  </ListItem>
                ))}
              </Card>
            )}
          </TabView.Item>

          {/* Manual Search Tab */}
          <TabView.Item style={styles.tabContent}>
            <Card containerStyle={styles.card}>
              <AttendeeSearchForm
                onSearch={handleSearch}
                isSearching={isSearching}
                onClear={() => {
                  setSearchResults([]);
                  setSearchError('');
                }}
              />
            </Card>

            {searchError && (
              <Card containerStyle={[styles.card, styles.errorCard]}>
                <Text style={styles.errorText}>{searchError}</Text>
              </Card>
            )}

            {searchResults.length > 0 && (
              <Card containerStyle={styles.card}>
                <Text h4 style={styles.cardTitle}>Search Results</Text>
                <Divider style={styles.divider} />
                <AttendeeSearchResults
                  results={searchResults}
                  onCheckIn={(attendee) => handleManualCheckIn(attendee.id)}
                  isCheckingIn={isCheckingIn}
                  checkingInId={checkingInId}
                  isLoading={isSearching}
                  error={searchError}
                />
              </Card>
            )}
          </TabView.Item>
        </TabView>
      </ScrollView>

      {/* Success Modal */}
      {successAttendee && (
        <CheckInSuccessModal
          isOpen={showSuccessModal}
          attendee={successAttendee}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessAttendee(null);
          }}
        />
      )}

      {/* Error Modal */}
      <CheckInErrorModal
        isOpen={showErrorModal}
        error={errorMessage}
        errorCode={errorCode}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
          setErrorCode(undefined);
        }}
      />
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
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  tabContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  card: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  cardTitle: {
    marginBottom: 10,
  },
  divider: {
    marginVertical: 10,
  },
  errorCard: {
    backgroundColor: '#FEE',
    borderColor: '#FCC',
  },
});

export default CheckInModeScreen;