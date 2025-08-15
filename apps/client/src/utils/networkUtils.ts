import NetInfo from '@react-native-community/netinfo';

/**
 * Network utility functions
 */
export const networkUtils = {
  /**
   * Check if device is online
   */
  isOnline: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  },

  /**
   * Check if internet is reachable (not just local network)
   */
  isInternetReachable: async (): Promise<boolean | null> => {
    const state = await NetInfo.fetch();
    return state.isInternetReachable;
  },

  /**
   * Get network type
   */
  getNetworkType: async (): Promise<string> => {
    const state = await NetInfo.fetch();
    return state.type;
  },

  /**
   * Check if on WiFi
   */
  isWifi: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.type === 'wifi';
  },

  /**
   * Check if on cellular
   */
  isCellular: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    return state.type === 'cellular';
  },

  /**
   * Get detailed network info
   */
  getNetworkInfo: async () => {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifiEnabled: state.type === 'wifi',
      isCellularEnabled: state.type === 'cellular',
      details: state.details,
    };
  },

  /**
   * Wait for connection
   */
  waitForConnection: (timeout: number = 30000): Promise<boolean> => {
    return new Promise((resolve) => {
      let resolved = false;
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(false);
        }
      }, timeout);

      const unsubscribe = NetInfo.addEventListener((state) => {
        if (state.isConnected && !resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  },

  /**
   * Monitor connection changes
   */
  onConnectionChange: (callback: (isConnected: boolean) => void) => {
    return NetInfo.addEventListener((state) => {
      callback(state.isConnected ?? false);
    });
  },

  /**
   * Check if error is network-related
   */
  isNetworkError: (error: any): boolean => {
    if (!error) return false;
    
    const networkErrorCodes = [
      'NETWORK_ERROR',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNRESET',
      'EHOSTUNREACH',
      'ENETUNREACH',
    ];

    const networkErrorMessages = [
      'network',
      'fetch',
      'timeout',
      'connection',
      'offline',
    ];

    // Check error code
    if (error.code && networkErrorCodes.includes(error.code)) {
      return true;
    }

    // Check error message
    const errorMessage = (error.message || '').toLowerCase();
    return networkErrorMessages.some(msg => errorMessage.includes(msg));
  },

  /**
   * Format network speed
   */
  formatSpeed: (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) {
      return `${bytesPerSecond.toFixed(0)} B/s`;
    } else if (bytesPerSecond < 1024 * 1024) {
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    } else {
      return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
    }
  },

  /**
   * Estimate connection quality
   */
  estimateConnectionQuality: async (): Promise<'poor' | 'fair' | 'good' | 'excellent' | 'unknown'> => {
    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
      return 'unknown';
    }

    // For cellular connections, check details
    if (state.type === 'cellular' && state.details) {
      const details = state.details as any;
      const cellularGeneration = details.cellularGeneration;
      
      switch (cellularGeneration) {
        case '2g':
          return 'poor';
        case '3g':
          return 'fair';
        case '4g':
          return 'good';
        case '5g':
          return 'excellent';
      }
    }

    // For WiFi, assume good connection
    if (state.type === 'wifi') {
      return 'good';
    }

    return 'unknown';
  },

  /**
   * Check if should use reduced data mode
   */
  shouldReduceData: async (): Promise<boolean> => {
    const state = await NetInfo.fetch();
    
    // Reduce data on cellular or poor connections
    if (state.type === 'cellular') {
      const quality = await networkUtils.estimateConnectionQuality();
      return quality === 'poor' || quality === 'fair';
    }

    return false;
  },
};

export default networkUtils;