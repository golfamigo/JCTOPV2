import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text, Card, Badge, Button, Tab, TabView, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { Event } from '@jctop-event/shared-types';
import eventService from '../../../services/eventService';
import DiscountCodeList from './DiscountCodeList';
import TicketConfiguration from './TicketConfiguration';
import SeatingConfiguration from './SeatingConfiguration';
import EventStatusManager from './EventStatusManager';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../../theme';

interface EventManagementProps {
  eventId: string;
  onNavigateBack?: () => void;
}

const EventManagement: React.FC<EventManagementProps> = ({
  eventId,
  onNavigateBack,
}) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();
  const { colors } = useAppTheme();

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const eventData = await eventService.getEventForUser(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return colors.success;
      case 'draft':
        return colors.warning;
      case 'paused':
        return colors.warning;
      case 'ended':
        return colors.grey3;
      default:
        return colors.grey3;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.grey2 }]}>
          Loading event details...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.errorContainer, { 
          backgroundColor: colors.error + '10',
          borderColor: colors.error 
        }]}>
          <Icon
            name="error"
            type="material"
            color={colors.error}
            size={20}
            containerStyle={styles.errorIcon}
          />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.warningContainer, { 
          backgroundColor: colors.warning + '10',
          borderColor: colors.warning 
        }]}>
          <Icon
            name="warning"
            type="material"
            color={colors.warning}
            size={20}
            containerStyle={styles.errorIcon}
          />
          <Text style={[styles.errorText, { color: colors.warning }]}>
            Event not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Button
            title="My Events"
            type="clear"
            titleStyle={[styles.breadcrumbLink, { color: colors.primary }]}
            onPress={onNavigateBack}
            icon={
              <Icon
                name="chevron-left"
                type="material"
                color={colors.primary}
                size={20}
              />
            }
          />
          <Icon
            name="chevron-right"
            type="material"
            color={colors.grey3}
            size={20}
          />
          <Text style={[styles.breadcrumbCurrent, { color: colors.text }]}>
            Event Management
          </Text>
        </View>

        {/* Event Header */}
        <Card containerStyle={[styles.headerCard, { backgroundColor: colors.card }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text h3 style={[styles.eventTitle, { color: colors.text }]}>
                {event.title}
              </Text>
              <Text style={[styles.eventDescription, { color: colors.grey2 }]}>
                {event.description}
              </Text>
            </View>
            
            <Badge
              value={event.status}
              badgeStyle={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}
              textStyle={styles.statusBadgeText}
            />
          </View>

          <View style={styles.eventDetails}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.grey2 }]}>
                Start Date
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(event.startDate)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.grey2 }]}>
                End Date
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(event.endDate)}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.grey2 }]}>
                Location
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {event.location}
              </Text>
            </View>
          </View>
        </Card>

        {/* Management Tabs */}
        <View style={styles.tabContainer}>
          <Tab
            value={activeTab}
            onChange={setActiveTab}
            indicatorStyle={{ backgroundColor: colors.primary }}
            variant="default"
          >
            <Tab.Item 
              title="Status" 
              titleStyle={[styles.tabTitle, { color: activeTab === 0 ? colors.primary : colors.grey2 }]}
            />
            <Tab.Item 
              title="Attendees" 
              titleStyle={[styles.tabTitle, { color: activeTab === 1 ? colors.primary : colors.grey2 }]}
            />
            <Tab.Item 
              title="Discounts" 
              titleStyle={[styles.tabTitle, { color: activeTab === 2 ? colors.primary : colors.grey2 }]}
            />
            <Tab.Item 
              title="Tickets" 
              titleStyle={[styles.tabTitle, { color: activeTab === 3 ? colors.primary : colors.grey2 }]}
            />
            <Tab.Item 
              title="Seating" 
              titleStyle={[styles.tabTitle, { color: activeTab === 4 ? colors.primary : colors.grey2 }]}
            />
          </Tab>

          <TabView value={activeTab} onChange={setActiveTab} animationType="spring">
            {/* Event Status Tab */}
            <TabView.Item style={styles.tabContent}>
              <EventStatusManager
                eventId={eventId}
                currentStatus={event.status}
                onStatusChanged={(newStatus) => {
                  setEvent(prev => prev ? { ...prev, status: newStatus } : null);
                }}
              />
            </TabView.Item>

            {/* Attendees Tab */}
            <TabView.Item style={styles.tabContent}>
              <Card containerStyle={[styles.tabCard, { backgroundColor: colors.card }]}>
                <View style={styles.attendeesContent}>
                  <View style={styles.attendeesHeader}>
                    <Text h4 style={[styles.sectionTitle, { color: colors.text }]}>
                      Attendee Management
                    </Text>
                    <Text style={[styles.sectionDescription, { color: colors.grey2 }]}>
                      View and manage event attendees, track registrations, and export attendee lists.
                    </Text>
                  </View>
                  
                  <Button
                    title="Manage Attendees"
                    onPress={() => router.push(`/organizer/events/${eventId}/attendees`)}
                    buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
                    icon={
                      <Icon
                        name="people"
                        type="material"
                        color={colors.white}
                        size={20}
                        containerStyle={{ marginRight: 8 }}
                      />
                    }
                  />
                  
                  <View style={[styles.infoBox, { backgroundColor: colors.grey5 }]}>
                    <Text style={[styles.infoText, { color: colors.grey2 }]}>
                      Access detailed attendee information including contact details, payment status, 
                      registration dates, and custom field responses. Export attendee lists to CSV or Excel 
                      for external use.
                    </Text>
                  </View>
                </View>
              </Card>
            </TabView.Item>

            {/* Discount Codes Tab */}
            <TabView.Item style={styles.tabContent}>
              <DiscountCodeList eventId={eventId} />
            </TabView.Item>

            {/* Tickets Tab */}
            <TabView.Item style={styles.tabContent}>
              <Card containerStyle={[styles.tabCard, { backgroundColor: colors.card }]}>
                <Text h4 style={[styles.sectionTitle, { color: colors.text }]}>
                  Ticket Configuration
                </Text>
                <Text style={[styles.sectionDescription, { color: colors.grey2 }]}>
                  Configure ticket types and pricing for your event.
                </Text>
                <TicketConfiguration
                  ticketTypes={[]} // TODO: Load actual ticket types
                  onChange={(ticketTypes) => {
                    console.log('Ticket types updated:', ticketTypes);
                    // TODO: Implement ticket type updates
                  }}
                />
              </Card>
            </TabView.Item>

            {/* Seating Tab */}
            <TabView.Item style={styles.tabContent}>
              <Card containerStyle={[styles.tabCard, { backgroundColor: colors.card }]}>
                <Text h4 style={[styles.sectionTitle, { color: colors.text }]}>
                  Seating Configuration
                </Text>
                <Text style={[styles.sectionDescription, { color: colors.grey2 }]}>
                  Configure seating zones and capacity for your event.
                </Text>
                <SeatingConfiguration
                  seatingZones={[]} // TODO: Load actual seating zones
                  onChange={(seatingZones) => {
                    console.log('Seating zones updated:', seatingZones);
                    // TODO: Implement seating zone updates
                  }}
                />
              </Card>
            </TabView.Item>
          </TabView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  breadcrumbLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  breadcrumbCurrent: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  eventTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  detailItem: {
    minWidth: 100,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    marginTop: 16,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 400,
  },
  tabCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  attendeesContent: {
    gap: 16,
  },
  attendeesHeader: {
    marginBottom: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

export default EventManagement;