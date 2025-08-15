import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Overlay, Text, Button, Divider } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import type { Registration } from '@shared/types';

interface QRCodeModalProps {
  visible: boolean;
  registration: Registration | null;
  onClose: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const QR_SIZE = Math.min(screenWidth * 0.7, 280);

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  registration,
  onClose,
  onDownload,
  onShare,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  if (!registration || !registration.qrCode) {
    return null;
  }

  const formatRegistrationId = (id: string) => 
    id.substring(0, 8).toUpperCase();

  const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };

  const formatDate = (dateString: string | Date) => 
    new Date(dateString).toLocaleDateString('zh-TW', DATE_FORMAT_OPTIONS);

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={[styles.overlay, { backgroundColor: colors.card }]}
      animationType="fade"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text h4 style={[styles.title, { color: colors.textPrimary }]}>
            {t('tickets.qrCode', { defaultValue: 'QR Code' })}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="close-button">
            <MaterialCommunityIcons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.qrContainer}>
          <View style={[styles.qrWrapper, { backgroundColor: colors.white || '#FFFFFF' }]}>
            <QRCode
              value={registration.qrCode}
              size={QR_SIZE}
              color={colors.textPrimary}
              backgroundColor={colors.white || '#FFFFFF'}
            />
          </View>
          <Text style={[styles.registrationId, { color: colors.textSecondary }]}>
            {t('tickets.registrationId')}: {formatRegistrationId(registration.id)}
          </Text>
        </View>

        <Divider style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.eventInfo}>
          <Text h4 style={[styles.eventTitle, { color: colors.textPrimary }]}>
            {registration.event?.title}
          </Text>
          <View style={styles.eventDetail}>
            <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
              {registration.event && formatDate(registration.event.startDate)}
            </Text>
          </View>
          <View style={styles.eventDetail}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
              {registration.event?.location}
            </Text>
          </View>
        </View>

        <View style={styles.ticketInfo}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {t('tickets.ticketDetails')}
          </Text>
          {registration.ticketSelections?.map((selection, index) => (
            <View key={index} style={styles.ticketRow}>
              <Text style={[styles.ticketName, { color: colors.textSecondary }]}>
                {(selection as any).ticketType?.name || `Ticket Type ${selection.ticketTypeId}`}
              </Text>
              <Text style={[styles.ticketQuantity, { color: colors.textSecondary }]}>
                x{selection.quantity}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.instructions}>
          <MaterialCommunityIcons name="information-outline" size={20} color={colors.info || '#17A2B8'} />
          <Text style={[styles.instructionText, { color: colors.textSecondary }]}>
            {t('tickets.qrCodeInstruction', { defaultValue: '請在入場時出示此 QR Code' })}
          </Text>
        </View>

        <View style={styles.actions}>
          {onDownload && (
            <Button
              title={t('tickets.actions.downloadTicket')}
              onPress={onDownload}
              buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
              titleStyle={styles.actionButtonText}
              icon={
                <MaterialCommunityIcons
                  name="download"
                  size={20}
                  color={colors.white || '#FFFFFF'}
                  style={{ marginRight: 8 }}
                />
              }
            />
          )}
          {onShare && (
            <Button
              title={t('tickets.actions.shareTicket')}
              onPress={onShare}
              buttonStyle={[styles.actionButton, styles.secondaryButton, { borderColor: colors.primary }]}
              titleStyle={[styles.actionButtonText, { color: colors.primary }]}
              type="outline"
              icon={
                <MaterialCommunityIcons
                  name="share-variant"
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
              }
            />
          )}
        </View>
      </ScrollView>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 16,
    padding: 0,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  qrWrapper: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registrationId: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  eventInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  ticketInfo: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ticketName: {
    fontSize: 14,
    flex: 1,
  },
  ticketQuantity: {
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  instructionText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});