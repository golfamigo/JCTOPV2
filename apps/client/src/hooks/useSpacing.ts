import { useAppTheme } from '../theme';
import { StyleSheet } from 'react-native';

/**
 * Hook for consistent spacing application based on 8pt grid system
 * 
 * @example
 * const spacing = useSpacing();
 * 
 * // Use predefined spacing values
 * const styles = {
 *   container: {
 *     padding: spacing.md,
 *     marginBottom: spacing.lg
 *   }
 * };
 * 
 * // Use helper functions
 * const styles = {
 *   box: {
 *     ...spacing.padding('md'),
 *     ...spacing.margin('sm', 'lg'), // vertical, horizontal
 *   }
 * };
 */
export const useSpacing = () => {
  const { spacing } = useAppTheme();

  // Helper to create padding styles
  const padding = (
    all?: keyof typeof spacing,
    vertical?: keyof typeof spacing,
    horizontal?: keyof typeof spacing,
    top?: keyof typeof spacing,
    right?: keyof typeof spacing,
    bottom?: keyof typeof spacing,
    left?: keyof typeof spacing
  ) => {
    if (top !== undefined || right !== undefined || bottom !== undefined || left !== undefined) {
      return {
        ...(top !== undefined && { paddingTop: spacing[top] }),
        ...(right !== undefined && { paddingRight: spacing[right] }),
        ...(bottom !== undefined && { paddingBottom: spacing[bottom] }),
        ...(left !== undefined && { paddingLeft: spacing[left] }),
      };
    }
    
    if (vertical !== undefined || horizontal !== undefined) {
      return {
        ...(vertical !== undefined && { 
          paddingVertical: spacing[vertical]
        }),
        ...(horizontal !== undefined && { 
          paddingHorizontal: spacing[horizontal]
        }),
      };
    }
    
    if (all !== undefined) {
      return { padding: spacing[all] };
    }
    
    return {};
  };

  // Helper to create margin styles
  const margin = (
    all?: keyof typeof spacing,
    vertical?: keyof typeof spacing,
    horizontal?: keyof typeof spacing,
    top?: keyof typeof spacing,
    right?: keyof typeof spacing,
    bottom?: keyof typeof spacing,
    left?: keyof typeof spacing
  ) => {
    if (top !== undefined || right !== undefined || bottom !== undefined || left !== undefined) {
      return {
        ...(top !== undefined && { marginTop: spacing[top] }),
        ...(right !== undefined && { marginRight: spacing[right] }),
        ...(bottom !== undefined && { marginBottom: spacing[bottom] }),
        ...(left !== undefined && { marginLeft: spacing[left] }),
      };
    }
    
    if (vertical !== undefined || horizontal !== undefined) {
      return {
        ...(vertical !== undefined && { 
          marginVertical: spacing[vertical]
        }),
        ...(horizontal !== undefined && { 
          marginHorizontal: spacing[horizontal]
        }),
      };
    }
    
    if (all !== undefined) {
      return { margin: spacing[all] };
    }
    
    return {};
  };

  // Helper to create gap styles (for flexbox)
  const gap = (size: keyof typeof spacing) => ({
    gap: spacing[size]
  });

  // Helper to create consistent insets
  const insets = (size: keyof typeof spacing = 'md') => ({
    padding: spacing[size]
  });

  // Predefined common spacing patterns
  const patterns = {
    // Container with standard padding
    container: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
    },
    // Card-like padding
    card: {
      padding: spacing.md,
    },
    // List item padding
    listItem: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    // Section spacing
    section: {
      marginBottom: spacing.xl,
    },
    // Form field spacing
    formField: {
      marginBottom: spacing.md,
    },
    // Button group spacing
    buttonGroup: {
      gap: spacing.sm,
      flexDirection: 'row' as const,
    },
    // Stack spacing (vertical)
    stack: {
      gap: spacing.md,
    },
    // Inline spacing (horizontal)
    inline: {
      gap: spacing.sm,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
  };

  return {
    // Direct access to spacing values
    ...spacing,
    
    // Helper functions
    padding,
    margin,
    gap,
    insets,
    
    // Common patterns
    patterns,
    
    // Utility to multiply spacing values
    multiply: (size: keyof typeof spacing, multiplier: number) => 
      spacing[size] * multiplier,
    
    // Utility to create responsive spacing
    responsive: (small: keyof typeof spacing, medium?: keyof typeof spacing, large?: keyof typeof spacing) => ({
      small: spacing[small],
      medium: medium ? spacing[medium] : spacing[small],
      large: large ? spacing[large] : medium ? spacing[medium] : spacing[small],
    }),
  };
};

// Export type for TypeScript support
export type SpacingHook = ReturnType<typeof useSpacing>;