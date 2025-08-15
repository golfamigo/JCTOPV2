/**
 * Screen reader utilities hook
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { ANNOUNCEMENT_PRIORITY, WCAG_STANDARDS } from '../constants';

interface UseScreenReaderReturn {
  isEnabled: boolean;
  announce: (message: string, options?: AnnounceOptions) => void;
  announceLive: (message: string, priority?: 'polite' | 'assertive') => void;
  createLiveRegion: () => LiveRegionRef;
  announcePageChange: (pageName: string) => void;
  announceError: (error: string) => void;
  announceSuccess: (message: string) => void;
  announceLoading: (isLoading: boolean, message?: string) => void;
}

interface AnnounceOptions {
  delay?: number;
  queue?: boolean;
  interrupt?: boolean;
  language?: string;
}

interface LiveRegionRef {
  ref: React.RefObject<View>;
  announce: (message: string) => void;
  clear: () => void;
}

export const useScreenReader = (): UseScreenReaderReturn => {
  const [isEnabled, setIsEnabled] = useState(false);
  const announcementQueue = useRef<{ message: string; options?: AnnounceOptions }[]>([]);
  const isProcessingQueue = useRef(false);
  const liveRegionRefs = useRef<Set<LiveRegionRef>>(new Set());

  useEffect(() => {
    // Check initial screen reader state
    AccessibilityInfo.isScreenReaderEnabled().then(setIsEnabled);

    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsEnabled
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  // Basic announcement
  const announce = useCallback((message: string, options?: AnnounceOptions) => {
    if (!isEnabled) return;

    const defaultOptions: AnnounceOptions = {
      delay: 0,
      queue: true,
      interrupt: false,
      ...options,
    };

    if (defaultOptions.interrupt) {
      // Clear queue and announce immediately
      announcementQueue.current = [];
      makeAnnouncement(message, defaultOptions.delay);
    } else if (defaultOptions.queue) {
      // Add to queue
      announcementQueue.current.push({ message, options: defaultOptions });
      processQueue();
    } else {
      // Announce immediately without queuing
      makeAnnouncement(message, defaultOptions.delay);
    }
  }, [isEnabled]);

  // Process announcement queue
  const processQueue = useCallback(() => {
    if (isProcessingQueue.current || announcementQueue.current.length === 0) return;

    isProcessingQueue.current = true;
    const { message, options } = announcementQueue.current.shift()!;

    makeAnnouncement(message, options?.delay || 0);

    // Process next item after a delay
    setTimeout(() => {
      isProcessingQueue.current = false;
      processQueue();
    }, WCAG_STANDARDS.timing.announcementDelay);
  }, []);

  // Make the actual announcement
  const makeAnnouncement = useCallback((message: string, delay: number = 0) => {
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility(message);
    }, delay);
  }, []);

  // Live region announcement
  const announceLive = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!isEnabled) return;

    // Use live regions for dynamic content
    liveRegionRefs.current.forEach(region => {
      region.announce(message);
    });

    // Fallback to regular announcement
    if (liveRegionRefs.current.size === 0) {
      announce(message, { interrupt: priority === 'assertive' });
    }
  }, [isEnabled, announce]);

  // Create a live region reference
  const createLiveRegion = useCallback((): LiveRegionRef => {
    const ref = useRef<View>(null);
    
    const liveRegion: LiveRegionRef = {
      ref,
      announce: (message: string) => {
        if (ref.current && Platform.OS === 'web') {
          // For web, update aria-live region
          (ref.current as any).setAttribute('aria-live', 'polite');
          (ref.current as any).textContent = message;
        } else if (ref.current) {
          // For native, use setNativeProps
          ref.current.setNativeProps({
            accessibilityLiveRegion: 'polite',
            accessibilityLabel: message,
          });
        }
      },
      clear: () => {
        if (ref.current && Platform.OS === 'web') {
          (ref.current as any).textContent = '';
        } else if (ref.current) {
          ref.current.setNativeProps({
            accessibilityLabel: '',
          });
        }
      },
    };

    liveRegionRefs.current.add(liveRegion);
    
    return liveRegion;
  }, []);

  // Announce page/route changes
  const announcePageChange = useCallback((pageName: string) => {
    if (!isEnabled) return;
    
    const message = `已進入${pageName}`;
    announce(message, { 
      delay: WCAG_STANDARDS.timing.focusDelay,
      interrupt: true 
    });
  }, [isEnabled, announce]);

  // Announce errors with high priority
  const announceError = useCallback((error: string) => {
    if (!isEnabled) return;
    
    const message = `錯誤：${error}`;
    announce(message, { 
      interrupt: true,
      delay: 0 
    });
  }, [isEnabled, announce]);

  // Announce success messages
  const announceSuccess = useCallback((message: string) => {
    if (!isEnabled) return;
    
    const successMessage = `成功：${message}`;
    announce(successMessage, { 
      queue: true,
      delay: WCAG_STANDARDS.timing.announcementDelay 
    });
  }, [isEnabled, announce]);

  // Announce loading states
  const announceLoading = useCallback((isLoading: boolean, message?: string) => {
    if (!isEnabled) return;
    
    const loadingMessage = isLoading 
      ? (message || '載入中，請稍候')
      : '載入完成';
    
    announce(loadingMessage, { 
      queue: !isLoading,
      interrupt: isLoading 
    });
  }, [isEnabled, announce]);

  return {
    isEnabled,
    announce,
    announceLive,
    createLiveRegion,
    announcePageChange,
    announceError,
    announceSuccess,
    announceLoading,
  };
};

// Hook for managing live regions in components
export const useLiveRegion = (priority: 'polite' | 'assertive' = 'polite') => {
  const ref = useRef<View>(null);
  const [message, setMessage] = useState('');

  const announce = useCallback((newMessage: string) => {
    setMessage(newMessage);
    
    // Clear message after announcement to prepare for next
    setTimeout(() => {
      setMessage('');
    }, 1000);
  }, []);

  const getLiveRegionProps = useCallback(() => {
    if (Platform.OS === 'web') {
      return {
        'aria-live': priority,
        'aria-atomic': true,
        'aria-relevant': 'additions text',
        role: 'status',
      };
    }
    
    return {
      accessibilityLiveRegion: priority,
      accessible: true,
      accessibilityLabel: message,
    };
  }, [priority, message]);

  return {
    ref,
    announce,
    message,
    liveRegionProps: getLiveRegionProps(),
  };
};

export default useScreenReader;