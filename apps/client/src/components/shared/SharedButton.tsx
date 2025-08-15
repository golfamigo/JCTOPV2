import React from 'react';
import { Button, ButtonProps } from '@rneui/themed';
import { useAppTheme } from '@/theme';
import { getTouchTargetSize } from '../../utils/responsive';
import { ActivityIndicator } from 'react-native';

export type SharedButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type SharedButtonSize = 'small' | 'medium' | 'large';

interface SharedButtonProps extends Omit<ButtonProps, 'size'> {
  variant?: SharedButtonVariant;
  size?: SharedButtonSize;
  fullWidth?: boolean;
}

export const SharedButton: React.FC<SharedButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading,
  disabled,
  buttonStyle,
  titleStyle,
  disabledStyle,
  disabledTitleStyle,
  ...props
}) => {
  const { colors, typography } = useAppTheme();

  const getSizeStyles = () => {
    const minTouchTarget = getTouchTargetSize();
    
    switch (size) {
      case 'small':
        return {
          button: { 
            paddingVertical: 8, 
            paddingHorizontal: 16, 
            minHeight: minTouchTarget, // Ensure minimum touch target
            minWidth: minTouchTarget
          },
          title: { fontSize: 14 }
        };
      case 'large':
        return {
          button: { 
            paddingVertical: 16, 
            paddingHorizontal: 32, 
            minHeight: Math.max(56, minTouchTarget),
            minWidth: minTouchTarget
          },
          title: { fontSize: 18 }
        };
      default: // medium
        return {
          button: { 
            paddingVertical: 12, 
            paddingHorizontal: 24, 
            minHeight: minTouchTarget,
            minWidth: minTouchTarget
          },
          title: { fontSize: 16 }
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          button: { backgroundColor: colors.midGrey },
          title: { color: colors.white }
        };
      case 'outline':
        return {
          button: { 
            backgroundColor: 'transparent', 
            borderWidth: 2, 
            borderColor: colors.primary 
          },
          title: { color: colors.primary }
        };
      case 'text':
        return {
          button: { backgroundColor: 'transparent' },
          title: { color: colors.primary }
        };
      case 'danger':
        return {
          button: { backgroundColor: colors.error },
          title: { color: colors.white }
        };
      default: // primary
        return {
          button: { backgroundColor: colors.primary },
          title: { color: colors.white }
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <Button
      {...props}
      loading={loading}
      disabled={disabled || loading}
      loadingProps={{
        color: variantStyles.title.color,
        size: size === 'small' ? 'small' : 'large'
      }}
      buttonStyle={[
        {
          borderRadius: 8,
          ...(fullWidth && { width: '100%' })
        },
        sizeStyles.button,
        variantStyles.button,
        buttonStyle
      ]}
      titleStyle={[
        {
          ...typography.body,
          fontWeight: '600'
        },
        sizeStyles.title,
        variantStyles.title,
        titleStyle
      ]}
      disabledStyle={[
        {
          backgroundColor: colors.disabled,
          opacity: 0.6
        },
        disabledStyle
      ]}
      disabledTitleStyle={[
        {
          color: colors.textSecondary
        },
        disabledTitleStyle
      ]}
    />
  );
};