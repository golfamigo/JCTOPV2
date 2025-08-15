/**
 * Core accessibility constants and configuration
 */

import { Platform } from 'react-native';

// WCAG 2.1 AA Compliance Standards
export const WCAG_STANDARDS = {
  // Minimum contrast ratios
  contrast: {
    normalText: 4.5, // 4.5:1 for normal text
    largeText: 3.0, // 3:1 for large text (18pt+ or 14pt+ bold)
    nonText: 3.0, // 3:1 for UI components and graphics
  },
  
  // Minimum target sizes
  targetSizes: {
    minimum: 44, // 44x44 points minimum for touch targets
    preferred: 48, // 48x48 points preferred
  },
  
  // Animation and timing
  timing: {
    minimumDuration: 100, // Minimum animation duration in ms
    announcementDelay: 250, // Delay before screen reader announcements
    focusDelay: 100, // Delay before setting focus
  },
  
  // Font sizes for large text threshold
  fontSize: {
    largeTextThreshold: 18,
    largeBoldThreshold: 14,
  },
};

// Platform-specific accessibility features
export const PLATFORM_FEATURES = {
  ios: {
    voiceOver: 'VoiceOver',
    traits: [
      'button',
      'link',
      'image',
      'selected',
      'plays',
      'key',
      'text',
      'search',
      'header',
      'summary',
      'disabled',
      'frequentUpdates',
      'startsMedia',
      'adjustable',
      'allowsDirectInteraction',
      'updates',
      'causesPageTurn',
      'modal',
    ],
    announcement: 'announceForAccessibility',
  },
  android: {
    talkBack: 'TalkBack',
    liveRegions: ['none', 'polite', 'assertive'],
    importantForAccessibility: ['auto', 'yes', 'no', 'no-hide-descendants'],
    roles: [
      'button',
      'checkbox',
      'combobox',
      'menu',
      'menubar',
      'menuitem',
      'progressbar',
      'radio',
      'scrollbar',
      'spinbutton',
      'tab',
      'tablist',
      'timer',
      'toolbar',
    ],
  },
  web: {
    ariaAttributes: [
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'aria-live',
      'aria-atomic',
      'aria-relevant',
      'aria-busy',
      'aria-hidden',
      'aria-expanded',
      'aria-pressed',
      'aria-checked',
      'aria-selected',
      'aria-current',
      'aria-invalid',
      'aria-required',
    ],
  },
};

// Accessibility testing IDs
export const A11Y_TEST_IDS = {
  // Navigation
  mainNavigation: 'a11y-main-navigation',
  tabBar: 'a11y-tab-bar',
  drawer: 'a11y-drawer-menu',
  
  // Forms
  loginForm: 'a11y-login-form',
  registerForm: 'a11y-register-form',
  searchForm: 'a11y-search-form',
  
  // Modals
  modalContainer: 'a11y-modal-container',
  modalCloseButton: 'a11y-modal-close',
  
  // Lists
  eventList: 'a11y-event-list',
  ticketList: 'a11y-ticket-list',
  
  // Loading states
  loadingIndicator: 'a11y-loading-indicator',
  skeleton: 'a11y-skeleton-loader',
};

// Screen reader announcement priorities
export const ANNOUNCEMENT_PRIORITY = {
  LOW: 'polite',
  HIGH: 'assertive',
  OFF: 'none',
} as const;

// Focus order configuration
export const FOCUS_ORDER = {
  skipLinks: -1,
  header: 0,
  navigation: 1,
  mainContent: 2,
  sidebar: 3,
  footer: 4,
};

// Keyboard navigation keys
export const KEYBOARD_KEYS = {
  ENTER: Platform.OS === 'web' ? 'Enter' : 13,
  SPACE: Platform.OS === 'web' ? ' ' : 32,
  ESCAPE: Platform.OS === 'web' ? 'Escape' : 27,
  TAB: Platform.OS === 'web' ? 'Tab' : 9,
  ARROW_UP: Platform.OS === 'web' ? 'ArrowUp' : 38,
  ARROW_DOWN: Platform.OS === 'web' ? 'ArrowDown' : 40,
  ARROW_LEFT: Platform.OS === 'web' ? 'ArrowLeft' : 37,
  ARROW_RIGHT: Platform.OS === 'web' ? 'ArrowRight' : 39,
  HOME: Platform.OS === 'web' ? 'Home' : 36,
  END: Platform.OS === 'web' ? 'End' : 35,
  PAGE_UP: Platform.OS === 'web' ? 'PageUp' : 33,
  PAGE_DOWN: Platform.OS === 'web' ? 'PageDown' : 34,
};

// Accessibility state types
export type AccessibilityState = {
  disabled?: boolean;
  selected?: boolean;
  checked?: boolean | 'mixed';
  busy?: boolean;
  expanded?: boolean;
};

// Accessibility value types
export type AccessibilityValue = {
  min?: number;
  max?: number;
  now?: number;
  text?: string;
};

// Live region types
export type LiveRegionType = 'none' | 'polite' | 'assertive';

// Accessibility role types
export type AccessibilityRole =
  | 'none'
  | 'button'
  | 'link'
  | 'search'
  | 'image'
  | 'keyboardkey'
  | 'text'
  | 'adjustable'
  | 'imagebutton'
  | 'header'
  | 'summary'
  | 'alert'
  | 'checkbox'
  | 'combobox'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'scrollbar'
  | 'spinbutton'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'timer'
  | 'toolbar';

// Helper to determine if screen reader is active
export const isScreenReaderActive = async (): Promise<boolean> => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const { AccessibilityInfo } = require('react-native');
    return await AccessibilityInfo.isScreenReaderEnabled();
  }
  return false;
};

// Helper to determine if reduce motion is enabled
export const isReduceMotionEnabled = async (): Promise<boolean> => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const { AccessibilityInfo } = require('react-native');
    return await AccessibilityInfo.isReduceMotionEnabled();
  }
  return false;
};

// Helper to get current platform accessibility features
export const getPlatformFeatures = () => {
  switch (Platform.OS) {
    case 'ios':
      return PLATFORM_FEATURES.ios;
    case 'android':
      return PLATFORM_FEATURES.android;
    case 'web':
      return PLATFORM_FEATURES.web;
    default:
      return PLATFORM_FEATURES.web;
  }
};