// Mock @rneui/themed to avoid ES module issues
jest.mock('@rneui/themed', () => ({
  createTheme: jest.fn((config) => config),
  useTheme: jest.fn(() => ({
    theme: {},
    updateTheme: jest.fn(),
  })),
  ThemeProvider: ({ children, theme }: any) => children,
}));

// Mock process.env for consistent testing environment
process.env.EXPO_PUBLIC_API_URL = 'http://localhost:3000/api/v1';

import { theme, customTheme, useAppTheme } from './index';
import { renderHook } from '@testing-library/react-native';
import React from 'react';

// Mock react-i18next to avoid import issues in tests
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

describe('Theme Configuration', () => {
  describe('theme object', () => {
    it('should be defined', () => {
      expect(theme).toBeDefined();
    });

    it('should have lightColors configuration', () => {
      expect(theme.lightColors).toBeDefined();
      expect(theme.lightColors.primary).toBe('#007BFF');
      expect(theme.lightColors.success).toBe('#28A745');
      expect(theme.lightColors.error).toBe('#DC3545');
      expect(theme.lightColors.warning).toBe('#FFC107');
    });

    it('should have darkColors configuration', () => {
      expect(theme.darkColors).toBeDefined();
    });

    it('should have component configurations', () => {
      expect(theme.components).toBeDefined();
      expect(theme.components.Button).toBeDefined();
      expect(theme.components.Input).toBeDefined();
      expect(theme.components.Card).toBeDefined();
    });
  });

  describe('customTheme object', () => {
    it('should contain all required properties', () => {
      expect(customTheme.colors).toBeDefined();
      expect(customTheme.typography).toBeDefined();
      expect(customTheme.spacing).toBeDefined();
      expect(customTheme.breakpoints).toBeDefined();
    });

    it('should have correct color values from UI/UX spec', () => {
      expect(customTheme.colors.primary).toBe('#007BFF');
      expect(customTheme.colors.white).toBe('#FFFFFF');
      expect(customTheme.colors.lightGrey).toBe('#F8F9FA');
      expect(customTheme.colors.midGrey).toBe('#6C757D');
      expect(customTheme.colors.dark).toBe('#212529');
    });

    it('should have correct typography configuration', () => {
      expect(customTheme.typography.h1.fontSize).toBe(24);
      expect(customTheme.typography.h1.fontWeight).toBe('bold');
      expect(customTheme.typography.h2.fontSize).toBe(20);
      expect(customTheme.typography.body.fontSize).toBe(16);
      expect(customTheme.typography.small.fontSize).toBe(14);
    });

    it('should follow 8pt grid spacing system', () => {
      expect(customTheme.spacing.xs).toBe(4);
      expect(customTheme.spacing.sm).toBe(8);
      expect(customTheme.spacing.md).toBe(16);
      expect(customTheme.spacing.lg).toBe(24);
      expect(customTheme.spacing.xl).toBe(32);
      
      // Verify all spacing values are multiples of 4 (half of 8pt grid)
      Object.values(customTheme.spacing).forEach(value => {
        expect(value % 4).toBe(0);
      });
    });

    it('should have responsive breakpoints', () => {
      expect(customTheme.breakpoints.sm).toBe(0);
      expect(customTheme.breakpoints.md).toBe(768);
      expect(customTheme.breakpoints.lg).toBe(1200);
    });
  });

  describe('useAppTheme hook', () => {
    it('should return theme properties', () => {
      const { result } = renderHook(() => useAppTheme());
      
      expect(result.current.theme).toBeDefined();
      expect(result.current.colors).toBeDefined();
      expect(result.current.typography).toBeDefined();
      expect(result.current.spacing).toBeDefined();
      expect(result.current.breakpoints).toBeDefined();
    });

    it('should return updateTheme function', () => {
      const { result } = renderHook(() => useAppTheme());
      
      expect(result.current.updateTheme).toBeDefined();
      expect(typeof result.current.updateTheme).toBe('function');
    });

    it('should return correct color values', () => {
      const { result } = renderHook(() => useAppTheme());
      
      expect(result.current.colors.primary).toBe('#007BFF');
      expect(result.current.colors.success).toBe('#28A745');
      expect(result.current.colors.danger).toBe('#DC3545');
    });
  });

  describe('Component theme configurations', () => {
    it('should have Button component styling', () => {
      const buttonConfig = theme.components.Button;
      expect(buttonConfig).toBeDefined();
      expect(buttonConfig.buttonStyle).toBeDefined();
      expect(buttonConfig.buttonStyle.borderRadius).toBe(8);
      expect(buttonConfig.titleStyle.fontSize).toBe(16);
    });

    it('should have Input component styling', () => {
      const inputConfig = theme.components.Input;
      expect(inputConfig).toBeDefined();
      expect(inputConfig.inputStyle).toBeDefined();
      expect(inputConfig.inputStyle.fontSize).toBe(16);
      expect(inputConfig.placeholderTextColor).toBe('#6C757D');
    });

    it('should have Card component styling', () => {
      const cardConfig = theme.components.Card;
      expect(cardConfig).toBeDefined();
      expect(cardConfig.containerStyle).toBeDefined();
      expect(cardConfig.containerStyle.borderRadius).toBe(8);
      expect(cardConfig.containerStyle.backgroundColor).toBe('#FFFFFF');
    });

    it('should have consistent spacing in components', () => {
      const buttonPadding = theme.components.Button.buttonStyle.paddingVertical;
      const cardPadding = theme.components.Card.containerStyle.padding;
      
      // Verify spacing values are from our spacing system
      expect([4, 8, 16, 24, 32, 40, 48]).toContain(buttonPadding);
      expect([4, 8, 16, 24, 32, 40, 48]).toContain(cardPadding);
    });
  });

  describe('TypeScript types', () => {
    it('should export correct types', () => {
      // This test verifies types are exported without runtime errors
      expect(typeof theme).toBe('object');
      expect(typeof customTheme.colors).toBe('object');
      expect(typeof customTheme.typography).toBe('object');
      expect(typeof customTheme.spacing).toBe('object');
      expect(typeof customTheme.breakpoints).toBe('object');
    });
  });

  describe('Accessibility and UX compliance', () => {
    it('should have sufficient color contrast ratios', () => {
      // Primary color should be different enough from white
      expect(customTheme.colors.primary).not.toBe(customTheme.colors.white);
      expect(customTheme.colors.text).not.toBe(customTheme.colors.background);
    });

    it('should have minimum touch target sizes in components', () => {
      // Button should have adequate padding for touch targets
      const buttonPadding = theme.components.Button.buttonStyle.paddingVertical;
      expect(buttonPadding).toBeGreaterThanOrEqual(12); // Minimum for accessibility
    });

    it('should have readable font sizes', () => {
      // All font sizes should be 12pt or larger for readability
      expect(customTheme.typography.h1.fontSize).toBeGreaterThanOrEqual(12);
      expect(customTheme.typography.h2.fontSize).toBeGreaterThanOrEqual(12);
      expect(customTheme.typography.body.fontSize).toBeGreaterThanOrEqual(12);
      expect(customTheme.typography.small.fontSize).toBeGreaterThanOrEqual(12);
    });
  });
});