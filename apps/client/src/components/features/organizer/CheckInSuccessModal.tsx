import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Overlay, Button, Text, Icon } from '@rneui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme';

interface CheckInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: {
    name: string;
    email: string;
    ticketType: string;
  };
}

export const CheckInSuccessModal: React.FC<CheckInSuccessModalProps> = ({
  isOpen,
  onClose,
  attendee,
}) => {
  const { colors } = useAppTheme();

  return (
    <Overlay
      isVisible={isOpen}
      onBackdropPress={onClose}
      overlayStyle={[styles.overlay, { backgroundColor: colors.card }]}
    >
      <View style={styles.container}>
        {/* Success Icon and Title */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Icon
              name="checkmark-circle"
              type="ionicon"
              color={colors.success}
              size={48}
            />
          </View>
          <Text h3 style={[styles.title, { color: colors.success }]}>
            Check-in Successful!
          </Text>
        </View>

        {/* Attendee Information */}
        <View style={[styles.infoCard, { 
          backgroundColor: colors.success + '10',
          borderColor: colors.success + '40'
        }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.grey2 }]}>
              ATTENDEE NAME
            </Text>
            <Text h4 style={[styles.value, { color: colors.text }]}>
              {attendee.name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.grey2 }]}>
              EMAIL
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {attendee.email}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.grey2 }]}>
              TICKET TYPE
            </Text>
            <Text style={[styles.value, styles.semibold, { color: colors.text }]}>
              {attendee.ticketType}
            </Text>
          </View>
        </View>

        {/* Check-in Time */}
        <View style={styles.footer}>
          <Text style={[styles.timestamp, { color: colors.grey2 }]}>
            Check-in time: {new Date().toLocaleTimeString()}
          </Text>
        </View>

        {/* Continue Button */}
        <Button
          title="Continue Scanning"
          onPress={onClose}
          buttonStyle={[styles.button, { backgroundColor: colors.success }]}
          titleStyle={styles.buttonTitle}
        />
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 400,
  },
  container: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
  },
  semibold: {
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timestamp: {
    fontSize: 14,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});