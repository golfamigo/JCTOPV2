/**
 * General accessibility utilities hook
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { 
  isScreenReaderActive, 
  isReduceMotionEnabled,
  WCAG_STANDARDS,
  ANNOUNCEMENT_PRIORITY,
  type LiveRegionType,
  type AccessibilityRole,
  type AccessibilityState,
  type AccessibilityValue,
} from '../constants';

interface UseAccessibilityReturn {
  // State
  screenReaderEnabled: boolean;
  reduceMotionEnabled: boolean;
  boldTextEnabled: boolean;
  grayscaleEnabled: boolean;
  invertColorsEnabled: boolean;
  reduceTransparencyEnabled: boolean;
  
  // Methods
  announce: (message: string, priority?: LiveRegionType) => void;
  focusElement: (element: any) => void;
  isHighContrast: () => boolean;
  
  // Helpers
  buildAccessibilityProps: (options: AccessibilityOptions) => AccessibilityProps;
  validateContrast: (foreground: string, background: string, isLargeText?: boolean) => boolean;
}

interface AccessibilityOptions {
  label: string;
  hint?: string;
  role?: AccessibilityRole;
  state?: AccessibilityState;
  value?: AccessibilityValue;
  liveRegion?: LiveRegionType;
  important?: boolean;
}

interface AccessibilityProps {
  accessible: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  accessibilityValue?: AccessibilityValue;
  accessibilityLiveRegion?: LiveRegionType;
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
  accessibilityElementsHidden?: boolean;
  accessibilityViewIsModal?: boolean;
}

export const useAccessibility = (): UseAccessibilityReturn => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [boldTextEnabled, setBoldTextEnabled] = useState(false);
  const [grayscaleEnabled, setGrayscaleEnabled] = useState(false);
  const [invertColorsEnabled, setInvertColorsEnabled] = useState(false);
  const [reduceTransparencyEnabled, setReduceTransparencyEnabled] = useState(false);
  
  const announcementQueue = useRef<string[]>([]);
  const isAnnouncing = useRef(false);

  useEffect(() => {
    // Initialize accessibility states
    const initializeStates = async () => {
      setScreenReaderEnabled(await isScreenReaderActive());
      setReduceMotionEnabled(await isReduceMotionEnabled());
      
      if (Platform.OS === 'ios') {
        // iOS-specific accessibility states
        AccessibilityInfo.isBoldTextEnabled?.().then(setBoldTextEnabled);
        AccessibilityInfo.isGrayscaleEnabled?.().then(setGrayscaleEnabled);
        AccessibilityInfo.isInvertColorsEnabled?.().then(setInvertColorsEnabled);
        AccessibilityInfo.isReduceTransparencyEnabled?.().then(setReduceTransparencyEnabled);
      }
    };

    initializeStates();

    // Set up event listeners
    const screenReaderChangedSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );

    const reduceMotionChangedSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled
    );

    let boldTextChangedSubscription: any;
    let grayscaleChangedSubscription: any;
    let invertColorsChangedSubscription: any;
    let reduceTransparencyChangedSubscription: any;

    if (Platform.OS === 'ios') {
      boldTextChangedSubscription = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        setBoldTextEnabled
      );
      
      grayscaleChangedSubscription = AccessibilityInfo.addEventListener(
        'grayscaleChanged',
        setGrayscaleEnabled
      );
      
      invertColorsChangedSubscription = AccessibilityInfo.addEventListener(
        'invertColorsChanged',
        setInvertColorsEnabled
      );
      
      reduceTransparencyChangedSubscription = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        setReduceTransparencyEnabled
      );
    }

    return () => {
      screenReaderChangedSubscription?.remove();
      reduceMotionChangedSubscription?.remove();
      boldTextChangedSubscription?.remove();
      grayscaleChangedSubscription?.remove();
      invertColorsChangedSubscription?.remove();
      reduceTransparencyChangedSubscription?.remove();
    };
  }, []);

  // Announce message to screen reader
  const announce = useCallback((message: string, priority: LiveRegionType = 'polite') => {
    if (!screenReaderEnabled) return;
    
    // Add to queue if assertive or if not currently announcing
    if (priority === 'assertive' || !isAnnouncing.current) {
      announcementQueue.current.push(message);
      processAnnouncementQueue();
    }
  }, [screenReaderEnabled]);

  const processAnnouncementQueue = useCallback(() => {
    if (announcementQueue.current.length === 0 || isAnnouncing.current) return;
    
    isAnnouncing.current = true;
    const message = announcementQueue.current.shift();
    
    if (message) {
      AccessibilityInfo.announceForAccessibility(message);
      
      // Process next announcement after a delay
      setTimeout(() => {
        isAnnouncing.current = false;
        processAnnouncementQueue();
      }, 250);
    }
  }, []);

  // Focus an element for accessibility
  const focusElement = useCallback((element: any) => {
    if (!element) return;
    
    if (Platform.OS === 'web') {
      element.focus?.();
    } else {
      const ReactNative = require('react-native');
      const handle = ReactNative.findNodeHandle(element);
      if (handle) {
        AccessibilityInfo.setAccessibilityFocus(handle);
      }
    }
  }, []);

  // Check if high contrast mode is enabled
  const isHighContrast = useCallback(() => {
    return invertColorsEnabled || grayscaleEnabled;
  }, [invertColorsEnabled, grayscaleEnabled]);

  // Build accessibility props for a component
  const buildAccessibilityProps = useCallback((options: AccessibilityOptions): AccessibilityProps => {
    const props: AccessibilityProps = {
      accessible: true,
      accessibilityLabel: options.label,
    };

    if (options.hint) {
      props.accessibilityHint = options.hint;
    }

    if (options.role) {
      props.accessibilityRole = options.role;
    }

    if (options.state) {
      props.accessibilityState = options.state;
    }

    if (options.value) {
      props.accessibilityValue = options.value;
    }

    if (options.liveRegion) {
      props.accessibilityLiveRegion = options.liveRegion;
    }

    if (options.important !== undefined) {
      props.importantForAccessibility = options.important ? 'yes' : 'no';
    }

    return props;
  }, []);

  // Validate color contrast ratio
  const validateContrast = useCallback((foreground: string, background: string, isLargeText = false): boolean => {
    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      } : null;
    };

    // Calculate relative luminance
    const getLuminance = (rgb: { r: number; g: number; b: number }) => {
      const { r, g, b } = rgb;
      const sRGB = [r, g, b].map(val => {
        if (val <= 0.03928) {
          return val / 12.92;
        }
        return Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    // Calculate contrast ratio
    const getContrastRatio = (l1: number, l2: number) => {
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    };

    const fgRgb = hexToRgb(foreground);
    const bgRgb = hexToRgb(background);

    if (!fgRgb || !bgRgb) return false;

    const fgLuminance = getLuminance(fgRgb);
    const bgLuminance = getLuminance(bgRgb);
    const contrastRatio = getContrastRatio(fgLuminance, bgLuminance);

    const requiredRatio = isLargeText 
      ? WCAG_STANDARDS.contrast.largeText 
      : WCAG_STANDARDS.contrast.normalText;

    return contrastRatio >= requiredRatio;
  }, []);

  return {
    // State
    screenReaderEnabled,
    reduceMotionEnabled,
    boldTextEnabled,
    grayscaleEnabled,
    invertColorsEnabled,
    reduceTransparencyEnabled,
    
    // Methods
    announce,
    focusElement,
    isHighContrast,
    
    // Helpers
    buildAccessibilityProps,
    validateContrast,
  };
};

export default useAccessibility;