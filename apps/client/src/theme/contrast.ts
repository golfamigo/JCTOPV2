/**
 * Contrast validation utilities for WCAG compliance
 */

import { accessibleColors, highContrastColors, darkModeColors } from './accessibility';

// WCAG 2.1 AA Standards
export const WCAG_AA_STANDARDS = {
  normalText: 4.5,    // 4.5:1 minimum contrast ratio
  largeText: 3.0,     // 3:1 for text 18pt+ or 14pt+ bold
  graphical: 3.0,     // 3:1 for graphical objects and UI components
  focusIndicator: 3.0, // 3:1 for focus indicators
};

// WCAG 2.1 AAA Standards (stricter)
export const WCAG_AAA_STANDARDS = {
  normalText: 7.0,    // 7:1 minimum contrast ratio
  largeText: 4.5,     // 4.5:1 for large text
  graphical: 4.5,     // 4.5:1 for graphical objects
  focusIndicator: 4.5, // 4.5:1 for focus indicators
};

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  readable: boolean;
  recommendation?: string;
}

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): RGB | null => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Support 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  } : null;
};

/**
 * Convert RGB to hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Calculate relative luminance
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export const getRelativeLuminance = (rgb: RGB): number => {
  const { r, g, b } = rgb;
  
  // Apply gamma correction
  const sRGB = [r, g, b].map(val => {
    if (val <= 0.03928) {
      return val / 12.92;
    }
    return Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  // Calculate luminance using ITU-R BT.709 coefficients
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

/**
 * Calculate contrast ratio between two colors
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) {
    console.error('Invalid color format');
    return 0;
  }
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if contrast meets WCAG standards
 */
export const checkContrast = (
  foreground: string,
  background: string,
  isLargeText = false
): ContrastResult => {
  const ratio = getContrastRatio(foreground, background);
  
  const aaStandard = isLargeText ? WCAG_AA_STANDARDS.largeText : WCAG_AA_STANDARDS.normalText;
  const aaaStandard = isLargeText ? WCAG_AAA_STANDARDS.largeText : WCAG_AAA_STANDARDS.normalText;
  
  const passesAA = ratio >= aaStandard;
  const passesAAA = ratio >= aaaStandard;
  
  let recommendation: string | undefined;
  
  if (!passesAA) {
    recommendation = `Contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AA. Minimum required: ${aaStandard}:1`;
  } else if (!passesAAA) {
    recommendation = `Passes WCAG AA (${ratio.toFixed(2)}:1) but fails AAA. Consider improving for better accessibility.`;
  }
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA,
    passesAAA,
    readable: passesAA,
    recommendation,
  };
};

/**
 * Find the nearest accessible color
 */
export const findAccessibleColor = (
  targetColor: string,
  backgroundColor: string,
  options?: {
    preferDarker?: boolean;
    isLargeText?: boolean;
    targetLevel?: 'AA' | 'AAA';
  }
): string => {
  const { preferDarker = false, isLargeText = false, targetLevel = 'AA' } = options || {};
  
  const targetRatio = targetLevel === 'AAA'
    ? (isLargeText ? WCAG_AAA_STANDARDS.largeText : WCAG_AAA_STANDARDS.normalText)
    : (isLargeText ? WCAG_AA_STANDARDS.largeText : WCAG_AA_STANDARDS.normalText);
  
  const currentRatio = getContrastRatio(targetColor, backgroundColor);
  
  if (currentRatio >= targetRatio) {
    return targetColor; // Already accessible
  }
  
  const targetRgb = hexToRgb(targetColor);
  const bgRgb = hexToRgb(backgroundColor);
  
  if (!targetRgb || !bgRgb) {
    return targetColor;
  }
  
  const bgLuminance = getRelativeLuminance(bgRgb);
  const needsLighter = bgLuminance < 0.5;
  
  // Binary search for the right luminance
  let low = 0;
  let high = 1;
  let bestColor = targetColor;
  let bestRatio = currentRatio;
  
  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    
    // Interpolate color
    const factor = needsLighter ? mid : 1 - mid;
    const newRgb = {
      r: targetRgb.r * (1 - factor) + factor,
      g: targetRgb.g * (1 - factor) + factor,
      b: targetRgb.b * (1 - factor) + factor,
    };
    
    const newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    const newRatio = getContrastRatio(newColor, backgroundColor);
    
    if (Math.abs(newRatio - targetRatio) < 0.1) {
      return newColor; // Close enough
    }
    
    if (newRatio < targetRatio) {
      if (needsLighter) {
        low = mid;
      } else {
        high = mid;
      }
    } else {
      bestColor = newColor;
      bestRatio = newRatio;
      if (needsLighter) {
        high = mid;
      } else {
        low = mid;
      }
    }
  }
  
  return bestColor;
};

