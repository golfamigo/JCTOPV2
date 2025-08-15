import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Overlay, Button, Text, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme';

interface CheckInErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  errorCode?: 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE';
}

export const CheckInErrorModal: React.FC<CheckInErrorModalProps> = ({
  isOpen,
  onClose,
  error,
  errorCode,
}) => {
  const { colors } = useAppTheme();
  
  const getErrorConfig = () => {
    switch (errorCode) {
      case 'ALREADY_CHECKED_IN':
        return {
          iconName: 'info',
          title: 'Already Checked In',
          bgColor: colors.warning + '20',
          color: colors.warning,
          borderColor: colors.warning + '40',
          description: 'This ticket has already been scanned and the attendee has entered the venue.',
        };
      case 'TICKET_NOT_FOUND':
        return {
          iconName: 'block',
          title: 'Ticket Not Found',
          bgColor: colors.error + '20',
          color: colors.error,
          borderColor: colors.error + '40',
          description: 'This QR code is not associated with a valid registration for this event.',
        };
      case 'INVALID_QR_CODE':
      default:
        return {
          iconName: 'warning',
          title: 'Invalid QR Code',
          bgColor: colors.error + '20',
          color: colors.error,
          borderColor: colors.error + '40',
          description: 'The scanned QR code is malformed or does not contain valid ticket data.',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Overlay
      isVisible={isOpen}
      onBackdropPress={onClose}
      overlayStyle={[styles.overlay, { backgroundColor: colors.card }]}
    >
      <View style={styles.container}>
        {/* Error Icon and Title */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Icon
              name={config.iconName}
              type="material"
              color={config.color}
              size={48}
            />
          </View>
          <Text h3 style={[styles.title, { color: config.color }]}>
            {config.title}
          </Text>
        </View>

        {/* Error Message */}
        <View style={[styles.errorCard, { 
          backgroundColor: config.bgColor,
          borderColor: config.borderColor
        }]}>
          <Text style={[styles.errorMessage, { color: colors.text }]}>
            {error}
          </Text>
        </View>

        {/* Error Description */}
        <View style={[styles.descriptionCard, { backgroundColor: colors.grey5 }]}>
          <Text style={[styles.description, { color: colors.grey2 }]}>
            {config.description}
          </Text>
        </View>

        {/* Scan Time */}
        <View style={styles.footer}>
          <Text style={[styles.timestamp, { color: colors.grey2 }]}>
            Scan time: {new Date().toLocaleTimeString()}
          </Text>
        </View>

        {/* Try Another Button */}
        <Button
          title="Try Another Code"
          onPress={onClose}
          buttonStyle={[styles.button, { backgroundColor: config.color }]}
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
  errorCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  descriptionCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
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