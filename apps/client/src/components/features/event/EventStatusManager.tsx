import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Text, Card, Badge, Button, Overlay, Input } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { UpdateEventStatusDto } from '@jctop-event/shared-types';
import { useAppTheme } from '../../../theme';

type EventStatus = 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';

interface EventStatusManagerProps {
  eventId: string;
  currentStatus: EventStatus;
  onStatusChanged: (newStatus: EventStatus) => void;
  isLoading?: boolean;
}

const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  unpublished: 'Unpublished',
  paused: 'Paused',
  ended: 'Ended',
} as const;

const STATUS_DESCRIPTIONS = {
  draft: 'Event is in draft mode and not visible to the public',
  published: 'Event is live and accepting registrations',
  unpublished: 'Event is hidden from public but data is preserved',
  paused: 'Event is visible but registration is closed',
  ended: 'Event has concluded and registration is closed',
} as const;

const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ['published'],
  published: ['unpublished', 'paused', 'ended'],
  unpublished: ['published', 'ended'],
  paused: ['published', 'ended'],
  ended: [],
};

const EventStatusManager: React.FC<EventStatusManagerProps> = ({
  eventId,
  currentStatus,
  onStatusChanged,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(currentStatus);
  const [reason, setReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { colors } = useAppTheme();

  const availableStatuses = VALID_TRANSITIONS[currentStatus] || [];

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case 'published':
        return colors.success;
      case 'draft':
        return colors.grey3;
      case 'paused':
        return colors.warning;
      case 'unpublished':
        return colors.warning;
      case 'ended':
        return colors.error;
      default:
        return colors.grey3;
    }
  };

  const getButtonColor = (status: EventStatus) => {
    switch (status) {
      case 'published':
        return colors.primary;
      case 'paused':
        return colors.warning;
      case 'unpublished':
      case 'ended':
        return colors.error;
      default:
        return colors.grey2;
    }
  };

  const handleStatusSelection = (newStatus: EventStatus) => {
    setSelectedStatus(newStatus);
    setReason('');
    setShowConfirmDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    try {
      // Here you would call the actual API to update status
      // await eventService.updateStatus(eventId, { status: selectedStatus, reason });
      
      onStatusChanged(selectedStatus);
      setShowConfirmDialog(false);
      
      Alert.alert(
        'Success',
        `Event status changed to ${STATUS_LABELS[selectedStatus]}`
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to update event status'
      );
    }
  };

  if (availableStatuses.length === 0) {
    return (
      <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.statusContainer}>
          <Text style={[styles.label, { color: colors.grey2 }]}>
            Event Status
          </Text>
          <Badge
            value={STATUS_LABELS[currentStatus]}
            badgeStyle={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}
            textStyle={styles.statusBadgeText}
          />
          <Text style={[styles.description, { color: colors.grey3 }]}>
            {STATUS_DESCRIPTIONS[currentStatus]}
          </Text>
          {currentStatus === 'ended' && (
            <Text style={[styles.noChangesText, { color: colors.grey3 }]}>
              No further status changes available
            </Text>
          )}
        </View>
      </Card>
    );
  }

  return (
    <>
      <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.content}>
          {/* Current Status */}
          <View style={styles.currentStatusSection}>
            <Text style={[styles.label, { color: colors.grey2 }]}>
              Current Status
            </Text>
            <Badge
              value={STATUS_LABELS[currentStatus]}
              badgeStyle={[styles.statusBadge, { backgroundColor: getStatusColor(currentStatus) }]}
              textStyle={styles.statusBadgeText}
            />
            <Text style={[styles.description, { color: colors.grey3 }]}>
              {STATUS_DESCRIPTIONS[currentStatus]}
            </Text>
          </View>

          {/* Change Status */}
          <View style={styles.changeStatusSection}>
            <Text style={[styles.label, { color: colors.grey2 }]}>
              Change Status
            </Text>
            <View style={styles.buttonContainer}>
              {availableStatuses.map((status) => (
                <Button
                  key={status}
                  title={STATUS_LABELS[status]}
                  onPress={() => handleStatusSelection(status)}
                  disabled={isLoading}
                  buttonStyle={[
                    styles.statusButton,
                    { backgroundColor: getButtonColor(status) }
                  ]}
                  titleStyle={styles.statusButtonText}
                />
              ))}
            </View>
          </View>
        </View>
      </Card>

      {/* Confirmation Dialog */}
      <Overlay
        isVisible={showConfirmDialog}
        onBackdropPress={() => setShowConfirmDialog(false)}
        overlayStyle={[styles.confirmDialog, { backgroundColor: colors.card }]}
      >
        <View>
          <Text h4 style={[styles.dialogTitle, { color: colors.text }]}>
            Confirm Status Change
          </Text>

          <View style={styles.dialogContent}>
            <View style={styles.statusChangeDisplay}>
              <Text style={[styles.dialogText, { color: colors.text }]}>
                Change event status from
              </Text>
              <Badge
                value={STATUS_LABELS[currentStatus]}
                badgeStyle={[styles.inlineBadge, { backgroundColor: getStatusColor(currentStatus) }]}
                textStyle={styles.inlineBadgeText}
              />
              <Text style={[styles.dialogText, { color: colors.text }]}>
                to
              </Text>
              <Badge
                value={STATUS_LABELS[selectedStatus]}
                badgeStyle={[styles.inlineBadge, { backgroundColor: getStatusColor(selectedStatus) }]}
                textStyle={styles.inlineBadgeText}
              />
            </View>

            <Text style={[styles.statusDescription, { color: colors.grey2 }]}>
              {STATUS_DESCRIPTIONS[selectedStatus]}
            </Text>

            {/* Reason Input */}
            <View style={styles.reasonSection}>
              <Text style={[styles.reasonLabel, { color: colors.text }]}>
                Reason (optional)
              </Text>
              <Input
                placeholder="Enter reason for status change..."
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={3}
                inputContainerStyle={[
                  styles.reasonInput,
                  { borderColor: colors.grey4 }
                ]}
                inputStyle={{ textAlignVertical: 'top' }}
              />
            </View>
          </View>

          <View style={styles.dialogButtons}>
            <Button
              title="Cancel"
              onPress={() => setShowConfirmDialog(false)}
              type="outline"
              buttonStyle={[styles.dialogButton, { borderColor: colors.grey3 }]}
              titleStyle={{ color: colors.text }}
            />
            <Button
              title="Confirm Change"
              onPress={handleConfirmStatusChange}
              loading={isLoading}
              buttonStyle={[
                styles.dialogButton,
                { backgroundColor: getButtonColor(selectedStatus) }
              ]}
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statusContainer: {
    gap: 8,
  },
  content: {
    gap: 24,
  },
  currentStatusSection: {
    gap: 8,
  },
  changeStatusSection: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    lineHeight: 18,
  },
  noChangesText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmDialog: {
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 500,
  },
  dialogTitle: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dialogContent: {
    gap: 16,
  },
  statusChangeDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  dialogText: {
    fontSize: 16,
  },
  inlineBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inlineBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  reasonSection: {
    gap: 8,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 80,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  dialogButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
  },
});

export default EventStatusManager;