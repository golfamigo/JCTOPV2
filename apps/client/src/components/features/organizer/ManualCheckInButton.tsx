import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Overlay, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { AttendeeSearchResult } from './AttendeeSearchResults';
import { useAppTheme } from '../../../theme';

interface ManualCheckInButtonProps {
  attendee: AttendeeSearchResult;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ManualCheckInButton: React.FC<ManualCheckInButtonProps> = ({
  attendee,
  onConfirm,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useAppTheme();

  const handleConfirm = () => {
    onConfirm();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        title="Check In"
        size="sm"
        onPress={() => setIsOpen(true)}
        disabled={attendee.status !== 'paid'}
        buttonStyle={[styles.checkInButton, { backgroundColor: colors.primary }]}
        icon={
          <Icon
            name="check"
            type="material"
            color={colors.white}
            size={16}
            containerStyle={{ marginRight: 4 }}
          />
        }
      />

      <Overlay
        isVisible={isOpen}
        onBackdropPress={() => setIsOpen(false)}
        overlayStyle={[styles.overlay, { backgroundColor: colors.card }]}
      >
        <View>
          {/* Header */}
          <View style={styles.header}>
            <Text h4 style={[styles.headerTitle, { color: colors.text }]}>
              Confirm Manual Check-In
            </Text>
            <Icon
              name="close"
              type="material"
              color={colors.grey2}
              size={24}
              onPress={() => setIsOpen(false)}
            />
          </View>
          
          {/* Body */}
          <View style={styles.body}>
            {/* Warning Alert */}
            <View style={[styles.warningBox, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
              <Icon
                name="warning"
                type="material"
                color={colors.warning}
                size={20}
                containerStyle={styles.warningIcon}
              />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                Please verify the attendee's identity before checking them in manually.
              </Text>
            </View>
            
            {/* Attendee Details */}
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsTitle, { color: colors.text }]}>
                Attendee Details:
              </Text>
              <View style={styles.detailsList}>
                <Text style={[styles.detailItem, { color: colors.grey1 }]}>
                  Name: {attendee.name}
                </Text>
                <Text style={[styles.detailItem, { color: colors.grey1 }]}>
                  Email: {attendee.email}
                </Text>
                <Text style={[styles.detailItem, { color: colors.grey1 }]}>
                  Registration ID: {attendee.registrationId}
                </Text>
                {attendee.ticketType && (
                  <Text style={[styles.detailItem, { color: colors.grey1 }]}>
                    Ticket Type: {attendee.ticketType}
                  </Text>
                )}
              </View>
            </View>
            
            <Text style={[styles.confirmText, { color: colors.grey2 }]}>
              Are you sure you want to manually check in this attendee?
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              type="clear"
              onPress={() => setIsOpen(false)}
              disabled={isLoading}
              titleStyle={{ color: colors.grey2 }}
              buttonStyle={styles.cancelButton}
            />
            <Button
              title="Confirm Check-In"
              loading={isLoading}
              onPress={handleConfirm}
              buttonStyle={[styles.confirmButton, { backgroundColor: colors.primary }]}
              icon={
                !isLoading && (
                  <Icon
                    name="check"
                    type="material"
                    color={colors.white}
                    size={18}
                    containerStyle={{ marginRight: 6 }}
                  />
                )
              }
            />
          </View>
        </View>
      </Overlay>
    </>
  );
};

const styles = StyleSheet.create({
  checkInButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  overlay: {
    borderRadius: 12,
    padding: 0,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontWeight: '600',
  },
  body: {
    padding: 20,
    gap: 16,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  detailsSection: {
    marginTop: 8,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  detailsList: {
    paddingLeft: 16,
    gap: 4,
  },
  detailItem: {
    fontSize: 13,
    marginBottom: 2,
  },
  confirmText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  cancelButton: {
    paddingHorizontal: 16,
  },
  confirmButton: {
    borderRadius: 6,
    paddingHorizontal: 16,
  },
});