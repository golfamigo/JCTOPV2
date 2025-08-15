import React from 'react';
import { Text, TextProps } from 'react-native';
import { useLocalization } from '../../localization/hooks/useLocalization';

interface FormattedDateProps extends Omit<TextProps, 'children'> {
  value: Date | string;
  format?: 'short' | 'medium' | 'long' | 'datetime' | 'time' | 'relative';
  showTime?: boolean;
  showWeekday?: boolean;
  relative?: boolean;
}

/**
 * Component for displaying formatted dates according to Taiwan conventions
 */
export const FormattedDate: React.FC<FormattedDateProps> = ({
  value,
  format = 'medium',
  showTime = false,
  showWeekday = false,
  relative = false,
  style,
  ...textProps
}) => {
  const { formatDate, formatTime, formatRelative } = useLocalization();

  const getFormattedDate = () => {
    if (relative) {
      return formatRelative(value);
    }

    let formatted = formatDate(value, format === 'time' || format === 'relative' ? 'medium' : format as any);
    
    if (showTime && format !== 'datetime') {
      formatted += ` ${formatTime(value)}`;
    }
    
    if (showWeekday && format !== 'long') {
      const date = typeof value === 'string' ? new Date(value) : value;
      const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
      formatted += ` ${weekdays[date.getDay()]}`;
    }

    return formatted;
  };

  return (
    <Text style={style} {...textProps}>
      {getFormattedDate()}
    </Text>
  );
};

export default FormattedDate;