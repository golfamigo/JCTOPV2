import { extendTheme } from '@chakra-ui/react';

// UIUX Brand Colors as specified in docs/UIUX/branding-style-guide.md
const colors = {
  primary: {
    50: '#EBF4FF',
    100: '#C3DAFE',
    200: '#A3BFFA',
    300: '#7F9CF5',
    400: '#667EEA',
    500: '#2563EB', // Main primary color
    600: '#1D4ED8',
    700: '#1E40AF',
    800: '#1E3A8A',
    900: '#1E3A8A',
  },
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#475569', // Main secondary color
    600: '#334155',
    700: '#1E293B',
    800: '#0F172A',
    900: '#020617',
  },
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main accent color
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main success color
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24', // Main warning color
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error color
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
};

// Typography scale as specified in UIUX guidelines
const fonts = {
  heading: 'Inter, Noto Sans TC, -apple-system, BlinkMacSystemFont, sans-serif',
  body: 'Inter, Noto Sans TC, -apple-system, BlinkMacSystemFont, sans-serif',
  mono: 'Roboto Mono, Menlo, Monaco, Consolas, monospace',
};

const fontSizes = {
  xs: '12px',
  sm: '14px', // Small text
  md: '16px', // Body text
  lg: '18px',
  xl: '20px',
  '2xl': '24px', // H3
  '3xl': '30px', // H2
  '4xl': '36px', // H1
};

const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

const lineHeights = {
  normal: 1.5,
  shorter: 1.3,
  short: 1.2,
};

// 4px grid system spacing
const space = {
  px: '1px',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  9: '36px',
  10: '40px',
  12: '48px',
  14: '56px',
  16: '64px',
  20: '80px',
  24: '96px',
  28: '112px',
  32: '128px',
  36: '144px',
  40: '160px',
  44: '176px',
  48: '192px',
  52: '208px',
  56: '224px',
  60: '240px',
  64: '256px',
  72: '288px',
  80: '320px',
  96: '384px',
};

// Component overrides for better accessibility and brand consistency
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'bold',
      borderRadius: '8px',
      _focus: {
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
      },
    },
    sizes: {
      lg: {
        h: '48px',
        minW: '48px',
        fontSize: '18px',
        px: '6',
      },
    },
    variants: {
      solid: {
        _hover: {
          _disabled: {
            bg: 'neutral.300',
          },
        },
      },
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: '8px',
        _focus: {
          borderColor: 'primary.500',
          boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.1)',
        },
        _invalid: {
          borderColor: 'error.500',
          boxShadow: '0 0 0 1px rgba(239, 68, 68, 0.1)',
        },
      },
    },
    sizes: {
      md: {
        field: {
          h: '48px',
          px: '4',
          py: '3',
          fontSize: '16px',
        },
      },
    },
  },
  FormLabel: {
    baseStyle: {
      fontWeight: '600',
      marginBottom: '2',
      fontSize: '16px',
    },
  },
  FormErrorMessage: {
    baseStyle: {
      fontSize: '14px',
      mt: '1',
    },
  },
};

const theme = extendTheme({
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  space,
  components,
  styles: {
    global: {
      body: {
        bg: 'neutral.50',
        color: 'neutral.900',
      },
    },
  },
});

export default theme;