import React, { useState, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Divider, Input, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { 
  Event, 
  TicketSelection, 
  CustomRegistrationField, 
  RegistrationFormData, 
  DiscountValidationResponse 
} from '@jctop-event/shared-types';
import StepIndicator from '../../common/StepIndicator';
import DynamicFieldRenderer from './DynamicFieldRenderer';
import DiscountCodeInput from './DiscountCodeInput';
import registrationService from '../../../services/registrationService';
import { useAppTheme } from '@/theme';

interface RegistrationStepTwoProps {
  event: Event;
  ticketSelections: TicketSelection[];
  onNext: (formData: RegistrationFormData) => void;
  onBack: () => void;
  initialFormData?: Partial<RegistrationFormData>;
  isLoading?: boolean;
}

interface FieldErrors {
  [fieldId: string]: string;
}

const RegistrationStepTwo: React.FC<RegistrationStepTwoProps> = ({
  event,
  ticketSelections,
  onNext,
  onBack,
  initialFormData = {},
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const [customFields, setCustomFields] = useState<CustomRegistrationField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoadingFields, setIsLoadingFields] = useState(true);
  const [discountResult, setDiscountResult] = useState<DiscountValidationResponse | null>(null);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1200;

  const registrationSteps = [
    { title: t('registration.steps.ticketSelection'), description: t('registration.steps.ticketSelectionDesc') },
    { title: t('registration.steps.registration'), description: t('registration.steps.registrationDesc') },
    { title: t('registration.steps.payment'), description: t('registration.steps.paymentDesc') },
  ];

  // Calculate base total from ticket selections
  const baseTotal = ticketSelections.reduce((total, selection) => {
    // TODO: Get actual ticket prices from ticket types
    return total + (selection.quantity * 50); // Placeholder price
  }, 0);

  const finalTotal = discountResult?.valid ? discountResult.finalAmount : baseTotal;

  useEffect(() => {
    loadCustomFields();
  }, [event.id]);

  useEffect(() => {
    if (initialFormData.customFieldValues) {
      setFieldValues(initialFormData.customFieldValues);
    }
  }, [initialFormData]);

  const loadCustomFields = async () => {
    try {
      setIsLoadingFields(true);
      setLoadingError(null);
      const fields = await registrationService.getCustomFields(event.id);
      setCustomFields(fields);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('registration.errors.loadFieldsFailed');
      setLoadingError(errorMessage);
      Alert.alert(
        t('common.error'),
        errorMessage,
        [{ text: t('common.confirm'), style: 'default' }]
      );
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear field error when user starts typing
    if (fieldErrors[fieldId]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateField = (field: CustomRegistrationField, value: any): string | null => {
    // Required field validation
    if (field.required) {
      if (field.fieldType === 'checkbox') {
        if (!value) {
          return t('registration.formValidation.fieldRequired', { field: field.label });
        }
      } else {
        if (!value || (typeof value === 'string' && !value.trim())) {
          return t('registration.formValidation.fieldRequired', { field: field.label });
        }
      }
    }

    // Type-specific validation
    if (value && typeof value === 'string') {
      // Email validation
      if (field.fieldType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return t('registration.formValidation.emailInvalid');
        }
      }

      // Validation rules
      if (field.validationRules) {
        const { minLength, maxLength, pattern } = field.validationRules;

        if (minLength && value.length < minLength) {
          return t('registration.formValidation.minLength', { field: field.label, min: minLength });
        }

        if (maxLength && value.length > maxLength) {
          return t('registration.formValidation.maxLength', { field: field.label, max: maxLength });
        }

        if (pattern) {
          const regex = new RegExp(pattern);
          if (!regex.test(value)) {
            return t('registration.formValidation.invalidFormat', { field: field.label });
          }
        }
      }
    }

    return null;
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    customFields.forEach(field => {
      const value = fieldValues[field.id];
      const error = validateField(field, value);
      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  const handleNext = async () => {
    if (!validateForm()) {
      Alert.alert(
        t('registration.formValidation.errorTitle'),
        t('registration.formValidation.errorDescription'),
        [{ text: t('common.confirm'), style: 'default' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const formData: RegistrationFormData = {
        ticketSelections,
        customFieldValues: fieldValues,
        discountCode: appliedDiscountCode || undefined,
        totalAmount: finalTotal,
        discountAmount: discountResult?.valid ? discountResult.discountAmount : 0,
      };

      onNext(formData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('registration.errors.processingFailed');
      Alert.alert(
        t('common.error'),
        errorMessage,
        [{ text: t('common.confirm'), style: 'default' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDiscountApplied = (result: DiscountValidationResponse, code?: string) => {
    setDiscountResult(result);
    setAppliedDiscountCode(result.valid ? code || null : null);
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xl * 4,
    },
    loadingText: {
      ...typography.body,
      color: colors.midGrey,
      marginTop: spacing.md,
    },
    headerSection: {
      marginBottom: spacing.lg,
    },
    pageTitle: {
      ...typography.h1,
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    pageDescription: {
      ...typography.body,
      color: colors.midGrey,
    },
    sectionCard: {
      marginVertical: spacing.sm,
    },
    sectionTitle: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    fieldGrid: {
      flexDirection: isTablet ? 'row' : 'column',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.sm,
    },
    fieldColumn: {
      width: isTablet ? '50%' : '100%',
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.md,
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
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    summaryLabel: {
      ...typography.body,
      color: colors.text,
    },
    summaryValue: {
      ...typography.body,
      fontWeight: '600',
      color: colors.text,
    },
    discountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: spacing.sm,
    },
    discountLabel: {
      ...typography.body,
      color: colors.success,
    },
    discountValue: {
      ...typography.body,
      fontWeight: '600',
      color: colors.success,
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
    },
    retryButton: {
      marginTop: spacing.md,
    },
  });

  if (isLoadingFields) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>{t('registration.loadingForm')}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (loadingError) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <StepIndicator
            steps={registrationSteps}
            currentStep={1}
          />
          
          <Card containerStyle={styles.errorCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="alert-circle" type="material-community" size={24} color={colors.danger} />
              <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                <Text style={[styles.errorText, { fontWeight: '600', marginBottom: spacing.xs }]}>
                  {t('registration.errors.loadFormFailed')}
                </Text>
                <Text style={[styles.errorText, { fontSize: 14 }]}>
                  {loadingError}
                </Text>
                <Button
                  title={t('common.tryAgain')}
                  onPress={loadCustomFields}
                  type="outline"
                  buttonStyle={styles.retryButton}
                  titleStyle={{ color: colors.danger }}
                />
              </View>
            </View>
          </Card>

          <View style={styles.actionContainer}>
            <View style={styles.actionButtons}>
              <Button
                title={t('registration.backToTickets')}
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
                buttonStyle={styles.backButton}
                titleStyle={{ color: colors.midGrey }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Step Indicator */}
        <StepIndicator
          steps={registrationSteps}
          currentStep={1}
        />

        {/* Page Header */}
        <View style={styles.headerSection}>
          <Text style={styles.pageTitle}>{t('registration.registrationDetails')}</Text>
          <Text style={styles.pageDescription}>
            {t('registration.registrationDescription', { eventTitle: event.title })}
          </Text>
        </View>

        {/* Custom Fields Form */}
        {customFields.length > 0 && (
          <Card containerStyle={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('registration.requiredInformation')}</Text>
            
            <View style={styles.fieldGrid}>
              {customFields.map((field) => (
                <View key={field.id} style={styles.fieldColumn}>
                  <DynamicFieldRenderer
                    field={field}
                    value={fieldValues[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    error={fieldErrors[field.id]}
                    isDisabled={isLoading || isSubmitting}
                  />
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Discount Code Section */}
        <Card containerStyle={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('registration.discountCode')}</Text>
          
          <DiscountCodeInput
            eventId={event.id}
            totalAmount={baseTotal}
            onDiscountApplied={handleDiscountApplied}
            isDisabled={isLoading || isSubmitting}
          />
        </Card>

        {/* Order Summary */}
        <Card containerStyle={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('registration.orderSummary')}</Text>
          
          {ticketSelections.map((selection, index) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                {t('registration.ticketQuantity')} × {selection.quantity}
              </Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(selection.quantity * 50)}
              </Text>
            </View>
          ))}
          
          {discountResult?.valid && (
            <>
              <Divider style={{ marginVertical: spacing.sm }} />
              <View style={styles.discountRow}>
                <Text style={styles.discountLabel}>{t('registration.discount')}</Text>
                <Text style={styles.discountValue}>
                  -{formatCurrency(discountResult.discountAmount)}
                </Text>
              </View>
            </>
          )}
          
          <Divider style={{ marginVertical: spacing.sm }} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{t('registration.total')}</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(finalTotal)}
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <View style={styles.actionButtons}>
            <Button
              title={t('registration.backToTickets')}
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
              disabled={isLoading || isSubmitting}
              buttonStyle={styles.backButton}
              titleStyle={{ color: colors.midGrey }}
            />

            <Button
              title={t('registration.continueToPayment')}
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
              loading={isSubmitting}
              loadingProps={{ color: colors.white }}
              disabled={isLoading}
              buttonStyle={[styles.nextButton, { backgroundColor: colors.primary }]}
            />
          </View>
        </View>

        {/* Footer Notice */}
        <Card containerStyle={styles.footerCard}>
          <Text style={styles.footerText}>
            {t('registration.securityNotice')}
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

export default RegistrationStepTwo;