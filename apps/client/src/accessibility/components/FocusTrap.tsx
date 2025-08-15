/**
 * Focus trap component for managing keyboard navigation
 */

import React, { useEffect, useRef, ReactNode } from 'react';
import { View, ViewProps, Platform } from 'react-native';
import { useFocusManagement } from '../hooks/useFocusManagement';

export interface FocusTrapProps extends ViewProps {
  children: ReactNode;
  active?: boolean;
  initialFocus?: 'first' | 'last' | 'auto';
  returnFocus?: boolean;
  onEscape?: () => void;
  onEnter?: () => void;
  allowOutsideClick?: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  initialFocus = 'first',
  returnFocus = true,
  onEscape,
  onEnter,
  allowOutsideClick = false,
  style,
  ...viewProps
}) => {
  const containerRef = useRef<View>(null);
  const previousFocusRef = useRef<any>(null);
  const { trapFocus, releaseFocus, setFocus } = useFocusManagement();

  useEffect(() => {
    if (!active) return;

    // Store current focus for return
    if (returnFocus && Platform.OS === 'web') {
      previousFocusRef.current = document.activeElement;
    }

    // Initialize focus trap
    if (containerRef.current) {
      trapFocus(containerRef.current);
    }

    // Set initial focus
    if (Platform.OS === 'web' && containerRef.current) {
      const container = containerRef.current as any;
      const focusableElements = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        const targetElement = 
          initialFocus === 'last' 
            ? focusableElements[focusableElements.length - 1]
            : focusableElements[0];
        
        setTimeout(() => {
          targetElement?.focus();
        }, 100);
      }
    }

    // Cleanup
    return () => {
      releaseFocus();
      
      // Return focus to previous element
      if (returnFocus && previousFocusRef.current && Platform.OS === 'web') {
        (previousFocusRef.current as HTMLElement).focus();
      }
    };
  }, [active, initialFocus, returnFocus, trapFocus, releaseFocus]);

  // Handle keyboard events
  useEffect(() => {
    if (!active || Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      } else if (e.key === 'Enter' && onEnter) {
        e.preventDefault();
        onEnter();
      }
    };

    // Handle clicks outside
    const handleClickOutside = (e: MouseEvent) => {
      if (!allowOutsideClick && containerRef.current) {
        const container = containerRef.current as any;
        if (!container.contains(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (!allowOutsideClick) {
      document.addEventListener('click', handleClickOutside, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (!allowOutsideClick) {
        document.removeEventListener('click', handleClickOutside, true);
      }
    };
  }, [active, onEscape, onEnter, allowOutsideClick]);

  return (
    <View
      ref={containerRef}
      style={style}
      {...viewProps}
      accessibilityRole="none"
      accessibilityViewIsModal={active}
    >
      {children}
    </View>
  );
};

export default FocusTrap;