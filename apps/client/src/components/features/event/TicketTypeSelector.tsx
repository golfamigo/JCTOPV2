import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { Text, Card, Badge, Divider, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { TicketTypeWithAvailability, TicketSelection } from '@jctop-event/shared-types';
import TicketQuantityPicker from './TicketQuantityPicker';
import ticketService from '../../../services/ticketService';
import { useAppTheme } from '@/theme';

interface TicketTypeSelectorProps {
  eventId: string;
  onSelectionChange: (selections: TicketSelection[], totalPrice: number) => void;
  initialSelections?: TicketSelection[];
  isDisabled?: boolean;
}

const TicketTypeSelector: React.FC<TicketTypeSelectorProps> = ({
  eventId,
  onSelectionChange,
  initialSelections = [],
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const [ticketTypes, setTicketTypes] = useState<TicketTypeWithAvailability[]>([]);
  const [selections, setSelections] = useState<TicketSelection[]>(initialSelections);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientValidationErrors, setClientValidationErrors] = useState<string[]>([]);

  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;

  useEffect(() => {
    fetchTicketTypes();
  }, [eventId]);

  useEffect(() => {
    const totalPrice = ticketService.calculateTotalPrice(ticketTypes, selections);
    const validation = ticketService.validateSelectionClientSide(ticketTypes, selections);
    
    setClientValidationErrors(validation.errors);
    onSelectionChange(selections, totalPrice);
  }, [selections, ticketTypes, onSelectionChange]);

  const fetchTicketTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const types = await ticketService.getTicketTypesWithAvailability(eventId);
      setTicketTypes(types);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('registration.errors.loadTicketsFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    if (isDisabled) return;

    setSelections(prev => {
      const filtered = prev.filter(s => s.ticketTypeId !== ticketTypeId);
      if (quantity > 0) {
        return [...filtered, { ticketTypeId, quantity }];
      }
      return filtered;
    });
  };

  const getQuantityForTicketType = (ticketTypeId: string): number => {
    const selection = selections.find(s => s.ticketTypeId === ticketTypeId);
    return selection ? selection.quantity : 0;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalSelectedQuantity = (): number => {
    return selections.reduce((total, selection) => total + selection.quantity, 0);
  };

  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 2,
    },
    loadingText: {
      ...typography.body,
      color: colors.midGrey,
      marginTop: spacing.md,
    },
    errorContainer: {
      backgroundColor: colors.danger + '10',
      borderColor: colors.danger,
      borderWidth: 1,
      borderRadius: 8,
      padding: spacing.md,
    },
    errorTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.danger,
      marginBottom: spacing.xs,
    },
    errorDescription: {
      ...typography.small,
      color: colors.danger,
    },
    infoContainer: {
      backgroundColor: colors.primary + '10',
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: 8,
      padding: spacing.md,
    },
    infoTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    infoDescription: {
      ...typography.small,
      color: colors.primary,
    },
    header: {
      marginBottom: spacing.md,
    },
    headerTitle: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      ...typography.small,
      color: colors.midGrey,
    },
    validationErrorContainer: {
      backgroundColor: colors.danger + '10',
      borderColor: colors.danger,
      borderWidth: 1,
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    validationErrorTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.danger,
      marginBottom: spacing.sm,
    },
    validationErrorItem: {
      ...typography.small,
      color: colors.danger,
      marginBottom: spacing.xs,
    },
    ticketCard: {
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: spacing.md,
    },
    ticketCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '05',
    },
    ticketHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    ticketInfo: {
      flex: 1,
      marginRight: spacing.md,
    },
    ticketName: {
      ...typography.body,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    ticketPrice: {
      ...typography.h2,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    availabilityText: {
      ...typography.small,
      color: colors.success,
      marginBottom: spacing.xs,
    },
    soldText: {
      ...typography.small,
      color: colors.midGrey,
    },
    quantitySection: {
      alignItems: isTablet ? 'flex-end' : 'center',
    },
    subtotalText: {
      ...typography.small,
      color: colors.primary,
      fontWeight: '600',
      marginTop: spacing.xs,
    },
    summaryContainer: {
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      ...typography.body,
      fontWeight: '600',
      color: colors.primary,
    },
    summaryCount: {
      ...typography.small,
      color: colors.midGrey,
      marginTop: spacing.xs,
    },
    summaryTotal: {
      ...typography.h2,
      fontWeight: 'bold',
      color: colors.primary,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('registration.loadingTickets')}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="alert-circle" type="material-community" size={24} color={colors.danger} />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <Text style={styles.errorTitle}>{t('registration.errors.unableToLoadTickets')}</Text>
            <Text style={styles.errorDescription}>{error}</Text>
          </View>
        </View>
      </View>
    );
  }

  if (ticketTypes.length === 0) {
    return (
      <View style={styles.infoContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="information" type="material-community" size={24} color={colors.primary} />
          <View style={{ marginLeft: spacing.sm, flex: 1 }}>
            <Text style={styles.infoTitle}>{t('registration.noTicketsAvailable')}</Text>
            <Text style={styles.infoDescription}>{t('registration.noTicketsDescription')}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('registration.selectTickets')}</Text>
        <Text style={styles.headerSubtitle}>{t('registration.selectTicketsDescription')}</Text>
      </View>

      {clientValidationErrors.length > 0 && (
        <View style={styles.validationErrorContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Icon name="alert-circle" type="material-community" size={24} color={colors.danger} />
            <View style={{ marginLeft: spacing.sm, flex: 1 }}>
              <Text style={styles.validationErrorTitle}>{t('registration.errors.selectionError')}</Text>
              {clientValidationErrors.map((error, index) => (
                <Text key={index} style={styles.validationErrorItem}>• {error}</Text>
              ))}
            </View>
          </View>
        </View>
      )}

      {ticketTypes.map((ticketType) => {
        const selectedQuantity = getQuantityForTicketType(ticketType.id);
        const isAvailable = ticketType.availableQuantity > 0;
        const isSoldOut = ticketType.availableQuantity === 0;

        return (
          <View
            key={ticketType.id}
            style={[
              styles.ticketCard,
              selectedQuantity > 0 && styles.ticketCardSelected,
              (isDisabled || isSoldOut) && { opacity: 0.6 }
            ]}
          >
            <View style={styles.ticketHeader}>
              <View style={styles.ticketInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
                  <Text style={styles.ticketName}>{ticketType.name}</Text>
                  {isSoldOut && (
                    <Badge
                      value={t('registration.soldOut')}
                      status="error"
                      containerStyle={{ marginLeft: spacing.sm }}
                    />
                  )}
                  {!isSoldOut && ticketType.availableQuantity <= 10 && (
                    <Badge
                      value={t('registration.limitedAvailable', { count: ticketType.availableQuantity })}
                      status="warning"
                      containerStyle={{ marginLeft: spacing.sm }}
                    />
                  )}
                </View>

                <Text style={styles.ticketPrice}>{formatCurrency(ticketType.price)}</Text>

                <Text style={styles.availabilityText}>
                  {t('registration.availableTickets', { 
                    available: ticketType.availableQuantity, 
                    total: ticketType.totalQuantity 
                  })}
                </Text>
                {ticketType.soldQuantity > 0 && (
                  <Text style={styles.soldText}>
                    {t('registration.soldTickets', { count: ticketType.soldQuantity })}
                  </Text>
                )}
              </View>

              <View style={styles.quantitySection}>
                <TicketQuantityPicker
                  value={selectedQuantity}
                  max={Math.min(ticketType.availableQuantity, 10)}
                  onChange={(quantity) => handleQuantityChange(ticketType.id, quantity)}
                  isDisabled={isDisabled || isSoldOut}
                />
                
                {selectedQuantity > 0 && (
                  <Text style={styles.subtotalText}>
                    {formatCurrency(selectedQuantity * ticketType.price)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        );
      })}

      {getTotalSelectedQuantity() > 0 && (
        <>
          <Divider style={{ marginVertical: spacing.md }} />
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>{t('registration.totalSelected')}</Text>
                <Text style={styles.summaryCount}>
                  {t('registration.ticketsCount', { count: getTotalSelectedQuantity() })}
                </Text>
              </View>
              <Text style={styles.summaryTotal}>
                {formatCurrency(ticketService.calculateTotalPrice(ticketTypes, selections))}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default TicketTypeSelector;