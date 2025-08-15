import React from 'react';
import { View } from 'react-native';
import { CheckBox, CheckBoxProps, Text } from '@rneui/themed';
import { useAppTheme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface SharedCheckboxProps extends Omit<CheckBoxProps, 'checkedIcon' | 'uncheckedIcon' | 'size'> {
  label?: string;
  error?: string;
  size?: 'small' | 'medium' | 'large';
}

interface SharedCheckboxGroupProps {
  label?: string;
  options: Array<{
    label: string;
    value: string | number;
    disabled?: boolean;
  }>;
  values?: Array<string | number>;
  onChange?: (values: Array<string | number>) => void;
  error?: string;
  layout?: 'vertical' | 'horizontal';
}

export const SharedCheckbox: React.FC<SharedCheckboxProps> = ({
  label,
  error,
  size = 'medium',
  textStyle,
  containerStyle,
  children,
  ...props
}) => {
  const { colors, typography } = useAppTheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 24;
    }
  };

  const iconSize = getSize();

  return (
    <View>
      <CheckBox
        {...props}
        title={label || children as any}
        size={iconSize}
        checkedIcon={
          <MaterialIcons
            name="check-box"
            size={iconSize}
            color={colors.primary}
          />
        }
        uncheckedIcon={
          <MaterialIcons
            name="check-box-outline-blank"
            size={iconSize}
            color={colors.midGrey}
          />
        }
        textStyle={[
          typography.body,
          { color: colors.text, marginLeft: 8 },
          textStyle
        ]}
        containerStyle={[
          {
            backgroundColor: 'transparent',
            borderWidth: 0,
            padding: 0,
            margin: 0
          },
          containerStyle
        ]}
      />
      {error && (
        <Text style={{
          color: colors.error,
          fontSize: 12,
          marginTop: 4,
          marginLeft: iconSize + 8
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export const SharedCheckboxGroup: React.FC<SharedCheckboxGroupProps> = ({
  label,
  options,
  values = [],
  onChange,
  error,
  layout = 'vertical'
}) => {
  const { colors, typography } = useAppTheme();

  const handleToggle = (value: string | number) => {
    const newValues = values.includes(value)
      ? values.filter(v => v !== value)
      : [...values, value];
    onChange?.(newValues);
  };

  return (
    <View>
      {label && (
        <Text style={[
          typography.body,
          { 
            color: colors.text, 
            fontWeight: '600', 
            marginBottom: 8,
            fontSize: 14
          }
        ]}>
          {label}
        </Text>
      )}
      
      <View style={{
        flexDirection: layout === 'horizontal' ? 'row' : 'column',
        flexWrap: layout === 'horizontal' ? 'wrap' : 'nowrap',
        gap: layout === 'horizontal' ? 16 : 8
      }}>
        {options.map((option) => (
          <SharedCheckbox
            key={option.value}
            title={option.label}
            checked={values.includes(option.value)}
            onPress={() => handleToggle(option.value)}
            disabled={option.disabled}
            containerStyle={{
              ...(layout === 'horizontal' && { marginRight: 16 })
            }}
          />
        ))}
      </View>

      {error && (
        <Text style={{
          color: colors.error,
          fontSize: 12,
          marginTop: 8
        }}>
          {error}
        </Text>
      )}
    </View>
  );
};