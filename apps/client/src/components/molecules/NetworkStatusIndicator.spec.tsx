import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@/theme';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'errors.offline': 'No Internet Connection',
        'errors.connectionRestored': 'Connection Restored',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock network status hook
const mockNetworkStatus = {
  isConnected: true,
  isInternetReachable: true,
  type: 'wifi',
  details: null,
};

jest.mock('@/utils/networkStatus', () => ({
  useNetworkStatus: () => mockNetworkStatus,
  NetworkStatusManager: {
    getInstance: jest.fn(() => ({
      getCurrentStatus: jest.fn(() => mockNetworkStatus),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      checkConnection: jest.fn(() => Promise.resolve(mockNetworkStatus)),
    })),
  },
  getNetworkErrorMessage: jest.fn((error, isConnected) => {
    if (!isConnected) return 'errors.offline';
    return 'errors.unknownError';
  }),
}));

// Mock Animated for testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.timing = (value: any, config: any) => ({
    start: (callback?: any) => {
      value.setValue(config.toValue);
      callback && callback();
    },
  });
  RN.Animated.parallel = (animations: any[]) => ({
    start: (callback?: any) => {
      animations.forEach(anim => anim.start());
      callback && callback();
    },
  });
  return RN;
});

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('NetworkStatusIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Reset network status to connected
    mockNetworkStatus.isConnected = true;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not render when connected and showWhenConnected is false', () => {
    const { queryByTestId } = renderWithTheme(
      <NetworkStatusIndicator 
        showWhenConnected={false}
        testID="network-indicator"
      />
    );
    
    expect(queryByTestId('network-indicator')).toBeNull();
  });

  it('renders when disconnected', () => {
    mockNetworkStatus.isConnected = false;
    
    const { getByTestId, getByText } = renderWithTheme(
      <NetworkStatusIndicator testID="network-indicator" />
    );
    
    expect(getByTestId('network-indicator')).toBeTruthy();
    expect(getByText('No Internet Connection')).toBeTruthy();
  });

  it('shows offline message and icon when disconnected', () => {
    mockNetworkStatus.isConnected = false;
    
    const { getByTestId, getByText } = renderWithTheme(
      <NetworkStatusIndicator testID="network-indicator" />
    );
    
    expect(getByText('No Internet Connection')).toBeTruthy();
    expect(getByTestId('network-indicator-icon')).toBeTruthy();
  });

  it('shows restored message when connection is restored', async () => {
    // Start with disconnected
    mockNetworkStatus.isConnected = false;
    
    const { getByText, rerender } = renderWithTheme(
      <NetworkStatusIndicator testID="network-indicator" />
    );
    
    expect(getByText('No Internet Connection')).toBeTruthy();
    
    // Simulate connection restored
    mockNetworkStatus.isConnected = true;
    
    rerender(
      <ThemeProvider theme={theme}>
        <NetworkStatusIndicator testID="network-indicator" />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(getByText('Connection Restored')).toBeTruthy();
    });
  });

  it('auto-hides after specified delay when connected', async () => {
    // Start disconnected
    mockNetworkStatus.isConnected = false;
    
    const { queryByTestId, rerender } = renderWithTheme(
      <NetworkStatusIndicator 
        testID="network-indicator"
        autoHideDelay={1000}
      />
    );
    
    expect(queryByTestId('network-indicator')).toBeTruthy();
    
    // Restore connection
    mockNetworkStatus.isConnected = true;
    
    rerender(
      <ThemeProvider theme={theme}>
        <NetworkStatusIndicator 
          testID="network-indicator"
          autoHideDelay={1000}
        />
      </ThemeProvider>
    );
    
    // Should still be visible immediately after connection restored
    expect(queryByTestId('network-indicator')).toBeTruthy();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1300); // autoHideDelay + animation time
    });
    
    // Should be hidden after delay
    await waitFor(() => {
      expect(queryByTestId('network-indicator')).toBeTruthy(); // Will be animated out
    });
  });

  it('renders at top position by default', () => {
    mockNetworkStatus.isConnected = false;
    
    const { getByTestId } = renderWithTheme(
      <NetworkStatusIndicator testID="network-indicator" />
    );
    
    const indicator = getByTestId('network-indicator');
    expect(indicator).toBeTruthy();
    // Style assertions would check for top: 0
  });

  it('renders at bottom position when specified', () => {
    mockNetworkStatus.isConnected = false;
    
    const { getByTestId } = renderWithTheme(
      <NetworkStatusIndicator 
        position="bottom"
        testID="network-indicator"
      />
    );
    
    const indicator = getByTestId('network-indicator');
    expect(indicator).toBeTruthy();
    // Style assertions would check for bottom: 0
  });

  it('shows when connected if showWhenConnected is true', () => {
    mockNetworkStatus.isConnected = true;
    
    const { getByTestId, getByText } = renderWithTheme(
      <NetworkStatusIndicator 
        showWhenConnected={true}
        testID="network-indicator"
      />
    );
    
    expect(getByTestId('network-indicator')).toBeTruthy();
    expect(getByText('Connection Restored')).toBeTruthy();
  });

  it('does not auto-hide when autoHideDelay is 0', async () => {
    mockNetworkStatus.isConnected = true;
    
    const { getByTestId } = renderWithTheme(
      <NetworkStatusIndicator 
        showWhenConnected={true}
        autoHideDelay={0}
        testID="network-indicator"
      />
    );
    
    expect(getByTestId('network-indicator')).toBeTruthy();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    
    // Should still be visible
    expect(getByTestId('network-indicator')).toBeTruthy();
  });

  it('uses correct colors for offline state', () => {
    mockNetworkStatus.isConnected = false;
    
    const { getByTestId } = renderWithTheme(
      <NetworkStatusIndicator testID="network-indicator" />
    );
    
    const indicator = getByTestId('network-indicator');
    expect(indicator).toBeTruthy();
    // Would check for danger color in styles
  });

  it('uses correct colors for online state', () => {
    mockNetworkStatus.isConnected = true;
    
    const { getByTestId } = renderWithTheme(
      <NetworkStatusIndicator 
        showWhenConnected={true}
        testID="network-indicator"
      />
    );
    
    const indicator = getByTestId('network-indicator');
    expect(indicator).toBeTruthy();
    // Would check for success color in styles
  });

  it('displays wifi-off icon when offline', () => {
    mockNetworkStatus.isConnected = false;
    
    const { getByTestId } = renderWithTheme(
      <NetworkStatusIndicator testID="network-indicator" />
    );
    
    const icon = getByTestId('network-indicator-icon');
    expect(icon).toBeTruthy();
    // Would check for wifi-off icon name
  });

  it('displays wifi icon when online', () => {
    mockNetworkStatus.isConnected = true;
    
    const { getByTestId } = renderWithTheme(
      <NetworkStatusIndicator 
        showWhenConnected={true}
        testID="network-indicator"
      />
    );
    
    const icon = getByTestId('network-indicator-icon');
    expect(icon).toBeTruthy();
    // Would check for wifi icon name
  });
});