/**
 * Validate an entire color palette
 */
export const validatePalette = (
  palette: Record<string, string>,
  backgroundColor = '#FFFFFF'
): Record<string, ContrastResult> => {
  const results: Record<string, ContrastResult> = {};
  
  Object.entries(palette).forEach(([name, color]) => {
    // Skip background colors in validation
    if (name.toLowerCase().includes('background') || name.toLowerCase().includes('surface')) {
      return;
    }
    
    const isLarge = name.toLowerCase().includes('heading') || 
                    name.toLowerCase().includes('title');
    
    results[name] = checkContrast(color, backgroundColor, isLarge);
  });
  
  return results;
};

/**
 * Generate a contrast report for all theme colors
 */
export const generateContrastReport = () => {
  const reports = {
    standard: {
      onWhite: validatePalette(accessibleColors, '#FFFFFF'),
      onSurface: validatePalette(accessibleColors, accessibleColors.surface),
    },
    highContrast: {
      onWhite: validatePalette(highContrastColors, '#FFFFFF'),
      onBlack: validatePalette(highContrastColors, '#000000'),
    },
    darkMode: {
      onDark: validatePalette(darkModeColors, darkModeColors.background),
      onSurface: validatePalette(darkModeColors, darkModeColors.surface),
    },
  };
  
  // Generate summary
  const summary = {
    totalTests: 0,
    passedAA: 0,
    passedAAA: 0,
    failed: 0,
    issues: [] as string[],
  };
  
  Object.entries(reports).forEach(([theme, contexts]) => {
    Object.entries(contexts).forEach(([context, results]) => {
      Object.entries(results).forEach(([color, result]) => {
        summary.totalTests++;
        
        if (!result.passesAA) {
          summary.failed++;
          summary.issues.push(`${theme}.${context}.${color}: ${result.ratio}:1`);
        } else if (result.passesAAA) {
          summary.passedAAA++;
        } else {
          summary.passedAA++;
        }
      });
    });
  });
  
  return {
    reports,
    summary,
  };
};

/**
 * Get color suggestions for better contrast
 */
export const getColorSuggestions = (
  foreground: string,
  background: string,
  targetRatio = WCAG_AA_STANDARDS.normalText
): string[] => {
  const suggestions: string[] = [];
  
  // Try adjusting lightness
  const lighter = findAccessibleColor(foreground, background, { preferDarker: false });
  const darker = findAccessibleColor(foreground, background, { preferDarker: true });
  
  if (lighter !== foreground) suggestions.push(lighter);
  if (darker !== foreground) suggestions.push(darker);
  
  // Try high contrast alternatives
  const highContrastAlternatives = [
    '#000000', // Pure black
    '#FFFFFF', // Pure white
    '#0066CC', // Accessible blue
    '#DC3545', // Accessible red
    '#28A745', // Accessible green
  ];
  
  highContrastAlternatives.forEach(color => {
    const result = checkContrast(color, background);
    if (result.passesAA) {
      suggestions.push(color);
    }
  });
  
  return [...new Set(suggestions)].slice(0, 5); // Return up to 5 unique suggestions
};

export default {
  WCAG_AA_STANDARDS,
  WCAG_AAA_STANDARDS,
  hexToRgb,
  rgbToHex,
  getRelativeLuminance,
  getContrastRatio,
  checkContrast,
  findAccessibleColor,
  validatePalette,
  generateContrastReport,
  getColorSuggestions,
};