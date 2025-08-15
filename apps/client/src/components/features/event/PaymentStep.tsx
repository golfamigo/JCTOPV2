import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { Card, Text, Button, Divider, ListItem, Icon, Badge } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { Event, RegistrationFormData, PaymentResponse } from '@jctop-event/shared-types';
import StepIndicator from '../../common/StepIndicator';
import CreditCardForm, { CreditCardData } from '../../molecules/CreditCardForm';
import PaymentSkeleton from '../../atoms/PaymentSkeleton';
import paymentService from '../../../services/paymentService';
import { useAppTheme } from '@/theme';
import * as Linking from 'expo-linking';

interface PaymentStepProps {
  event: Event;
  formData: RegistrationFormData;
  onSuccess: (paymentResponse: PaymentResponse) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  event,
  formData,
  onSuccess,
  onBack,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods] = useState(paymentService.getECPayPaymentMethods());
  const [creditCardData, setCreditCardData] = useState<CreditCardData | null>(null);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1200;

  const registrationSteps = [
    { title: t('registration.steps.ticketSelection'), description: t('registration.steps.ticketSelectionDesc') },
    { title: t('registration.steps.registration'), description: t('registration.steps.registrationDesc') },
    { title: t('registration.steps.payment'), description: t('registration.steps.paymentDesc') },
  ];

  const handlePaymentInitiation = async () => {
    if (isProcessing || isLoading) return;

    // Validate credit card if credit card payment method selected
    if (selectedPaymentMethod === 'Credit') {
      if (!creditCardData || !creditCardData.isValid) {
        setError(t('payment.invalidCardNumber'));
        return;
      }
    }

    setIsProcessing(true);
    setShowSkeleton(true);
    setError(null);

    try {
      // Validate payment amount
      const validation = paymentService.validateAmount(formData.totalAmount);
      if (!validation.valid) {
        setError(validation.message || t('payment.validationFailed'));
        return;
      }

      // Initiate event payment
      const paymentResponse = await paymentService.initiateEventPayment(event.id, {
        amount: formData.totalAmount,
        description: `${event.title} - ${t('events.registerForEvent')}`,
        paymentMethod: selectedPaymentMethod,
        metadata: {
          eventId: event.id,
          eventTitle: event.title,
          ticketSelections: formData.ticketSelections,
          customFieldValues: formData.customFieldValues,
          discountCode: formData.discountCode,
          discountAmount: formData.discountAmount,
        }
      });

      // Handle successful payment initiation
      if ((paymentResponse as any).status === 'requires_action' && paymentResponse.redirectUrl) {
        // For ECPay, redirect to payment page
        // In React Native, we use Linking to open the URL
        const supported = await Linking.canOpenURL(paymentResponse.redirectUrl);
        if (supported) {
          await Linking.openURL(paymentResponse.redirectUrl);
        } else {
          Alert.alert(
            t('payment.paymentFailed'),
            t('payment.cannotOpenPaymentUrl'),
            [{ text: t('common.confirm'), style: 'default' }]
          );
        }
      } else {
        onSuccess(paymentResponse);
      }

    } catch (err: any) {
      console.error('Payment initiation failed:', err);
      const errorMessage = err.message || t('payment.paymentFailed');
      setError(errorMessage);
      
      Alert.alert(
        t('payment.paymentFailed'),
        errorMessage,
        [{ text: t('common.confirm'), style: 'default' }]
      );
    } finally {
      setIsProcessing(false);
      setShowSkeleton(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Credit':
        return { name: 'credit-card', type: 'material-community' };
      case 'ATM':
        return { name: 'bank', type: 'material-community' };
      case 'CVS':
      case 'BARCODE':
        return { name: 'barcode-scan', type: 'material-community' };
      case 'ApplePay':
        return { name: 'apple', type: 'material-community' };
      case 'GooglePay':
        return { name: 'google', type: 'material-community' };
      default:
        return { name: 'wallet', type: 'material-community' };
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Credit':
        return colors.primary;
      case 'ATM':
        return colors.success;
      case 'CVS':
      case 'BARCODE':
        return colors.warning;
      case 'ApplePay':
        return colors.midGrey;
      case 'GooglePay':
        return colors.danger;
      default:
        return colors.primary;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreditCardDataChange = (cardData: CreditCardData) => {
    setCreditCardData(cardData);
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
    pageTitle: {
      ...typography.h1,
      color: colors.primary,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    gridContainer: {
      flexDirection: isTablet ? 'row' : 'column',
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    gridColumn: {
      flex: isTablet ? 1 : undefined,
    },
    sectionCard: {
      marginVertical: spacing.sm,
    },
    sectionTitle: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: spacing.xs,
    },
    summaryLabel: {
      ...typography.body,
      color: colors.text,
    },
    summaryValue: {
      ...typography.body,
      color: colors.text,
      fontWeight: '500',
    },
    discountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: spacing.xs,
    },
    discountLabel: {
      ...typography.body,
      color: colors.success,
    },
    discountValue: {
      ...typography.body,
      color: colors.success,
      fontWeight: '500',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
    },
    totalLabel: {
      ...typography.h2,
      color: colors.primary,
      fontWeight: 'bold',
    },
    totalValue: {
      ...typography.h2,
      color: colors.primary,
      fontWeight: 'bold',
    },
    paymentMethodItem: {
      backgroundColor: colors.white,
      borderRadius: 8,
      marginBottom: spacing.sm,
    },
    selectedPaymentMethod: {
      backgroundColor: colors.primary + '10',
      borderColor: colors.primary,
      borderWidth: 2,
    },
    paymentMethodContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    paymentMethodText: {
      ...typography.body,
      flex: 1,
      marginLeft: spacing.md,
      color: colors.text,
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: 4,
    },
    badgeText: {
      ...typography.small,
      color: colors.white,
      fontWeight: '600',
    },
    errorCard: {
      backgroundColor: colors.danger + '10',
      borderColor: colors.danger,
      borderWidth: 1,
      marginTop: spacing.md,
    },
    errorText: {
      ...typography.body,
      color: colors.danger,
    },
    securityCard: {
      backgroundColor: colors.primary + '10',
      borderColor: colors.primary,
      borderLeftWidth: 4,
      marginTop: spacing.md,
    },
    securityContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    securityText: {
      ...typography.small,
      color: colors.primary,
      marginLeft: spacing.sm,
      flex: 1,
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
    payButton: {
      flex: isTablet ? 0 : 1,
      minWidth: isTablet ? 200 : '100%',
      backgroundColor: colors.primary,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <StepIndicator
          steps={registrationSteps}
          currentStep={2}
        />

        <Text style={styles.pageTitle}>{t('payment.paymentConfirmation')}</Text>

        <View style={styles.gridContainer}>
          {/* Payment Summary */}
          <View style={styles.gridColumn}>
            <Card containerStyle={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t('payment.paymentSummary')}</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('events.eventName')}:</Text>
                <Text style={styles.summaryValue}>{event.title}</Text>
              </View>
              
              <Divider style={{ marginVertical: spacing.sm }} />
              
              {/* Ticket Summary */}
              {formData.ticketSelections.map((selection, index) => (
                <View key={index} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {t('registration.ticketQuantity')} × {selection.quantity}
                  </Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(
                      (formData.totalAmount - (formData.discountAmount || 0)) / 
                      formData.ticketSelections.reduce((sum, s) => sum + s.quantity, 0) * 
                      selection.quantity
                    )}
                  </Text>
                </View>
              ))}
              
              <Divider style={{ marginVertical: spacing.sm }} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('registration.subtotal')}:</Text>
                <Text style={styles.summaryValue}>{formatCurrency(formData.totalAmount)}</Text>
              </View>
              
              {formData.discountAmount && formData.discountAmount > 0 && (
                <View style={styles.discountRow}>
                  <Text style={styles.discountLabel}>{t('registration.discount')}:</Text>
                  <Text style={styles.discountValue}>
                    -{formatCurrency(formData.discountAmount)}
                  </Text>
                </View>
              )}
              
              <Divider style={{ marginVertical: spacing.sm }} />
              
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{t('registration.total')}:</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(formData.totalAmount - (formData.discountAmount || 0))}
                </Text>
              </View>
            </Card>
          </View>

          {/* Payment Method Selection */}
          <View style={styles.gridColumn}>
            <Card containerStyle={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t('registration.selectPaymentMethod')}</Text>
              
              {paymentMethods.map((method) => {
                const iconInfo = getPaymentMethodIcon(method.code);
                const isSelected = selectedPaymentMethod === method.code;
                
                return (
                  <ListItem
                    key={method.code}
                    containerStyle={[
                      styles.paymentMethodItem,
                      isSelected && styles.selectedPaymentMethod,
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.code)}
                  >
                    <Icon
                      name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                      type="material-community"
                      size={24}
                      color={isSelected ? colors.primary : colors.midGrey}
                    />
                    <Icon
                      name={iconInfo.name}
                      type={iconInfo.type}
                      size={20}
                      color={colors.midGrey}
                    />
                    <ListItem.Content>
                      <ListItem.Title style={styles.paymentMethodText}>
                        {method.name}
                      </ListItem.Title>
                    </ListItem.Content>
                    <View style={[styles.badge, { backgroundColor: getPaymentMethodColor(method.code) }]}>
                      <Text style={styles.badgeText}>{method.code}</Text>
                    </View>
                  </ListItem>
                );
              })}
            </Card>
          </View>
        </View>

        {/* Credit Card Form - Show only when Credit is selected */}
        {selectedPaymentMethod === 'Credit' && !showSkeleton && (
          <CreditCardForm 
            onCardDataChange={handleCreditCardDataChange}
            disabled={isProcessing || isLoading}
          />
        )}

        {/* Skeleton Loading */}
        {showSkeleton && (
          <>
            <PaymentSkeleton variant="form" />
            <PaymentSkeleton variant="methods" />
          </>
        )}

        {/* Error Alert */}
        {error && (
          <Card containerStyle={styles.errorCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="alert-circle" type="material-community" size={24} color={colors.danger} />
              <Text style={[styles.errorText, { marginLeft: spacing.sm, flex: 1 }]}>
                {error}
              </Text>
            </View>
          </Card>
        )}

        {/* Payment Security Notice */}
        <Card containerStyle={styles.securityCard}>
          <View style={styles.securityContent}>
            <Icon name="shield-check" type="material-community" size={20} color={colors.primary} />
            <Text style={styles.securityText}>
              {t('payment.securityNotice')}
            </Text>
          </View>
        </Card>

        {/* Navigation Buttons */}
        <View style={styles.actionContainer}>
          <View style={styles.actionButtons}>
            <Button
              title={t('common.back')}
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
              onPress={onBack}
              disabled={isProcessing || isLoading}
              buttonStyle={styles.backButton}
              titleStyle={{ color: colors.midGrey }}
            />

            <Button
              title={isProcessing ? t('payment.processingPayment') : t('payment.proceedToPayment')}
              icon={
                isProcessing ? undefined : (
                  <Icon
                    name="credit-card"
                    type="material-community"
                    size={20}
                    color={colors.white}
                    style={{ marginLeft: spacing.xs }}
                  />
                )
              }
              iconPosition="right"
              onPress={handlePaymentInitiation}
              loading={isProcessing || isLoading}
              loadingProps={{ color: colors.white }}
              disabled={isLoading}
              buttonStyle={styles.payButton}
              titleStyle={{ color: colors.white }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default PaymentStep;