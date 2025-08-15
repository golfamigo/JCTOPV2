import React from 'react';
import { Text, TextProps, View, StyleSheet } from 'react-native';
import { Icon } from '@rneui/themed';
import { useLocalization } from '../../localization/hooks/useLocalization';
import { getPhoneTypeLabel } from '../../localization/utils/phoneUtils';

interface FormattedPhoneProps extends Omit<TextProps, 'children'> {
  phone: string;
  international?: boolean;
  showType?: boolean;
  showIcon?: boolean;
}

/**
 * Component for displaying formatted Taiwan phone numbers
 */
export const FormattedPhone: React.FC<FormattedPhoneProps> = ({
  phone,
  international = false,
  showType = false,
  showIcon = false,
  style,
  ...textProps
}) => {
  const { formatPhone } = useLocalization();
  
  const formatted = formatPhone(phone, international);
  const phoneType = showType ? getPhoneTypeLabel(phone) : null;
  
  if (showIcon || showType) {
    return (
      <View style={styles.container}>
        {showIcon && (
          <Icon
            name="phone"
            type="feather"
            size={16}
            color="#666"
            style={styles.icon}
          />
        )}
        <Text style={style} {...textProps}>
          {formatted}
        </Text>
        {showType && phoneType && (
          <Text style={[style, styles.typeLabel]} {...textProps}>
            ({phoneType})
          </Text>
        )}
      </View>
    );
  }

  return (
    <Text style={style} {...textProps}>
      {formatted}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 4,
  },
  typeLabel: {
    marginLeft: 4,
    opacity: 0.7,
    fontSize: 12,
  },
});

export default FormattedPhone;