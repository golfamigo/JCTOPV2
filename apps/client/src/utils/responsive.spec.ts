import { Platform } from 'react-native';
import {
  breakpoints,
  getDeviceType,
  isTablet,
  isPhone,
  isDesktop,
  isLandscape,
  isPortrait,
  getResponsiveValue,
  responsiveSize,
  getTouchTargetSize,
  ensureTouchTarget,
  getGridColumns,
} from './responsive';

jest.mock('react-native-device-info', () => ({
  isTablet: jest.fn(() => false),
}));

describe('responsive utilities', () => {
  describe('getDeviceType', () => {
    it('should return mobile for width < 768', () => {
      expect(getDeviceType(320)).toBe('mobile');
      expect(getDeviceType(767)).toBe('mobile');
    });

    it('should return tablet for width >= 768 and < 1200', () => {
      expect(getDeviceType(768)).toBe('tablet');
      expect(getDeviceType(1024)).toBe('tablet');
      expect(getDeviceType(1199)).toBe('tablet');
    });

    it('should return desktop for width >= 1200', () => {
      expect(getDeviceType(1200)).toBe('desktop');
      expect(getDeviceType(1920)).toBe('desktop');
    });
  });

  describe('device type helpers', () => {
    it('isTablet should return true for width >= 768', () => {
      expect(isTablet(767)).toBe(false);
      expect(isTablet(768)).toBe(true);
      expect(isTablet(1024)).toBe(true);
    });

    it('isPhone should return true for width < 768', () => {
      expect(isPhone(767)).toBe(true);
      expect(isPhone(768)).toBe(false);
    });

    it('isDesktop should return true for width >= 1200', () => {
      expect(isDesktop(1199)).toBe(false);
      expect(isDesktop(1200)).toBe(true);
    });
  });

  describe('orientation helpers', () => {
    it('isLandscape should return true when width > height', () => {
      expect(isLandscape(800, 600)).toBe(true);
      expect(isLandscape(600, 800)).toBe(false);
      expect(isLandscape(600, 600)).toBe(false);
    });

    it('isPortrait should return true when height >= width', () => {
      expect(isPortrait(600, 800)).toBe(true);
      expect(isPortrait(800, 600)).toBe(false);
      expect(isPortrait(600, 600)).toBe(true);
    });
  });

  describe('getResponsiveValue', () => {
    it('should return value for current device type', () => {
      const values = {
        mobile: 'mobile-value',
        tablet: 'tablet-value',
        desktop: 'desktop-value',
      };

      expect(getResponsiveValue(values, 320)).toBe('mobile-value');
      expect(getResponsiveValue(values, 768)).toBe('tablet-value');
      expect(getResponsiveValue(values, 1200)).toBe('desktop-value');
    });

    it('should fallback to smaller breakpoint if value not defined', () => {
      const values = {
        mobile: 'mobile-value',
      };

      expect(getResponsiveValue(values, 320)).toBe('mobile-value');
      expect(getResponsiveValue(values, 768)).toBe('mobile-value');
      expect(getResponsiveValue(values, 1200)).toBe('mobile-value');
    });

    it('should handle partial values', () => {
      const values = {
        mobile: 10,
        desktop: 30,
      };

      expect(getResponsiveValue(values, 320)).toBe(10);
      expect(getResponsiveValue(values, 768)).toBe(10);
      expect(getResponsiveValue(values, 1200)).toBe(30);
    });
  });

  describe('responsiveSize', () => {
    it('should scale size based on device type', () => {
      const baseSize = 10;
      
      // Mobile device (width < 768)
      const mobileResult = responsiveSize(baseSize);
      expect(mobileResult).toBe(10);
    });

    it('should use custom scale factors', () => {
      const baseSize = 10;
      const customScale = { mobile: 2, tablet: 3, desktop: 4 };
      
      // Mobile device (default width)
      const result = responsiveSize(baseSize, customScale);
      expect(result).toBe(20);
    });
  });

  describe('touch target helpers', () => {
    it('getTouchTargetSize should return platform-specific size', () => {
      const originalPlatform = Platform.OS;
      
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
        configurable: true,
      });
      expect(getTouchTargetSize()).toBe(44);
      
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
        configurable: true,
      });
      expect(getTouchTargetSize()).toBe(48);
      
      Object.defineProperty(Platform, 'OS', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      });
    });

    it('ensureTouchTarget should add padding if size too small', () => {
      const originalPlatform = Platform.OS;
      Object.defineProperty(Platform, 'OS', {
        value: 'ios',
        writable: true,
        configurable: true,
      });

      expect(ensureTouchTarget(50)).toEqual({
        minHeight: 50,
        minWidth: 50,
      });

      expect(ensureTouchTarget(30)).toEqual({
        minHeight: 44,
        minWidth: 44,
        padding: 7,
      });

      expect(ensureTouchTarget(44)).toEqual({
        minHeight: 44,
        minWidth: 44,
      });
      
      Object.defineProperty(Platform, 'OS', {
        value: originalPlatform,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('getGridColumns', () => {
    it('should return default columns based on device type', () => {
      expect(getGridColumns(undefined, 320)).toBe(1);
      expect(getGridColumns(undefined, 768)).toBe(2);
      expect(getGridColumns(undefined, 1200)).toBe(3);
    });

    it('should use custom columns when provided', () => {
      const customColumns = { mobile: 2, tablet: 3, desktop: 4 };
      
      expect(getGridColumns(customColumns, 320)).toBe(2);
      expect(getGridColumns(customColumns, 768)).toBe(3);
      expect(getGridColumns(customColumns, 1200)).toBe(4);
    });

    it('should merge custom with defaults', () => {
      const customColumns = { tablet: 4 };
      
      expect(getGridColumns(customColumns, 320)).toBe(1);
      expect(getGridColumns(customColumns, 768)).toBe(4);
      expect(getGridColumns(customColumns, 1200)).toBe(3);
    });
  });
});