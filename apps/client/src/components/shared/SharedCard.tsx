import React from 'react';
import { Card, CardProps } from '@rneui/themed';
import { ViewStyle, StyleProp } from 'react-native';
import { useAppTheme } from '@/theme';

interface SharedCardProps extends CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const SharedCard: React.FC<SharedCardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  fullWidth = false,
  containerStyle,
  wrapperStyle,
  children,
  ...props
}) => {
  const { colors } = useAppTheme();

  const getPaddingValue = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return 8;
      case 'large':
        return 24;
      default: // medium
        return 16;
    }
  };

  const getVariantStyles = (): StyleProp<ViewStyle> => {
    switch (variant) {
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: colors.border,
          shadowOpacity: 0,
          elevation: 0
        };
      case 'filled':
        return {
          backgroundColor: colors.surface,
          shadowOpacity: 0,
          elevation: 0
        };
      default: // elevated
        return {
          backgroundColor: colors.white,
          shadowColor: colors.dark,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3
        };
    }
  };

  const paddingValue = getPaddingValue();
  const variantStyles = getVariantStyles();

  return (
    <Card
      {...props}
      containerStyle={[
        {
          borderRadius: 12,
          margin: 0,
          padding: paddingValue,
          ...(fullWidth && { width: '100%' })
        },
        variantStyles,
        containerStyle
      ]}
      wrapperStyle={[
        {
          ...(padding === 'none' && { padding: 0 })
        },
        wrapperStyle
      ]}
    >
      {children}
    </Card>
  );
};