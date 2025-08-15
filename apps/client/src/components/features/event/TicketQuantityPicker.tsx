import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native';
import { Button, Icon, Text } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

interface TicketQuantityPickerProps {
  value: number;
  min?: number;
  max: number;
  onChange: (quantity: number) => void;
  isDisabled?: boolean;
}

const TicketQuantityPicker: React.FC<TicketQuantityPickerProps> = ({
  value,
  min = 0,
  max,
  onChange,
  isDisabled = false,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [inputValue, setInputValue] = useState(value.toString());

  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    if (value < max && !isDisabled) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min && !isDisabled) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);

    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  };

  const isDecrementDisabled = value <= min || isDisabled;
  const isIncrementDisabled = value >= max || isDisabled;

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    button: {
      width: 36,
      height: 36,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.white,
      padding: 0,
    },
    buttonDisabled: {
      backgroundColor: colors.lightGrey,
      borderColor: colors.border,
    },
    input: {
      width: 60,
      height: 36,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      textAlign: 'center',
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.white,
      paddingHorizontal: spacing.xs,
    },
    inputDisabled: {
      backgroundColor: colors.lightGrey,
      color: colors.midGrey,
    },
    soldOutText: {
      fontSize: 14,
      color: colors.danger,
      marginLeft: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <Button
        onPress={handleDecrement}
        disabled={isDecrementDisabled}
        buttonStyle={[
          styles.button,
          isDecrementDisabled && styles.buttonDisabled,
        ]}
        icon={
          <Icon
            name="minus"
            type="material-community"
            size={20}
            color={isDecrementDisabled ? colors.midGrey : colors.primary}
          />
        }
      />

      <TextInput
        value={inputValue}
        onChangeText={handleInputChange}
        onBlur={handleInputBlur}
        style={[
          styles.input,
          isDisabled && styles.inputDisabled,
        ]}
        editable={!isDisabled}
        keyboardType="numeric"
        accessibilityLabel={t('registration.ticketQuantity')}
      />

      <Button
        onPress={handleIncrement}
        disabled={isIncrementDisabled}
        buttonStyle={[
          styles.button,
          isIncrementDisabled && styles.buttonDisabled,
        ]}
        icon={
          <Icon
            name="plus"
            type="material-community"
            size={20}
            color={isIncrementDisabled ? colors.midGrey : colors.primary}
          />
        }
      />

      {max <= 0 && (
        <Text style={styles.soldOutText}>
          {t('registration.soldOut')}
        </Text>
      )}
    </View>
  );
};

export default TicketQuantityPicker;