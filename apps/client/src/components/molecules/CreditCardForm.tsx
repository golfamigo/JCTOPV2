import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Input, Card, Text } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

interface CreditCardFormProps {
  onCardDataChange: (cardData: CreditCardData) => void;
  disabled?: boolean;
}

interface CreditCardData {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  cardholderName: string;
  isValid: boolean;
  errors: {
    cardNumber?: string;
    expirationDate?: string;
    cvv?: string;
    cardholderName?: string;
  };
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({
  onCardDataChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  
  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    cardholderName: '',
    isValid: false,
    errors: {},
  });

  const formatCardNumber = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.substring(0, 16);
    const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1-');
    return formatted;
  };

  const formatExpirationDate = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.substring(0, 4);
    if (limited.length >= 2) {
      return `${limited.substring(0, 2)}/${limited.substring(2)}`;
    }
    return limited;
  };

  const formatCVV = (text: string): string => {
    const cleaned = text.replace(/\D/g, '');
    return cleaned.substring(0, 4);
  };

  const validateCardNumber = (cardNumber: string): string | undefined => {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (!cleaned) {
      return t('payment.cardNumberRequired');
    }
    if (cleaned.length < 13 || cleaned.length > 19) {
      return t('payment.invalidCardNumber');
    }
    
    // Simple Luhn algorithm check
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    
    if (sum % 10 !== 0) {
      return t('payment.invalidCardNumber');
    }
    return undefined;
  };

  const validateExpirationDate = (expirationDate: string): string | undefined => {
    const cleaned = expirationDate.replace(/\D/g, '');
    if (!cleaned) {
      return t('payment.expirationRequired');
    }
    if (cleaned.length !== 4) {
      return t('payment.invalidExpirationDate');
    }
    
    const month = parseInt(cleaned.substring(0, 2), 10);
    const year = parseInt(cleaned.substring(2), 10);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (month < 1 || month > 12) {
      return t('payment.invalidExpirationDate');
    }
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return t('payment.invalidExpirationDate');
    }
    
    return undefined;
  };

  const validateCVV = (cvv: string): string | undefined => {
    const cleaned = cvv.replace(/\D/g, '');
    if (!cleaned) {
      return t('payment.cvvRequired');
    }
    if (cleaned.length < 3 || cleaned.length > 4) {
      return t('payment.invalidCVV');
    }
    return undefined;
  };

  const validateCardholderName = (name: string): string | undefined => {
    if (!name.trim()) {
      return t('payment.nameRequired');
    }
    if (name.trim().length < 2) {
      return t('payment.nameRequired');
    }
    return undefined;
  };

  const updateCardData = (field: keyof CreditCardData, value: string) => {
    const newCardData = { ...cardData, [field]: value };
    
    // Validate all fields
    const errors: CreditCardData['errors'] = {};
    errors.cardNumber = validateCardNumber(newCardData.cardNumber);
    errors.expirationDate = validateExpirationDate(newCardData.expirationDate);
    errors.cvv = validateCVV(newCardData.cvv);
    errors.cardholderName = validateCardholderName(newCardData.cardholderName);
    
    newCardData.errors = errors;
    newCardData.isValid = !Object.values(errors).some(error => !!error);
    
    setCardData(newCardData);
    onCardDataChange(newCardData);
  };

  const handleCardNumberChange = useCallback((text: string) => {
    const formatted = formatCardNumber(text);
    updateCardData('cardNumber', formatted);
  }, []);

  const handleExpirationDateChange = useCallback((text: string) => {
    const formatted = formatExpirationDate(text);
    updateCardData('expirationDate', formatted);
  }, []);

  const handleCVVChange = useCallback((text: string) => {
    const formatted = formatCVV(text);
    updateCardData('cvv', formatted);
  }, []);

  const handleCardholderNameChange = useCallback((text: string) => {
    updateCardData('cardholderName', text);
  }, []);

  const styles = StyleSheet.create({
    container: {
      marginVertical: spacing.sm,
    },
    sectionTitle: {
      ...typography.h2,
      color: colors.primary,
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    flexItem: {
      flex: 1,
    },
    smallItem: {
      flex: 0.4,
    },
  });

  return (
    <Card containerStyle={styles.container}>
      <Text style={styles.sectionTitle}>{t('payment.creditCard')}</Text>
      
      <Input
        label={t('payment.cardNumber')}
        placeholder={t('payment.enterCardNumber')}
        value={cardData.cardNumber}
        onChangeText={handleCardNumberChange}
        keyboardType="numeric"
        maxLength={19} // 16 digits + 3 dashes
        errorMessage={cardData.errors.cardNumber}
        disabled={disabled}
        leftIcon={{
          name: 'credit-card',
          type: 'material-community',
          size: 20,
          color: colors.midGrey,
        }}
      />
      
      <View style={styles.row}>
        <View style={styles.flexItem}>
          <Input
            label={t('payment.expirationDate')}
            placeholder={t('payment.enterExpirationDate')}
            value={cardData.expirationDate}
            onChangeText={handleExpirationDateChange}
            keyboardType="numeric"
            maxLength={5} // MM/YY
            errorMessage={cardData.errors.expirationDate}
            disabled={disabled}
            leftIcon={{
              name: 'calendar',
              type: 'material-community',
              size: 20,
              color: colors.midGrey,
            }}
          />
        </View>
        <View style={styles.smallItem}>
          <Input
            label={t('payment.cvv')}
            placeholder={t('payment.enterCVV')}
            value={cardData.cvv}
            onChangeText={handleCVVChange}
            keyboardType="numeric"
            maxLength={4}
            errorMessage={cardData.errors.cvv}
            disabled={disabled}
            secureTextEntry
            leftIcon={{
              name: 'shield-check',
              type: 'material-community',
              size: 20,
              color: colors.midGrey,
            }}
          />
        </View>
      </View>
      
      <Input
        label={t('payment.cardholderName')}
        placeholder={t('payment.enterCardholderName')}
        value={cardData.cardholderName}
        onChangeText={handleCardholderNameChange}
        errorMessage={cardData.errors.cardholderName}
        disabled={disabled}
        leftIcon={{
          name: 'account',
          type: 'material-community',
          size: 20,
          color: colors.midGrey,
        }}
      />
    </Card>
  );
};

export default CreditCardForm;
export type { CreditCardData };