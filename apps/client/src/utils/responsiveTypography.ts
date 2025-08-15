import { TextStyle, PixelRatio } from 'react-native';
import { getDeviceType, Breakpoint } from './responsive';

interface FontScale {
  mobile: number;
  tablet: number;
  desktop: number;
}

interface ResponsiveFontSizes {
  h1: FontScale;
  h2: FontScale;
  h3: FontScale;
  h4: FontScale;
  body: FontScale;
  bodySmall: FontScale;
  caption: FontScale;
}

const baseFontSizes: ResponsiveFontSizes = {
  h1: {
    mobile: 28,
    tablet: 32,
    desktop: 36,
  },
  h2: {
    mobile: 24,
    tablet: 28,
    desktop: 32,
  },
  h3: {
    mobile: 20,
    tablet: 22,
    desktop: 24,
  },
  h4: {
    mobile: 18,
    tablet: 20,
    desktop: 22,
  },
  body: {
    mobile: 16,
    tablet: 16,
    desktop: 18,
  },
  bodySmall: {
    mobile: 14,
    tablet: 14,
    desktop: 16,
  },
  caption: {
    mobile: 12,
    tablet: 12,
    desktop: 14,
  },
};

export type TypographyVariant = keyof ResponsiveFontSizes;

export const getResponsiveFontSize = (
  variant: TypographyVariant,
  width?: number
): number => {
  const deviceType = getDeviceType(width);
  const fontSize = baseFontSizes[variant][deviceType];
  
  // Apply system font scaling
  const fontScale = PixelRatio.getFontScale();
  return Math.round(fontSize * fontScale);
};

export const getScaledFontSize = (
  baseSize: number,
  width?: number
): number => {
  const deviceType = getDeviceType(width);
  const scaleFactor = {
    mobile: 1,
    tablet: 1.1,
    desktop: 1.2,
  };
  
  const scaledSize = baseSize * scaleFactor[deviceType];
  const fontScale = PixelRatio.getFontScale();
  
  return Math.round(scaledSize * fontScale);
};

export const getLineHeight = (fontSize: number, multiplier: number = 1.5): number => {
  return Math.round(fontSize * multiplier);
};

export const getResponsiveTextStyle = (
  variant: TypographyVariant,
  width?: number
): TextStyle => {
  const fontSize = getResponsiveFontSize(variant, width);
  const lineHeight = getLineHeight(fontSize);
  
  const baseStyles: TextStyle = {
    fontSize,
    lineHeight,
  };
  
  // Add variant-specific styles
  switch (variant) {
    case 'h1':
    case 'h2':
    case 'h3':
      return {
        ...baseStyles,
        fontWeight: '700',
      };
    case 'h4':
      return {
        ...baseStyles,
        fontWeight: '600',
      };
    case 'caption':
      return {
        ...baseStyles,
        fontWeight: '400',
        lineHeight: getLineHeight(fontSize, 1.3),
      };
    default:
      return {
        ...baseStyles,
        fontWeight: '400',
      };
  }
};

export const responsiveTypography = {
  getResponsiveFontSize,
  getScaledFontSize,
  getLineHeight,
  getResponsiveTextStyle,
};

export default responsiveTypography;