/**
 * Focus management utilities hook
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Platform, AccessibilityInfo, findNodeHandle } from 'react-native';
import { WCAG_STANDARDS, FOCUS_ORDER, KEYBOARD_KEYS } from '../constants';

interface UseFocusManagementReturn {
  // Refs
  focusRef: React.RefObject<any>;
  trapRef: React.RefObject<any>;
  
  // Methods
  setFocus: (element?: any, delay?: number) => void;
  moveFocus: (direction: 'next' | 'previous' | 'first' | 'last') => void;
  trapFocus: (container?: any) => void;
  releaseFocus: () => void;
  
  // State
  isFocusTrapped: boolean;
  focusedElement: any;
  
  // Utilities
  createFocusTrap: () => FocusTrapManager;
  manageFocusOrder: (elements: any[]) => void;
  skipToContent: () => void;
}

interface FocusTrapManager {
  container: React.RefObject<any>;
  enable: () => void;
  disable: () => void;
  isEnabled: boolean;
}

export const useFocusManagement = (): UseFocusManagementReturn => {
  const focusRef = useRef<any>(null);
  const trapRef = useRef<any>(null);
  const [isFocusTrapped, setIsFocusTrapped] = useState(false);
  const [focusedElement, setFocusedElement] = useState<any>(null);
  const focusableElements = useRef<any[]>([]);
  const trapCleanup = useRef<(() => void) | null>(null);

  // Set focus to an element
  const setFocus = useCallback((element?: any, delay: number = WCAG_STANDARDS.timing.focusDelay) => {
    const target = element || focusRef.current;
    if (!target) return;

    setTimeout(() => {
      if (Platform.OS === 'web') {
        target.focus?.();
      } else {
        const handle = findNodeHandle(target);
        if (handle) {
          AccessibilityInfo.setAccessibilityFocus(handle);
        }
      }
      setFocusedElement(target);
    }, delay);
  }, []);

  // Move focus in a direction
  const moveFocus = useCallback((direction: 'next' | 'previous' | 'first' | 'last') => {
    if (focusableElements.current.length === 0) return;

    const currentIndex = focusableElements.current.indexOf(focusedElement);
    let nextIndex: number;

    switch (direction) {
      case 'next':
        nextIndex = (currentIndex + 1) % focusableElements.current.length;
        break;
      case 'previous':
        nextIndex = currentIndex - 1 < 0 
          ? focusableElements.current.length - 1 
          : currentIndex - 1;
        break;
      case 'first':
        nextIndex = 0;
        break;
      case 'last':
        nextIndex = focusableElements.current.length - 1;
        break;
    }

    const nextElement = focusableElements.current[nextIndex];
    setFocus(nextElement, 0);
  }, [focusedElement, setFocus]);

  // Trap focus within a container
  const trapFocus = useCallback((container?: any) => {
    const trapContainer = container || trapRef.current;
    if (!trapContainer) return;

    // Clean up previous trap
    if (trapCleanup.current) {
      trapCleanup.current();
    }

    if (Platform.OS === 'web') {
      // Find all focusable elements within container
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      const elements = trapContainer.querySelectorAll(focusableSelectors);
      focusableElements.current = Array.from(elements);

      if (focusableElements.current.length === 0) return;

      const firstElement = focusableElements.current[0];
      const lastElement = focusableElements.current[focusableElements.current.length - 1];

      // Set initial focus
      setFocus(firstElement, 0);

      // Handle keyboard navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        } else if (e.key === 'Escape') {
          releaseFocus();
        }
      };

      trapContainer.addEventListener('keydown', handleKeyDown);
      
      trapCleanup.current = () => {
        trapContainer.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      // For React Native, we need to manage focus programmatically
      // This is a simplified version - real implementation would need
      // to handle touch/gesture navigation
      const findFocusableChildren = (element: any): any[] => {
        // This would need to recursively find focusable children
        // For now, return empty array
        return [];
      };

      focusableElements.current = findFocusableChildren(trapContainer);
    }

    setIsFocusTrapped(true);
  }, [setFocus]);

  // Release focus trap
  const releaseFocus = useCallback(() => {
    if (trapCleanup.current) {
      trapCleanup.current();
      trapCleanup.current = null;
    }
    
    focusableElements.current = [];
    setIsFocusTrapped(false);
  }, []);

  // Create a focus trap manager
  const createFocusTrap = useCallback((): FocusTrapManager => {
    const containerRef = useRef<any>(null);
    let enabled = false;

    return {
      container: containerRef,
      enable: () => {
        if (!enabled && containerRef.current) {
          trapFocus(containerRef.current);
          enabled = true;
        }
      },
      disable: () => {
        if (enabled) {
          releaseFocus();
          enabled = false;
        }
      },
      get isEnabled() {
        return enabled;
      },
    };
  }, [trapFocus, releaseFocus]);

  // Manage focus order for a set of elements
  const manageFocusOrder = useCallback((elements: any[]) => {
    if (Platform.OS === 'web') {
      // Set tabindex based on desired order
      elements.forEach((element, index) => {
        if (element) {
          element.setAttribute('tabindex', index.toString());
        }
      });
    }
    
    // Store elements for navigation
    focusableElements.current = elements;
  }, []);

  // Skip to main content
  const skipToContent = useCallback(() => {
    if (Platform.OS === 'web') {
      const mainContent = document.querySelector('[role="main"]') || 
                         document.querySelector('main') ||
                         document.getElementById('main-content');
      
      if (mainContent) {
        (mainContent as HTMLElement).focus();
        (mainContent as HTMLElement).scrollIntoView();
      }
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (trapCleanup.current) {
        trapCleanup.current();
      }
    };
  }, []);

  return {
    // Refs
    focusRef,
    trapRef,
    
    // Methods
    setFocus,
    moveFocus,
    trapFocus,
    releaseFocus,
    
    // State
    isFocusTrapped,
    focusedElement,
    
    // Utilities
    createFocusTrap,
    manageFocusOrder,
    skipToContent,
  };
};

// Hook for keyboard navigation
export const useKeyboardNavigation = (
  onNavigate?: (key: string) => void,
  options?: {
    enableArrows?: boolean;
    enableTab?: boolean;
    enableEscape?: boolean;
    enableEnter?: boolean;
    enableSpace?: boolean;
  }
) => {
  const defaultOptions = {
    enableArrows: true,
    enableTab: true,
    enableEscape: true,
    enableEnter: true,
    enableSpace: false,
    ...options,
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const { key } = e;

      // Check if navigation is enabled for this key
      if (
        (defaultOptions.enableArrows && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) ||
        (defaultOptions.enableTab && key === 'Tab') ||
        (defaultOptions.enableEscape && key === 'Escape') ||
        (defaultOptions.enableEnter && key === 'Enter') ||
        (defaultOptions.enableSpace && key === ' ')
      ) {
        onNavigate?.(key);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNavigate, defaultOptions]);
};

export default useFocusManagement;