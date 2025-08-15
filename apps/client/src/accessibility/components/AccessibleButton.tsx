/**
 * Accessible button wrapper component
 */

import React, { useCallback } from 'react';
import { Button, ButtonProps } from '@rneui/themed';
import { AccessibilityState, AccessibilityValue } from 'react-native';
import { useAccessibility } from '../hooks/useAccessibility';
import { useScreenReader } from '../hooks/useScreenReader';
import { WCAG_STANDARDS } from '../constants';

export interface AccessibleButtonProps extends ButtonProps {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'tab';
  accessibilityState?: AccessibilityState;
  accessibilityValue?: AccessibilityValue;
  onAccessibilityAction?: () => void;
  announceOnPress?: string;
  minTouchSize?: number;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  accessibilityValue,
  onAccessibilityAction,
  announceOnPress,
  minTouchSize = WCAG_STANDARDS.targetSizes.minimum,
  onPress,
  buttonStyle,
  disabled,
  loading,
  children,
  ...props
}) => {
  const { screenReaderEnabled, buildAccessibilityProps } = useAccessibility();
  const { announce } = useScreenReader();

  const handlePress = useCallback((event: any) => {
    // Announce action if configured
    if (announceOnPress && screenReaderEnabled) {
      announce(announceOnPress);
    }

    // Call original onPress
    onPress?.(event);

    // Call accessibility action if defined
    onAccessibilityAction?.();
  }, [onPress, onAccessibilityAction, announceOnPress, screenReaderEnabled, announce]);

  // Build comprehensive accessibility props
  const a11yProps = buildAccessibilityProps({
    label: accessibilityLabel,
    hint: accessibilityHint,
    role: accessibilityRole,
    state: {
      ...accessibilityState,
      disabled: disabled || loading,
      busy: loading,
    },
    value: accessibilityValue,
    important: true,
  });

  // Ensure minimum touch target size
  const combinedButtonStyle = [
    {
      minHeight: minTouchSize,
      minWidth: minTouchSize,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    buttonStyle,
  ];

  return (
    <Button
      {...props}
      {...a11yProps}
      onPress={handlePress}
      buttonStyle={combinedButtonStyle}
      disabled={disabled}
      loading={loading}
      accessibilityActions={
        onAccessibilityAction
          ? [{ name: 'activate', label: accessibilityLabel }]
          : undefined
      }
      onAccessibilityAction={
        onAccessibilityAction
          ? (event: any) => {
              if (event.actionName === 'activate') {
                onAccessibilityAction();
              }
            }
          : undefined
      }
    >
      {children}
    </Button>
  );
};

// Preset button variants with accessibility built-in
export const PrimaryButton: React.FC<Omit<AccessibleButtonProps, 'accessibilityRole'>> = (props) => (
  <AccessibleButton
    {...props}
    accessibilityRole="button"
    type="solid"
  />
);

export const SecondaryButton: React.FC<Omit<AccessibleButtonProps, 'accessibilityRole'>> = (props) => (
  <AccessibleButton
    {...props}
    accessibilityRole="button"
    type="outline"
  />
);

export const LinkButton: React.FC<Omit<AccessibleButtonProps, 'accessibilityRole'>> = (props) => (
  <AccessibleButton
    {...props}
    accessibilityRole="link"
    type="clear"
  />
);

export const DangerButton: React.FC<Omit<AccessibleButtonProps, 'accessibilityRole'>> = (props) => (
  <AccessibleButton
    {...props}
    accessibilityRole="button"
    color="error"
  />
);

export default AccessibleButton;