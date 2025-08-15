import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  SearchBar,
  ListItem,
  Badge,
  Icon,
  Header,
  Divider,
  ButtonGroup,
} from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import attendeeService, { AttendeeDto, AttendeeListResponse } from '../../../services/attendeeService';
import eventService from '../../../services/eventService';
import { Event } from '@jctop-event/shared-types';
import { useAppTheme } from '@/theme';

interface AttendeeManagementPageProps {
  eventId?: string;
  onNavigateBack?: () => void;
}

const AttendeeManagementPage: React.FC<AttendeeManagementPageProps> = ({
  eventId: propEventId,
  onNavigateBack,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, spacing } = useAppTheme();
  
  const eventId = propEventId || (route.params as any)?.eventId;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [attendeeData, setAttendeeData] = useState<AttendeeListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'status' | 'userName' | 'finalAmount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [statusFilterIndex, setStatusFilterIndex] = useState(0);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const statusOptions = ['All', 'Pending', 'Paid', 'Checked In', 'Cancelled'];

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  useEffect(() => {
    loadAttendees();
  }, [eventId, statusFilter, searchTerm, sortBy, sortOrder, currentPage]);

  const loadEventDetails = async () => {
    if (!eventId) return;
    
    try {
      const eventData = await eventService.getEventForUser(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    }
  };

  const loadAttendees = async () => {
    if (!eventId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        status: statusFilter ? statusFilter as ('pending' | 'paid' | 'cancelled' | 'checkedIn') : undefined,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize,
      };

      const data = await attendeeService.getEventAttendees(eventId, params);
      setAttendeeData(data);
    } catch (error) {
      console.error('Error loading attendees:', error);
      setError(error instanceof Error ? error.message : 'Failed to load attendees');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAttendees();
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (index: number) => {
    setStatusFilterIndex(index);
    const status = index === 0 ? '' : statusOptions[index].toLowerCase().replace(' ', '_');
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setIsExporting(true);
      
      // Map status filter to expected type
      let mappedStatus: 'pending' | 'paid' | 'cancelled' | 'checkedIn' | undefined;
      if (statusFilter) {
        const statusMap: Record<string, 'pending' | 'paid' | 'cancelled' | 'checkedIn'> = {
          'pending': 'pending',
          'paid': 'paid',
          'cancelled': 'cancelled',
          'checked_in': 'checkedIn',
          'checkedIn': 'checkedIn',
        };
        mappedStatus = statusMap[statusFilter.toLowerCase()];
      }
      
      await attendeeService.exportEventAttendees(eventId!, {
        format,
        status: mappedStatus,
        search: searchTerm || undefined,
      });
      
      Alert.alert(
        'Export Successful',
        `Attendee list exported as ${format.toUpperCase()}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Export Failed',
        error instanceof Error ? error.message : 'Failed to export attendees',
        [{ text: 'OK' }]
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleAttendeeAction = async (attendee: AttendeeDto, action: string) => {
    switch (action) {
      case 'resend':
        await attendeeService.resendTicket(eventId!, attendee.id);
        Alert.alert('Success', 'Ticket resent successfully');
        break;
      case 'checkIn':
        await attendeeService.checkInAttendee(eventId!, attendee.id);
        loadAttendees();
        break;
      case 'cancel':
        Alert.alert(
          'Cancel Registration',
          'Are you sure you want to cancel this registration?',
          [
            { text: 'No', style: 'cancel' },
            { 
              text: 'Yes', 
              style: 'destructive',
              onPress: async () => {
                await attendeeService.cancelRegistration(eventId!, attendee.id);
                loadAttendees();
              }
            }
          ]
        );
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'checked_in':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.grey3;
    }
  };

  const renderAttendee = (attendee: AttendeeDto) => (
    <ListItem.Swipeable
      key={attendee.id}
      bottomDivider
      leftContent={(reset) => (
        <Button
          title="Check In"
          onPress={() => {
            reset();
            handleAttendeeAction(attendee, 'checkIn');
          }}
          icon={{ name: 'check', type: 'material', color: 'white' }}
          buttonStyle={{ minHeight: '100%', backgroundColor: colors.success }}
        />
      )}
      rightContent={(reset) => (
        <Button
          title="Cancel"
          onPress={() => {
            reset();
            handleAttendeeAction(attendee, 'cancel');
          }}
          icon={{ name: 'close', type: 'material', color: 'white' }}
          buttonStyle={{ minHeight: '100%', backgroundColor: colors.error }}
        />
      )}
    >
      <ListItem.Content>
        <View style={styles.attendeeRow}>
          <View style={styles.attendeeInfo}>
            <Text style={styles.attendeeName}>{attendee.userName}</Text>
            <Text style={styles.attendeeEmail}>{attendee.userEmail}</Text>
            <View style={styles.attendeeDetails}>
              <Badge
                value={attendee.status}
                badgeStyle={[styles.statusBadge, { backgroundColor: getStatusColor(attendee.status) }]}
                textStyle={styles.badgeText}
              />
              <Text style={styles.ticketType}>{attendee.ticketSelections?.[0]?.ticketTypeId || 'N/A'}</Text>
              <Text style={styles.amount}>NT$ {attendee.finalAmount}</Text>
            </View>
          </View>
          <Icon
            name="more-vert"
            type="material"
            color={colors.grey3}
            onPress={() => {
              Alert.alert(
                'Actions',
                'Choose an action',
                [
                  { text: 'Resend Ticket', onPress: () => handleAttendeeAction(attendee, 'resend') },
                  { text: 'Check In', onPress: () => handleAttendeeAction(attendee, 'checkIn') },
                  { text: 'Cancel', onPress: () => handleAttendeeAction(attendee, 'cancel'), style: 'destructive' },
                  { text: 'Close', style: 'cancel' }
                ]
              );
            }}
          />
        </View>
      </ListItem.Content>
    </ListItem.Swipeable>
  );

  if (!eventId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No event ID provided</Text>
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
            onPress={() => onNavigateBack ? onNavigateBack() : navigation.goBack()}
          />
        }
        centerComponent={{ text: 'Attendee Management', style: { color: colors.white } }}
        rightComponent={
          <Icon
            name="file-download"
            type="material"
            color={colors.white}
            onPress={() => {
              Alert.alert(
                'Export Format',
                'Choose export format',
                [
                  { text: 'CSV', onPress: () => handleExport('csv') },
                  { text: 'Excel', onPress: () => handleExport('excel') },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
          />
        }
        backgroundColor={colors.primary}
      />

      {event && (
        <Card containerStyle={styles.eventCard}>
          <Text h4>{event.title}</Text>
          <Text style={styles.eventDetails}>
            {new Date(event.startDate).toLocaleDateString()} • {(event as any).venue?.name || event.location}
          </Text>
        </Card>
      )}

      <View style={styles.filters}>
        <SearchBar
          placeholder="Search by name or email..."
          onChangeText={handleSearch}
          value={searchTerm}
          platform="default"
          containerStyle={styles.searchBar}
          inputContainerStyle={styles.searchInput}
        />
        
        <ButtonGroup
          buttons={statusOptions}
          selectedIndex={statusFilterIndex}
          onPress={handleStatusFilter}
          containerStyle={styles.filterButtons}
        />
      </View>

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
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading attendees...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="error-outline" type="material" color={colors.error} size={48} />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              onPress={loadAttendees}
              buttonStyle={[styles.retryButton, { backgroundColor: colors.primary }]}
            />
          </View>
        ) : attendeeData && attendeeData.attendees.length > 0 ? (
          <>
            {attendeeData.attendees.map(renderAttendee)}
            
            {attendeeData.totalPages > 1 && (
              <View style={styles.pagination}>
                <Button
                  title="Previous"
                  disabled={currentPage === 1}
                  onPress={() => setCurrentPage(currentPage - 1)}
                  type="outline"
                />
                <Text style={styles.pageInfo}>
                  Page {currentPage} of {attendeeData.totalPages}
                </Text>
                <Button
                  title="Next"
                  disabled={currentPage === attendeeData.totalPages}
                  onPress={() => setCurrentPage(currentPage + 1)}
                  type="outline"
                />
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" type="material" color={colors.grey3} size={64} />
            <Text style={styles.emptyText}>No attendees found</Text>
          </View>
        )}
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
  eventCard: {
    margin: 10,
    borderRadius: 8,
  },
  eventDetails: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  filters: {
    padding: 10,
  },
  searchBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
  },
  filterButtons: {
    marginTop: 10,
    borderRadius: 8,
  },
  attendeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeeInfo: {
    flex: 1,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  attendeeEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  attendeeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 10,
  },
  statusBadge: {
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
  },
  ticketType: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
});

export default AttendeeManagementPage;