import React from 'react';
import { Text, TextProps } from 'react-native';
import { useLocalization } from '../../localization/hooks/useLocalization';

interface FormattedCurrencyProps extends Omit<TextProps, 'children'> {
  amount: number;
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: boolean;
  compact?: boolean;
  formal?: boolean; // For invoice/check writing
}

/**
 * Component for displaying formatted currency in TWD
 */
export const FormattedCurrency: React.FC<FormattedCurrencyProps> = ({
  amount,
  showSymbol = true,
  showCode = false,
  decimals = false,
  compact = false,
  formal = false,
  style,
  ...textProps
}) => {
  const { formatCurrency } = useLocalization();
  
  const getFormattedAmount = () => {
    if (formal) {
      // Use Chinese numerals for formal documents
      const { toChineseNumerals } = require('../../localization/utils/currencyUtils');
      return toChineseNumerals(amount);
    }
    
    return formatCurrency(amount, {
      showSymbol,
      showCode,
      decimals,
      compact,
    });
  };

  return (
    <Text style={style} {...textProps}>
      {getFormattedAmount()}
    </Text>
  );
};

export default FormattedCurrency;