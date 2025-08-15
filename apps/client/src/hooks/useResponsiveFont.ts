import { useState, useEffect } from 'react';
import { TextStyle, PixelRatio, Dimensions } from 'react-native';
import { useResponsive } from './useResponsive';
import {
  TypographyVariant,
  getResponsiveFontSize,
  getResponsiveTextStyle,
  getScaledFontSize,
  getLineHeight,
} from '../utils/responsiveTypography';

interface ResponsiveFontHookReturn {
  fontSize: (variant: TypographyVariant) => number;
  scaledFontSize: (baseSize: number) => number;
  textStyle: (variant: TypographyVariant) => TextStyle;
  fontScale: number;
  isLargeTextEnabled: boolean;
  getAdjustedSize: (size: number) => number;
}

export const useResponsiveFont = (): ResponsiveFontHookReturn => {
  const { width } = useResponsive();
  const [fontScale, setFontScale] = useState(PixelRatio.getFontScale());
  const [isLargeTextEnabled, setIsLargeTextEnabled] = useState(false);

  useEffect(() => {
    const updateFontScale = () => {
      const newFontScale = PixelRatio.getFontScale();
      setFontScale(newFontScale);
      setIsLargeTextEnabled(newFontScale > 1.3);
    };

    // Listen for orientation changes that might affect font scale
    const subscription = Dimensions.addEventListener('change', updateFontScale);
    
    // Initial check
    updateFontScale();

    return () => {
      subscription?.remove();
    };
  }, []);

  const fontSize = (variant: TypographyVariant): number => {
    return getResponsiveFontSize(variant, width);
  };

  const scaledFontSize = (baseSize: number): number => {
    return getScaledFontSize(baseSize, width);
  };

  const textStyle = (variant: TypographyVariant): TextStyle => {
    return getResponsiveTextStyle(variant, width);
  };

  const getAdjustedSize = (size: number): number => {
    // Adjust size based on user's accessibility settings
    if (isLargeTextEnabled) {
      // Cap the maximum scaling for large text mode
      const maxScale = 1.5;
      const effectiveScale = Math.min(fontScale, maxScale);
      return Math.round(size * effectiveScale);
    }
    return Math.round(size * fontScale);
  };

  return {
    fontSize,
    scaledFontSize,
    textStyle,
    fontScale,
    isLargeTextEnabled,
    getAdjustedSize,
  };
};

export default useResponsiveFont;