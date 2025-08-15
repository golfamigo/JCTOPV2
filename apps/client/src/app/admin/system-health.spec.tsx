import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import SystemHealth from './system-health';
import { adminService } from '@/services/adminService';
import { useAppTheme } from '@/theme';

// Mock dependencies
jest.mock('@/services/adminService');
jest.mock('@/theme', () => ({
  useAppTheme: jest.fn(),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockTheme = {
  colors: {
    primary: '#007BFF',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    background: '#FFFFFF',
    text: '#212529',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

const mockHealthData = {
  api: {
    status: 'healthy' as const,
    responseTime: 120,
    uptime: 99.99,
  },
  database: {
    status: 'healthy' as const,
    connections: 45,
    maxConnections: 100,
  },
  server: {
    status: 'warning' as const,
    cpuUsage: 75,
    memoryUsage: 82,
    diskUsage: 65,
  },
  lastChecked: new Date().toISOString(),
};

describe('SystemHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
    (adminService.getSystemHealth as jest.Mock).mockResolvedValue(mockHealthData);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render system health indicators', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('admin.systemStatus.api')).toBeTruthy();
      expect(getByText('admin.systemStatus.database')).toBeTruthy();
      expect(getByText('admin.systemStatus.server')).toBeTruthy();
    });
  });

  it('should display health status badges with correct colors', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      const apiBadge = getByTestId('api-status-badge');
      expect(apiBadge.props.status).toBe('success');

      const dbBadge = getByTestId('database-status-badge');
      expect(dbBadge.props.status).toBe('success');

      const serverBadge = getByTestId('server-status-badge');
      expect(serverBadge.props.status).toBe('warning');
    });
  });

  it('should show response time and uptime for API', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('120ms')).toBeTruthy();
      expect(getByText('99.99%')).toBeTruthy();
    });
  });

  it('should show database connection stats', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('45/100')).toBeTruthy();
    });
  });

  it('should show server resource usage', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText(/CPU: 75%/)).toBeTruthy();
      expect(getByText(/Memory: 82%/)).toBeTruthy();
      expect(getByText(/Disk: 65%/)).toBeTruthy();
    });
  });

  it('should refresh data when refresh button is pressed', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(adminService.getSystemHealth).toHaveBeenCalledTimes(1);
    });

    const refreshButton = getByTestId('refresh-button');
    fireEvent.press(refreshButton);

    await waitFor(() => {
      expect(adminService.getSystemHealth).toHaveBeenCalledTimes(2);
    });
  });

  it('should poll for updates every 30 seconds', async () => {
    render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(adminService.getSystemHealth).toHaveBeenCalledTimes(1);
    });

    // Fast-forward 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(adminService.getSystemHealth).toHaveBeenCalledTimes(2);
    });

    // Fast-forward another 30 seconds
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    await waitFor(() => {
      expect(adminService.getSystemHealth).toHaveBeenCalledTimes(3);
    });
  });

  it('should display last checked timestamp', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText(/admin.systemStatus.lastChecked/)).toBeTruthy();
    });
  });

  it('should handle critical status correctly', async () => {
    const criticalHealth = {
      ...mockHealthData,
      api: { status: 'critical' as const, responseTime: 5000, uptime: 85 },
    };

    (adminService.getSystemHealth as jest.Mock).mockResolvedValue(criticalHealth);

    const { getByTestId } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      const apiBadge = getByTestId('api-status-badge');
      expect(apiBadge.props.status).toBe('error');
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (adminService.getSystemHealth as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByText } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch system health:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should show loading state while fetching', () => {
    (adminService.getSystemHealth as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByTestId } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    expect(getByTestId('health-loading')).toBeTruthy();
  });

  it('should cleanup polling on unmount', async () => {
    const { unmount } = render(
      <ThemeProvider>
        <SystemHealth />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(adminService.getSystemHealth).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Fast-forward 30 seconds after unmount
    act(() => {
      jest.advanceTimersByTime(30000);
    });

    // Should not have made additional calls after unmount
    expect(adminService.getSystemHealth).toHaveBeenCalledTimes(1);
  });
});