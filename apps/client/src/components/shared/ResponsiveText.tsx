import React from 'react';
import { Text, TextProps } from '@rneui/themed';
import { TextStyle } from 'react-native';
import { useResponsiveFont } from '../../hooks/useResponsiveFont';
import { TypographyVariant } from '../../utils/responsiveTypography';
import { useAppTheme } from '@/theme';

interface ResponsiveTextProps extends Omit<TextProps, 'style'> {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
  style?: TextStyle | TextStyle[];
  isChineseOptimized?: boolean;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  variant = 'body',
  color,
  align = 'left',
  numberOfLines,
  adjustsFontSizeToFit = false,
  minimumFontScale = 0.8,
  style,
  isChineseOptimized = true,
  children,
  ...textProps
}) => {
  const { colors } = useAppTheme();
  const { textStyle, isLargeTextEnabled } = useResponsiveFont();
  
  const variantStyle = textStyle(variant);
  
  // Optimize for Traditional Chinese characters
  const getChineseOptimizedStyle = (): TextStyle => {
    if (!isChineseOptimized) return {};
    
    return {
      // Increase line height for better Chinese character readability
      lineHeight: variantStyle.lineHeight ? variantStyle.lineHeight * 1.2 : undefined,
      // Ensure proper letter spacing for Chinese characters
      letterSpacing: 0.5,
      // Use system font that supports Traditional Chinese
      fontFamily: undefined, // Let system choose the best font
    };
  };

  const combinedStyle: TextStyle = {
    ...variantStyle,
    ...getChineseOptimizedStyle(),
    color: color || colors.text,
    textAlign: align,
    // Ensure text doesn't get too small on small devices
    ...(adjustsFontSizeToFit && {
      adjustsFontSizeToFit: true,
      minimumFontScale: isLargeTextEnabled ? 0.9 : minimumFontScale,
    }),
  };

  return (
    <Text
      {...textProps}
      style={[combinedStyle, style]}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      allowFontScaling={true}
    >
      {children}
    </Text>
  );
};

export default ResponsiveText;