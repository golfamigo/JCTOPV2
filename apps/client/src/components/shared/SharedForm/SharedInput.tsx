import React from 'react';
import { Input, InputProps } from '@rneui/themed';
import { useAppTheme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';

interface SharedInputProps extends InputProps {
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  leftIconName?: string;
  rightIconName?: string;
}

export const SharedInput: React.FC<SharedInputProps> = ({
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  leftIconName,
  rightIconName,
  inputContainerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  ...props
}) => {
  const { colors, typography } = useAppTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          input: { fontSize: 14, paddingVertical: 8 },
          label: { fontSize: 12 },
          icon: 20
        };
      case 'large':
        return {
          input: { fontSize: 18, paddingVertical: 14 },
          label: { fontSize: 16 },
          icon: 28
        };
      default: // medium
        return {
          input: { fontSize: 16, paddingVertical: 12 },
          label: { fontSize: 14 },
          icon: 24
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          container: {
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            borderRadius: 8
          }
        };
      case 'underlined':
        return {
          container: {
            borderBottomWidth: 2,
            borderColor: colors.border
          }
        };
      default: // outlined
        return {
          container: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12
          }
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <Input
      {...props}
      containerStyle={{ paddingHorizontal: 0, ...(fullWidth && { width: '100%' }) }}
      inputContainerStyle={[
        variantStyles.container,
        { borderColor: colors.border },
        inputContainerStyle
      ]}
      inputStyle={[
        {
          ...typography.body,
          color: colors.text
        },
        sizeStyles.input,
        inputStyle
      ]}
      labelStyle={[
        {
          color: colors.text,
          fontWeight: '600',
          marginBottom: 8
        },
        sizeStyles.label,
        labelStyle
      ]}
      errorStyle={[
        {
          color: colors.error,
          fontSize: 12,
          marginTop: 4
        },
        errorStyle
      ]}
      placeholderTextColor={colors.textSecondary}
      leftIcon={
        leftIconName ? (
          <MaterialIcons
            name={leftIconName as any}
            size={sizeStyles.icon}
            color={colors.midGrey}
          />
        ) : undefined
      }
      rightIcon={
        rightIconName ? (
          <MaterialIcons
            name={rightIconName as any}
            size={sizeStyles.icon}
            color={colors.midGrey}
          />
        ) : undefined
      }
    />
  );
};