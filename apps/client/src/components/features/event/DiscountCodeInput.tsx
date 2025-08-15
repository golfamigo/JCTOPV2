import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Input, Button, Text, Icon, Card } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import registrationService from '../../../services/registrationService';
import { DiscountValidationResponse } from '@jctop-event/shared-types';

interface DiscountCodeInputProps {
  eventId: string;
  totalAmount: number;
  onDiscountApplied: (discount: DiscountValidationResponse, code?: string) => void;
  isDisabled?: boolean;
}

const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({
  eventId,
  totalAmount,
  onDiscountApplied,
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<DiscountValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAppliedDiscount, setHasAppliedDiscount] = useState(false);

  useEffect(() => {
    // Reset validation when total amount changes
    if (hasAppliedDiscount && validationResult) {
      handleValidateCode();
    }
  }, [totalAmount]);

  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError(t('registration.discountCodePlaceholder'));
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await registrationService.validateDiscountCode(eventId, code.trim(), totalAmount);
      setValidationResult(result);
      
      if (result.valid) {
        setHasAppliedDiscount(true);
        onDiscountApplied(result, code.trim());
      } else {
        setHasAppliedDiscount(false);
        setError(result.errorMessage || t('registration.invalidDiscountCode'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('registration.errors.discountValidationFailed');
      setError(errorMessage);
      setValidationResult(null);
      setHasAppliedDiscount(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveDiscount = () => {
    setCode('');
    setValidationResult(null);
    setError(null);
    setHasAppliedDiscount(false);
    onDiscountApplied({
      valid: false,
      discountAmount: 0,
      finalAmount: totalAmount,
    });
  };

  const handleSubmitEditing = () => {
    if (!isValidating && code.trim()) {
      handleValidateCode();
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

  const styles = StyleSheet.create({
    container: {
      marginVertical: spacing.sm,
    },
    label: {
      ...typography.body,
      fontWeight: '600',
      color: colors.midGrey,
      marginBottom: spacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    inputContainer: {
      flex: 1,
    },
    input: {
      ...typography.body,
      textTransform: 'uppercase',
    },
    applyButton: {
      minWidth: 100,
      backgroundColor: colors.primary,
    },
    removeButton: {
      minWidth: 100,
      borderColor: colors.danger,
    },
    errorText: {
      ...typography.small,
      color: colors.danger,
      marginTop: spacing.xs,
    },
    successCard: {
      backgroundColor: colors.success + '10',
      borderColor: colors.success,
      borderWidth: 1,
      marginTop: spacing.sm,
    },
    successContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    successText: {
      flex: 1,
    },
    successTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.success,
      marginBottom: spacing.xs,
    },
    successDetails: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    successDetailText: {
      ...typography.small,
      color: colors.midGrey,
    },
    successAmount: {
      fontWeight: '600',
      color: colors.success,
    },
    totalAmount: {
      fontWeight: 'bold',
      color: colors.primary,
    },
    validatingCard: {
      backgroundColor: colors.lightGrey,
      marginTop: spacing.sm,
      padding: spacing.md,
    },
    validatingContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    validatingText: {
      ...typography.small,
      color: colors.midGrey,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {t('registration.discountCode')} ({t('common.optional')})
      </Text>
      
      <View style={styles.inputRow}>
        <Input
          placeholder={t('registration.discountCodePlaceholder')}
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          onSubmitEditing={handleSubmitEditing}
          disabled={isDisabled || isValidating}
          autoCapitalize="characters"
          containerStyle={styles.inputContainer}
          inputStyle={styles.input}
          errorMessage={error || undefined}
          errorStyle={styles.errorText}
          rightIcon={
            hasAppliedDiscount ? (
              <Icon
                name="check-circle"
                type="material-community"
                size={20}
                color={colors.success}
              />
            ) : undefined
          }
        />
        
        {!hasAppliedDiscount ? (
          <Button
            title={t('registration.applyDiscount')}
            onPress={handleValidateCode}
            loading={isValidating}
            loadingProps={{ color: colors.white }}
            disabled={isDisabled || !code.trim() || isValidating}
            buttonStyle={styles.applyButton}
            titleStyle={{ color: colors.white }}
          />
        ) : (
          <Button
            title={t('common.remove')}
            onPress={handleRemoveDiscount}
            disabled={isDisabled}
            type="outline"
            buttonStyle={styles.removeButton}
            titleStyle={{ color: colors.danger }}
            icon={
              <Icon
                name="close"
                type="material-community"
                size={16}
                color={colors.danger}
                style={{ marginRight: spacing.xs }}
              />
            }
          />
        )}
      </View>

      {/* Success Message */}
      {validationResult?.valid && (
        <Card containerStyle={styles.successCard}>
          <View style={styles.successContent}>
            <View style={styles.successText}>
              <Text style={styles.successTitle}>
                {t('registration.discountApplied')}
              </Text>
              <View style={styles.successDetails}>
                <Text style={styles.successDetailText}>
                  {t('registration.discount')}: 
                  <Text style={styles.successAmount}>
                    -{formatCurrency(validationResult.discountAmount)}
                  </Text>
                </Text>
                <Text style={styles.successDetailText}>
                  {t('registration.total')}: 
                  <Text style={styles.totalAmount}>
                    {formatCurrency(validationResult.finalAmount)}
                  </Text>
                </Text>
              </View>
            </View>
            <Icon
              name="check-circle"
              type="material-community"
              size={24}
              color={colors.success}
            />
          </View>
        </Card>
      )}

      {/* Validation Feedback */}
      {isValidating && (
        <Card containerStyle={styles.validatingCard}>
          <View style={styles.validatingContent}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.validatingText}>
              {t('registration.validatingDiscountCode')}
            </Text>
          </View>
        </Card>
      )}
    </View>
  );
};

export default DiscountCodeInput;