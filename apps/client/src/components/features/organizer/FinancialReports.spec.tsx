import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { FinancialReports } from './FinancialReports';
import reportService from '@/services/reportService';

// Mock dependencies
jest.mock('@/services/reportService');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      success: '#28A745',
      error: '#DC3545',
      warning: '#FFC107',
      white: '#FFFFFF',
      background: '#F8F9FA',
      dark: '#212529',
      grey2: '#E0E0E0',
      grey3: '#6C757D',
      grey5: '#424242',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  }),
}));

// Mock react-native-chart-kit
jest.mock('react-native-chart-kit', () => ({
  PieChart: jest.fn(({ data, ...props }) => null),
  BarChart: jest.fn(({ data, ...props }) => null),
}));

describe('FinancialReports', () => {
  const mockOnExport = jest.fn();
  const mockOnFilterPress = jest.fn();
  const mockOnTransactionPress = jest.fn();

  const defaultProps = {
    eventId: 'test-event-1',
    onExport: mockOnExport,
    onFilterPress: mockOnFilterPress,
    onTransactionPress: mockOnTransactionPress,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    const { queryByTestId, getAllByTestId } = render(
      <FinancialReports {...defaultProps} />
    );

    // Should show skeletons while loading
    const skeletons = getAllByTestId('RNE__Skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders report type buttons', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      expect(getByText('organizer.reports.revenueReport')).toBeTruthy();
      expect(getByText('organizer.reports.expenseReport')).toBeTruthy();
      expect(getByText('organizer.reports.comprehensiveReport')).toBeTruthy();
    });
  });

  it('switches between report types', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      const expenseButton = getByText('organizer.reports.expenseReport');
      fireEvent.press(expenseButton);
    });

    // Should update selected report type
    await waitFor(() => {
      expect(getByText('organizer.reports.totalExpenses')).toBeTruthy();
    });
  });

  it('displays revenue summary cards', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      expect(getByText('organizer.reports.totalRevenue')).toBeTruthy();
    });
  });

  it('displays expense summary cards when expense report selected', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      const expenseButton = getByText('organizer.reports.expenseReport');
      fireEvent.press(expenseButton);
    });

    await waitFor(() => {
      expect(getByText('organizer.reports.totalExpenses')).toBeTruthy();
    });
  });

  it('displays net profit in comprehensive report', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      const comprehensiveButton = getByText('organizer.reports.comprehensiveReport');
      fireEvent.press(comprehensiveButton);
    });

    await waitFor(() => {
      expect(getByText('organizer.reports.netProfit')).toBeTruthy();
    });
  });

  it('calls onExport when export button pressed', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      const exportButton = getByText('organizer.reports.export');
      fireEvent.press(exportButton);
    });

    expect(mockOnExport).toHaveBeenCalled();
  });

  it('calls onFilterPress when filter button pressed', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      const filterButton = getByText('organizer.reports.applyFilters');
      fireEvent.press(filterButton);
    });

    expect(mockOnFilterPress).toHaveBeenCalled();
  });

  it('formats currency in TWD correctly', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      // Should format numbers with NT$ prefix
      expect(getByText(/NT\$/)).toBeTruthy();
    });
  });

  it('renders charts for revenue report', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      expect(getByText('organizer.reports.byTicketType')).toBeTruthy();
      expect(getByText('organizer.reports.monthlyTrend')).toBeTruthy();
    });
  });

  it('renders expense breakdown for expense report', async () => {
    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      const expenseButton = getByText('organizer.reports.expenseReport');
      fireEvent.press(expenseButton);
    });

    await waitFor(() => {
      expect(getByText('organizer.reports.expenses')).toBeTruthy();
    });
  });

  it('handles refresh correctly', async () => {
    const { getByTestId } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      const scrollView = getByTestId('scrollView');
      // Simulate pull to refresh
      const { refreshControl } = scrollView.props;
      refreshControl.props.onRefresh();
    });

    // Should trigger data reload
    await waitFor(() => {
      expect(reportService.getFinancialReport).toHaveBeenCalled();
    });
  });

  it('handles error state correctly', async () => {
    (reportService.getFinancialReport as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByText } = render(
      <FinancialReports {...defaultProps} />
    );

    await waitFor(() => {
      expect(getByText('common.error.loadFailed')).toBeTruthy();
      expect(getByText('common.retry')).toBeTruthy();
    });
  });

  it('renders correctly without eventId', () => {
    const { queryByText } = render(
      <FinancialReports 
        onExport={mockOnExport}
        onFilterPress={mockOnFilterPress}
      />
    );

    // Should handle missing eventId gracefully
    expect(queryByText('organizer.reports.noData')).toBeFalsy();
  });
});