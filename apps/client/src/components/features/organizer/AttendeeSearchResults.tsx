import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Button, Badge, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme';

export interface AttendeeSearchResult {
  id: string;
  name: string;
  email: string;
  registrationId: string;
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  checkedInAt?: string;
  ticketType?: string;
}

interface AttendeeSearchResultsProps {
  results: AttendeeSearchResult[];
  isLoading: boolean;
  error?: string;
  onCheckIn: (attendee: AttendeeSearchResult) => void;
  isCheckingIn: boolean;
  checkingInId?: string;
}

export const AttendeeSearchResults: React.FC<AttendeeSearchResultsProps> = ({
  results,
  isLoading,
  error,
  onCheckIn,
  isCheckingIn,
  checkingInId,
}) => {
  const { colors } = useAppTheme();

  const getStatusBadge = (status: AttendeeSearchResult['status']) => {
    switch (status) {
      case 'checkedIn':
        return { color: colors.success, label: 'Checked In' };
      case 'paid':
        return { color: colors.primary, label: 'Paid' };
      case 'pending':
        return { color: colors.warning, label: 'Pending' };
      case 'cancelled':
        return { color: colors.error, label: 'Cancelled' };
      default:
        return { color: colors.grey3, label: 'Unknown' };
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.grey2 }]}>
          Searching for attendees...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (results.length === 0) {
    return (
      <View style={[styles.emptyContainer, { 
        backgroundColor: colors.card,
        borderColor: colors.grey4
      }]}>
        <Text style={[styles.emptyTitle, { color: colors.grey2 }]}>
          No attendees found
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.grey3 }]}>
          Try searching with a different name or registration number
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.resultCount, { color: colors.grey2 }]}>
        Found {results.length} attendee{results.length !== 1 ? 's' : ''}
      </Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {results.map((attendee) => {
          const statusBadge = getStatusBadge(attendee.status);
          const isCheckedIn = attendee.status === 'checkedIn';
          const canCheckIn = attendee.status === 'paid';
          
          return (
            <View
              key={attendee.id}
              style={[styles.resultCard, { 
                backgroundColor: colors.card,
                borderColor: colors.grey4
              }]}
            >
              <View style={styles.cardContent}>
                <View style={styles.attendeeInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.attendeeName, { color: colors.text }]}>
                      {attendee.name}
                    </Text>
                    <Badge
                      value={statusBadge.label}
                      badgeStyle={[styles.statusBadge, { backgroundColor: statusBadge.color }]}
                      textStyle={styles.badgeText}
                    />
                  </View>
                  
                  <Text style={[styles.attendeeEmail, { color: colors.grey2 }]}>
                    {attendee.email}
                  </Text>
                  
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaText, { color: colors.grey3 }]}>
                      ID: {attendee.registrationId}
                    </Text>
                    {attendee.ticketType && (
                      <Text style={[styles.metaText, { color: colors.grey3 }]}>
                        Ticket: {attendee.ticketType}
                      </Text>
                    )}
                  </View>
                  
                  {isCheckedIn && attendee.checkedInAt && (
                    <View style={styles.checkedInRow}>
                      <Icon
                        name="check-circle"
                        type="material"
                        color={colors.success}
                        size={14}
                      />
                      <Text style={[styles.checkedInText, { color: colors.success }]}>
                        Checked in at {new Date(attendee.checkedInAt).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.actionContainer}>
                  {canCheckIn ? (
                    <Button
                      title="Check In"
                      onPress={() => onCheckIn(attendee)}
                      loading={isCheckingIn && checkingInId === attendee.id}
                      loadingProps={{ color: colors.white }}
                      disabled={isCheckingIn}
                      buttonStyle={[styles.checkInButton, { backgroundColor: colors.primary }]}
                      titleStyle={styles.buttonTitle}
                      icon={
                        !isCheckingIn || checkingInId !== attendee.id ? (
                          <Icon
                            name="check"
                            type="material"
                            color={colors.white}
                            size={16}
                            containerStyle={styles.buttonIcon}
                          />
                        ) : undefined
                      }
                    />
                  ) : isCheckedIn ? (
                    <Button
                      title="Checked In"
                      disabled
                      buttonStyle={[styles.checkInButton, styles.checkedButton, { 
                        borderColor: colors.success 
                      }]}
                      titleStyle={[styles.buttonTitle, { color: colors.success }]}
                      type="outline"
                      icon={
                        <Icon
                          name="check"
                          type="material"
                          color={colors.success}
                          size={16}
                          containerStyle={styles.buttonIcon}
                        />
                      }
                    />
                  ) : (
                    <Button
                      title="Not Eligible"
                      disabled
                      buttonStyle={[styles.checkInButton, styles.disabledButton]}
                      titleStyle={[styles.buttonTitle, { color: colors.grey3 }]}
                      type="clear"
                    />
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    paddingVertical: 48,
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
  emptyContainer: {
    padding: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  resultCard: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  attendeeInfo: {
    flex: 1,
    marginRight: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attendeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attendeeEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 12,
  },
  checkedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkedInText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionContainer: {
    justifyContent: 'center',
  },
  checkInButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkedButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: 'transparent',
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 4,
  },
});