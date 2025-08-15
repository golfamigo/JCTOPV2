import { PixelRatio } from 'react-native';
import {
  getResponsiveFontSize,
  getScaledFontSize,
  getLineHeight,
  getResponsiveTextStyle,
  TypographyVariant,
} from './responsiveTypography';

jest.mock('react-native', () => ({
  PixelRatio: {
    getFontScale: jest.fn(() => 1),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('react-native-device-info', () => ({
  isTablet: jest.fn(() => false),
}));

describe('responsiveTypography', () => {
  beforeEach(() => {
    (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1);
  });

  describe('getResponsiveFontSize', () => {
    it('should return correct font size for mobile', () => {
      const fontSize = getResponsiveFontSize('h1', 320);
      expect(fontSize).toBe(28);
    });

    it('should return correct font size for tablet', () => {
      const fontSize = getResponsiveFontSize('h1', 768);
      expect(fontSize).toBe(32);
    });

    it('should return correct font size for desktop', () => {
      const fontSize = getResponsiveFontSize('h1', 1200);
      expect(fontSize).toBe(36);
    });

    it('should scale font size based on system settings', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.5);
      const fontSize = getResponsiveFontSize('body', 320);
      expect(fontSize).toBe(24); // 16 * 1.5
    });

    it('should handle different variants', () => {
      expect(getResponsiveFontSize('h2', 320)).toBe(24);
      expect(getResponsiveFontSize('body', 320)).toBe(16);
      expect(getResponsiveFontSize('caption', 320)).toBe(12);
    });
  });

  describe('getScaledFontSize', () => {
    it('should scale base size for mobile', () => {
      const scaledSize = getScaledFontSize(16, 320);
      expect(scaledSize).toBe(16); // 16 * 1 (mobile scale factor)
    });

    it('should scale base size for tablet', () => {
      const scaledSize = getScaledFontSize(16, 768);
      expect(scaledSize).toBe(18); // 16 * 1.1 (tablet scale factor)
    });

    it('should scale base size for desktop', () => {
      const scaledSize = getScaledFontSize(16, 1200);
      expect(scaledSize).toBe(19); // 16 * 1.2 (desktop scale factor)
    });

    it('should apply system font scale', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(2);
      const scaledSize = getScaledFontSize(16, 320);
      expect(scaledSize).toBe(32); // 16 * 1 * 2
    });
  });

  describe('getLineHeight', () => {
    it('should calculate line height with default multiplier', () => {
      const lineHeight = getLineHeight(16);
      expect(lineHeight).toBe(24); // 16 * 1.5
    });

    it('should calculate line height with custom multiplier', () => {
      const lineHeight = getLineHeight(16, 2);
      expect(lineHeight).toBe(32); // 16 * 2
    });

    it('should round line height', () => {
      const lineHeight = getLineHeight(15, 1.5);
      expect(lineHeight).toBe(23); // Math.round(15 * 1.5)
    });
  });

  describe('getResponsiveTextStyle', () => {
    it('should return correct styles for h1', () => {
      const style = getResponsiveTextStyle('h1', 320);
      expect(style).toEqual({
        fontSize: 28,
        lineHeight: 42,
        fontWeight: '700',
      });
    });

    it('should return correct styles for body', () => {
      const style = getResponsiveTextStyle('body', 320);
      expect(style).toEqual({
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
      });
    });

    it('should return correct styles for caption', () => {
      const style = getResponsiveTextStyle('caption', 320);
      expect(style).toEqual({
        fontSize: 12,
        lineHeight: 16, // 12 * 1.3
        fontWeight: '400',
      });
    });

    it('should handle tablet breakpoint', () => {
      const style = getResponsiveTextStyle('h1', 768);
      expect(style.fontSize).toBe(32);
      expect(style.lineHeight).toBe(48);
    });

    it('should handle desktop breakpoint', () => {
      const style = getResponsiveTextStyle('h1', 1200);
      expect(style.fontSize).toBe(36);
      expect(style.lineHeight).toBe(54);
    });

    it('should apply system font scale to text style', () => {
      (PixelRatio.getFontScale as jest.Mock).mockReturnValue(1.5);
      const style = getResponsiveTextStyle('body', 320);
      expect(style.fontSize).toBe(24); // 16 * 1.5
      expect(style.lineHeight).toBe(36); // 24 * 1.5
    });
  });
});