import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, TouchableNativeFeedback } from 'react-native';
import { Card, Text, Badge, Button, ListItem } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import * as Haptics from 'expo-haptics';
import type { Registration } from '@shared/types';

interface TicketCardProps {
  registration: Registration;
  onViewQRCode: () => void;
  onViewDetails: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  registration,
  onViewQRCode,
  onViewDetails,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [expanded, setExpanded] = useState(false);

  const STATUS_COLORS: Record<Registration['status'], string> = {
    pending: colors.warning,
    paid: colors.success,
    cancelled: colors.danger,
    checkedIn: colors.info || '#17A2B8',
  };

  const getStatusColor = (status: Registration['status']) => 
    STATUS_COLORS[status] || colors.textSecondary;

  const getStatusText = (status: Registration['status']) => {
    return t(`tickets.status.${status}`, { defaultValue: status });
  };

  const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };

  const formatDate = (dateString: string | Date) => 
    new Date(dateString).toLocaleDateString('zh-TW', DATE_FORMAT_OPTIONS);

  const formatAmount = (amount: number) => 
    `NT$ ${amount.toLocaleString('zh-TW')}`;

  const formatRegistrationId = (id: string) => 
    id.substring(0, 8).toUpperCase();

  const calculateTotalTickets = () => {
    return registration.ticketSelections?.reduce((sum, selection) => sum + selection.quantity, 0) || 0;
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onViewDetails();
  };

  const handleQRPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onViewQRCode();
  };

  const handleAccordionPress = () => {
    if (Platform.OS === 'ios') {
      Haptics.selectionAsync();
    }
    setExpanded(!expanded);
  };

  if (!registration.event) {
    return null;
  }

  return (
    <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text h4 style={[styles.eventTitle, { color: colors.textPrimary }]}>
              {registration.event.title}
            </Text>
            <Text style={[styles.registrationId, { color: colors.textSecondary }]}>
              {t('tickets.registrationId')}: {formatRegistrationId(registration.id)}
            </Text>
          </View>
          <Badge
            value={getStatusText(registration.status)}
            badgeStyle={[styles.statusBadge, { backgroundColor: getStatusColor(registration.status) }]}
            textStyle={styles.statusText}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatDate(registration.event.startDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {registration.event.location}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="ticket" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {calculateTotalTickets()} {t('tickets.tickets')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="cash" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>
              {formatAmount(registration.finalAmount)}
            </Text>
          </View>
        </View>

        <ListItem.Accordion
          content={
            <ListItem.Content>
              <Text style={[styles.accordionTitle, { color: colors.primary }]}>
                {t('tickets.ticketDetails')}
              </Text>
            </ListItem.Content>
          }
          isExpanded={expanded}
          onPress={handleAccordionPress}
          containerStyle={[styles.accordion, { backgroundColor: colors.card }]}
          icon={
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={colors.primary}
            />
          }
        >
          <View style={[styles.expandedContent, { backgroundColor: colors.background }]}>
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
                <Text style={[styles.ticketPrice, { color: colors.textSecondary }]}>
                  NT$ {((selection.price || 0) * selection.quantity).toLocaleString('zh-TW')}
                </Text>
              </View>
            ))}
            
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('tickets.eventDetails')}
            </Text>
            <View style={styles.eventDetail}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('events.organizer')}:
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {(registration.event as any).organizerName || 'Organizer'}
              </Text>
            </View>
            <View style={styles.eventDetail}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('registration.registrationDate')}:
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {formatDate(registration.createdAt)}
              </Text>
            </View>
            <View style={styles.eventDetail}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                {t('payment.status')}:
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {t(`payment.status.${registration.paymentStatus}`, { defaultValue: registration.paymentStatus })}
              </Text>
            </View>
          </View>
        </ListItem.Accordion>

        {registration.qrCode && (
          <View style={styles.qrSection}>
            <View style={[styles.qrPlaceholder, { backgroundColor: colors.background }]}>
              <MaterialCommunityIcons name="qrcode" size={60} color={colors.textSecondary} />
              <Text style={[styles.qrText, { color: colors.textSecondary }]}>
                {t('tickets.actions.viewQRCode')}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.actions}>
        <Button
          title={t('tickets.actions.viewQRCode')}
          onPress={handleQRPress}
          buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
          titleStyle={styles.actionButtonText}
          icon={
            <MaterialCommunityIcons
              name="qrcode"
              size={20}
              color={colors.white || '#FFFFFF'}
              style={{ marginRight: 8 }}
            />
          }
          disabled={!registration.qrCode || registration.status !== 'paid'}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  registrationId: {
    fontSize: 12,
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  qrSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  qrText: {
    fontSize: 10,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  accordion: {
    paddingHorizontal: 0,
    marginTop: 12,
    borderRadius: 8,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  expandedContent: {
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketName: {
    flex: 1,
    fontSize: 14,
  },
  ticketQuantity: {
    fontSize: 14,
    marginHorizontal: 12,
  },
  ticketPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  eventDetail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
  },
});