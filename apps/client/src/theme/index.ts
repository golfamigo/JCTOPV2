import { useTheme as useRNETheme } from '@rneui/themed';

// Color palette based on UI/UX spec
const colors = {
  primary: '#007BFF',
  white: '#FFFFFF',
  lightGrey: '#F8F9FA',
  midGrey: '#6C757D',
  dark: '#212529',
  success: '#28A745',
  error: '#DC3545', // Use error consistently instead of danger
  warning: '#FFC107',
  // Additional semantic colors
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  disabled: '#CED4DA',
  // React Native Elements compatible colors
  danger: '#DC3545', // Keep danger as alias for backward compatibility
  grey0: '#F8F9FA',
  grey1: '#F8F9FA', 
  grey2: '#6C757D',
  grey3: '#6C757D',
  grey4: '#6C757D',
  grey5: '#212529',
  greyOutline: '#E9ECEF',
};

// Typography based on UI/UX spec
const typography = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.dark,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.dark,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.dark,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.dark,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    color: colors.text,
  },
  small: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    color: colors.textSecondary,
  },
};

// Spacing based on 8pt grid system
const spacing = {
  xs: 4,  // 0.5x
  sm: 8,  // 1x
  md: 16, // 2x
  lg: 24, // 3x
  xl: 32, // 4x
  xxl: 40, // 5x
  xxxl: 48, // 6x
};

// Responsive breakpoints
const breakpoints = {
  sm: 0,     // Mobile
  md: 768,   // Tablet
  lg: 1200,  // Desktop
};

// Create the theme - using simple object structure
export const theme = {
  colors: {
    primary: colors.primary,
    secondary: colors.midGrey,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    background: colors.background,
    white: colors.white,
    black: colors.dark,
    grey: colors.midGrey, // Add grey alias
    grey0: colors.lightGrey,
    grey1: colors.lightGrey,
    grey2: colors.midGrey,
    grey3: colors.midGrey,
    grey4: colors.midGrey,
    grey5: colors.dark,
    greyOutline: colors.border,
    info: colors.primary, // Add info color
    card: colors.surface, // Add card background
    textPrimary: colors.text, // Add text primary
    textSecondary: colors.textSecondary, // Add text secondary
    searchBg: colors.lightGrey,
    divider: colors.border,
    border: colors.border, // Add border color
    dark: colors.dark, // Add dark color
    midGrey: colors.midGrey, // Add midGrey
    danger: colors.danger, // Keep danger for backward compatibility
    lightGrey: colors.lightGrey, // Add lightGrey
    text: colors.text, // Add text color
    surface: colors.surface, // Add surface color
    disabled: colors.disabled, // Add disabled color
  },
  mode: 'light' as const,
  components: {
    // Component-specific theme overrides
    Text: {
      h1Style: typography.h1,
      h2Style: typography.h2,
      h3Style: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: colors.dark,
      },
      h4Style: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: colors.dark,
      },
      style: typography.body,
    },
    Button: {
      buttonStyle: {
        borderRadius: 8,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
      },
      titleStyle: {
        fontSize: 16,
        fontWeight: '600' as const,
      },
      disabledStyle: {
        backgroundColor: colors.disabled,
      },
      disabledTitleStyle: {
        color: colors.midGrey,
      },
    },
    Input: {
      inputStyle: {
        fontSize: 16,
        color: colors.text,
      },
      containerStyle: {
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        borderBottomColor: colors.border,
      },
      placeholderTextColor: colors.midGrey,
      errorStyle: {
        color: colors.error,
        fontSize: 12,
        marginTop: spacing.xs,
      },
    },
    Card: {
      containerStyle: {
        borderRadius: 8,
        backgroundColor: colors.white,
        shadowColor: colors.dark,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginVertical: spacing.sm,
      },
    },
    ListItem: {
      containerStyle: {
        backgroundColor: colors.white,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
      },
    },
    SearchBar: {
      containerStyle: {
        backgroundColor: colors.background,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        paddingHorizontal: 0,
      },
      inputContainerStyle: {
        backgroundColor: colors.lightGrey,
        borderRadius: 8,
      },
      inputStyle: {
        fontSize: 16,
        color: colors.text,
      },
      placeholderTextColor: colors.midGrey,
    },
    Badge: {
      badgeStyle: {
        borderRadius: 12,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
      },
      textStyle: {
        fontSize: 12,
        fontWeight: '600' as const,
      },
    },
    Avatar: {
      overlayContainerStyle: {
        backgroundColor: colors.lightGrey,
      },
      titleStyle: {
        color: colors.dark,
      },
    },
    CheckBox: {
      containerStyle: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        marginLeft: 0,
        marginRight: 0,
        paddingHorizontal: 0,
      },
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal' as const,
        color: colors.text,
      },
      checkedColor: colors.primary,
    },
    Divider: {
      style: {
        backgroundColor: colors.border,
        height: 1,
      },
    },
    Header: {
      backgroundColor: colors.primary,
      containerStyle: {
        borderBottomWidth: 0,
        paddingBottom: 0,
        elevation: 4,
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      centerComponent: {
        style: {
          color: colors.white,
          fontSize: 18,
          fontWeight: '600' as const,
        },
      },
      leftComponent: {
        color: colors.white,
      },
      rightComponent: {
        color: colors.white,
      },
    },
    Icon: {
      color: colors.text,
      size: 24,
    },
    Overlay: {
      overlayStyle: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: spacing.lg,
      },
      backdropStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
    Skeleton: {
      style: {
        backgroundColor: colors.lightGrey,
      },
      skeletonStyle: {
        backgroundColor: colors.border,
      },
    },
    SocialIcon: {
      style: {
        borderRadius: 24,
      },
    },
    Switch: {
      trackColor: {
        true: colors.primary,
        false: colors.border,
      },
      thumbColor: colors.white,
    },
    Tab: {
      buttonStyle: {
        paddingVertical: spacing.sm,
      },
      titleStyle: {
        fontSize: 14,
        fontWeight: '600' as const,
      },
    },
    TabView: {
      animationType: 'spring' as const,
    },
    Tooltip: {
      backgroundColor: colors.dark,
      overlayColor: 'rgba(0, 0, 0, 0.8)',
      highlightColor: 'transparent',
    },
  },
};

// Export custom theme properties for use in components
export const customTheme = {
  colors: theme.colors,
  typography,
  spacing,
  breakpoints,
};

// Custom typed theme hook
export const useAppTheme = () => {
  const { theme: rneTheme, updateTheme } = useRNETheme();
  return {
    theme: rneTheme,
    updateTheme,
    colors: theme.colors,
    typography: customTheme.typography,
    spacing: customTheme.spacing,
    breakpoints: customTheme.breakpoints,
  };
};

// Type definitions for TypeScript support
export type AppTheme = typeof theme;
export type AppColors = typeof colors;
export type AppTypography = typeof typography;
export type AppSpacing = typeof spacing;
export type AppBreakpoints = typeof breakpoints;

// Props interface for components that accept theme
export interface ThemedProps {
  theme?: Partial<AppTheme>;
}

// Helper type for component styles that use theme
export type ThemedStyle<T = any> = (theme: {
  colors: AppColors;
  typography: AppTypography;
  spacing: AppSpacing;
  breakpoints: AppBreakpoints;
}) => T;