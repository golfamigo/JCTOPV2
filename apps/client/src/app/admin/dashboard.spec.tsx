import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import AdminDashboard from './dashboard';
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
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
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

const mockStatistics = {
  totalUsers: 1250,
  activeEvents: 42,
  totalRevenue: 458000,
  totalRegistrations: 3847,
  userGrowth: [
    { date: '2024-01-01', count: 100 },
    { date: '2024-01-02', count: 120 },
    { date: '2024-01-03', count: 135 },
  ],
  eventGrowth: [
    { date: '2024-01-01', count: 5 },
    { date: '2024-01-02', count: 8 },
    { date: '2024-01-03', count: 10 },
  ],
};

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
    (adminService.getPlatformStatistics as jest.Mock).mockResolvedValue(mockStatistics);
  });

  it('should render dashboard with statistics cards', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('admin.statistics.totalUsers')).toBeTruthy();
      expect(getByText('admin.statistics.activeEvents')).toBeTruthy();
      expect(getByText('admin.statistics.totalRevenue')).toBeTruthy();
      expect(getByText('admin.statistics.totalRegistrations')).toBeTruthy();
    });
  });

  it('should display correct statistics values', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('1,250')).toBeTruthy();
      expect(getByText('42')).toBeTruthy();
      expect(getByText('NT$ 458,000')).toBeTruthy();
      expect(getByText('3,847')).toBeTruthy();
    });
  });

  it('should render time range selector with correct options', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('admin.statistics.timeRange.today')).toBeTruthy();
      expect(getByText('admin.statistics.timeRange.week')).toBeTruthy();
      expect(getByText('admin.statistics.timeRange.month')).toBeTruthy();
      expect(getByText('admin.statistics.timeRange.year')).toBeTruthy();
    });
  });

  it('should fetch new data when time range changes', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(adminService.getPlatformStatistics).toHaveBeenCalledWith('month');
    });

    // Change to 'today'
    const todayButton = getByText('admin.statistics.timeRange.today');
    fireEvent.press(todayButton);

    await waitFor(() => {
      expect(adminService.getPlatformStatistics).toHaveBeenCalledWith('today');
    });
  });

  it('should handle refresh action', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(adminService.getPlatformStatistics).toHaveBeenCalledTimes(1);
    });

    // Trigger pull-to-refresh
    const scrollView = getByTestId('dashboard-scroll-view');
    fireEvent(scrollView, 'refresh');

    await waitFor(() => {
      expect(adminService.getPlatformStatistics).toHaveBeenCalledTimes(2);
    });
  });

  it('should show loading skeleton while fetching data', () => {
    (adminService.getPlatformStatistics as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getAllByTestId } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    const skeletons = getAllByTestId('stats-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    (adminService.getPlatformStatistics as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load statistics:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should render charts when data is available', async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user-growth-chart')).toBeTruthy();
      expect(getByTestId('event-growth-chart')).toBeTruthy();
    });
  });

  it('should format revenue with TWD currency', async () => {
    const { getByText } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      const revenueText = getByText(/NT\$/);
      expect(revenueText).toBeTruthy();
    });
  });

  it('should update statistics when switching between time ranges', async () => {
    const differentStats = {
      ...mockStatistics,
      totalUsers: 50,
      activeEvents: 2,
    };

    (adminService.getPlatformStatistics as jest.Mock)
      .mockResolvedValueOnce(mockStatistics)
      .mockResolvedValueOnce(differentStats);

    const { getByText, rerender } = render(
      <ThemeProvider>
        <AdminDashboard />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(getByText('1,250')).toBeTruthy();
    });

    // Change time range
    const weekButton = getByText('admin.statistics.timeRange.week');
    fireEvent.press(weekButton);

    await waitFor(() => {
      expect(getByText('50')).toBeTruthy();
      expect(getByText('2')).toBeTruthy();
    });
  });
});