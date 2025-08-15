import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert, Dimensions } from 'react-native';
import { Card, Text, Button, Divider, Badge, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { Event, TicketSelection } from '@jctop-event/shared-types';
import StepIndicator from '../../common/StepIndicator';
import TicketTypeSelector from './TicketTypeSelector';
import ticketService from '../../../services/ticketService';
import { useAppTheme } from '@/theme';

interface RegistrationStepOneProps {
  event: Event;
  onNext: (selections: TicketSelection[]) => void;
  onCancel: () => void;
  initialSelections?: TicketSelection[];
  isLoading?: boolean;
}

const RegistrationStepOne: React.FC<RegistrationStepOneProps> = ({
  event,
  onNext,
  onCancel,
  initialSelections = [],
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const [selections, setSelections] = useState<TicketSelection[]>(initialSelections);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1200;

  const registrationSteps = [
    { title: t('registration.steps.ticketSelection'), description: t('registration.steps.ticketSelectionDesc') },
    { title: t('registration.steps.registration'), description: t('registration.steps.registrationDesc') },
    { title: t('registration.steps.payment'), description: t('registration.steps.paymentDesc') },
  ];

  useEffect(() => {
    setSelections(initialSelections);
  }, [initialSelections]);

  const handleSelectionChange = (newSelections: TicketSelection[], newTotalPrice: number) => {
    setSelections(newSelections);
    setTotalPrice(newTotalPrice);
    setValidationError(null);
  };

  const handleNext = async () => {
    if (selections.length === 0) {
      setValidationError(t('registration.validation.selectTickets'));
      return;
    }

    if (totalPrice <= 0) {
      setValidationError(t('registration.validation.invalidSelection'));
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const validation = await ticketService.validateTicketSelection(event.id, selections);
      
      if (!validation.valid) {
        const errorMessages = validation.errors?.map(error => error.message).join(', ') || t('registration.validation.invalidTicketSelection');
        setValidationError(errorMessages);
        Alert.alert(
          t('registration.validation.selectionInvalid'),
          errorMessages,
          [{ text: t('common.confirm'), style: 'default' }]
        );
        return;
      }

      onNext(selections);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('registration.validation.validationFailed');
      setValidationError(errorMessage);
      Alert.alert(
        t('registration.validation.validationError'),
        errorMessage,
        [{ text: t('common.confirm'), style: 'default' }]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const hasSelections = selections.length > 0;
  const totalQuantity = selections.reduce((sum, selection) => sum + selection.quantity, 0);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('zh-TW', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
      maxWidth: isDesktop ? 1200 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    eventCard: {
      marginVertical: spacing.sm,
    },
    eventTitle: {
      ...typography.h1,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    eventInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    eventInfoLabel: {
      ...typography.body,
      fontWeight: '600',
      color: colors.midGrey,
      marginRight: spacing.sm,
    },
    eventInfoText: {
      ...typography.body,
      color: colors.text,
      flex: 1,
    },
    eventDescription: {
      ...typography.body,
      color: colors.midGrey,
      marginTop: spacing.sm,
    },
    errorCard: {
      backgroundColor: colors.danger + '10',
      borderColor: colors.danger,
      borderWidth: 1,
      marginVertical: spacing.sm,
    },
    errorText: {
      ...typography.body,
      color: colors.danger,
    },
    actionContainer: {
      marginTop: spacing.lg,
    },
    actionButtons: {
      flexDirection: isTablet ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: isTablet ? 'center' : 'stretch',
      gap: spacing.md,
    },
    backButton: {
      flex: isTablet ? 0 : 1,
      minWidth: isTablet ? 150 : '100%',
    },
    nextSection: {
      flexDirection: isTablet ? 'row' : 'column-reverse',
      alignItems: isTablet ? 'center' : 'stretch',
      gap: spacing.md,
    },
    summarySection: {
      alignItems: isTablet ? 'flex-end' : 'center',
    },
    ticketCount: {
      ...typography.small,
      color: colors.midGrey,
      marginBottom: spacing.xs,
    },
    totalPrice: {
      ...typography.h2,
      color: colors.primary,
      fontWeight: 'bold',
    },
    nextButton: {
      flex: isTablet ? 0 : 1,
      minWidth: isTablet ? 200 : '100%',
    },
    footerCard: {
      backgroundColor: colors.lightGrey,
      marginTop: spacing.lg,
      padding: spacing.md,
    },
    footerText: {
      ...typography.small,
      color: colors.midGrey,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Step Indicator */}
        <StepIndicator
          steps={registrationSteps}
          currentStep={0}
        />

        {/* Event Information Card */}
        <Card containerStyle={styles.eventCard}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          
          <View style={styles.eventInfoRow}>
            <Icon name="calendar" type="material-community" size={20} color={colors.midGrey} />
            <Text style={styles.eventInfoLabel}>{t('events.eventDate')}:</Text>
            <Text style={styles.eventInfoText}>{formatDate(event.startDate)}</Text>
          </View>

          <View style={styles.eventInfoRow}>
            <Icon name="clock-outline" type="material-community" size={20} color={colors.midGrey} />
            <Text style={styles.eventInfoLabel}>{t('events.eventTime')}:</Text>
            <Text style={styles.eventInfoText}>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </Text>
          </View>

          <View style={styles.eventInfoRow}>
            <Icon name="map-marker" type="material-community" size={20} color={colors.midGrey} />
            <Text style={styles.eventInfoLabel}>{t('events.eventLocation')}:</Text>
            <Text style={styles.eventInfoText}>{event.location}</Text>
          </View>

          {event.description && (
            <>
              <Divider style={{ marginVertical: spacing.md }} />
              <Text style={styles.eventDescription}>{event.description}</Text>
            </>
          )}
        </Card>

        {/* Validation Error */}
        {validationError && (
          <Card containerStyle={styles.errorCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="alert-circle" type="material-community" size={24} color={colors.danger} />
              <Text style={[styles.errorText, { marginLeft: spacing.sm, flex: 1 }]}>
                {validationError}
              </Text>
            </View>
          </Card>
        )}

        {/* Ticket Selection */}
        <Card containerStyle={{ marginVertical: spacing.sm }}>
          <TicketTypeSelector
            eventId={event.id}
            onSelectionChange={handleSelectionChange}
            initialSelections={initialSelections}
            isDisabled={isLoading || isValidating}
          />
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <View style={styles.actionButtons}>
            <Button
              title={t('registration.backToEvent')}
              type="outline"
              icon={
                <Icon
                  name="arrow-left"
                  type="material-community"
                  size={20}
                  color={colors.midGrey}
                  style={{ marginRight: spacing.xs }}
                />
              }
              onPress={onCancel}
              disabled={isLoading || isValidating}
              buttonStyle={styles.backButton}
              titleStyle={{ color: colors.midGrey }}
            />

            <View style={styles.nextSection}>
              {hasSelections && (
                <View style={styles.summarySection}>
                  <Text style={styles.ticketCount}>
                    {t('registration.ticketsSelected', { count: totalQuantity })}
                  </Text>
                  <Text style={styles.totalPrice}>
                    {t('registration.total')}: {formatCurrency(totalPrice)}
                  </Text>
                </View>
              )}

              <Button
                title={t('registration.continueToRegistration')}
                icon={
                  <Icon
                    name="arrow-right"
                    type="material-community"
                    size={20}
                    color={colors.white}
                    style={{ marginLeft: spacing.xs }}
                  />
                }
                iconPosition="right"
                onPress={handleNext}
                loading={isValidating}
                loadingProps={{ color: colors.white }}
                disabled={!hasSelections || isLoading}
                buttonStyle={[styles.nextButton, { backgroundColor: colors.primary }]}
              />
            </View>
          </View>
        </View>

        {/* Footer Information */}
        {hasSelections && (
          <Card containerStyle={styles.footerCard}>
            <Text style={styles.footerText}>
              {t('registration.reservationNotice')}
            </Text>
            <Text style={styles.footerText}>
              {t('registration.priceIncludes')}
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
};

export default RegistrationStepOne;