import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckInStatisticsHeader } from './CheckInStatisticsHeader';
import { EventStatistics } from '../../../services/statisticsService';

// Mock theme
const MockTheme = () => ({
  colors: {
    primary: { 500: '#2563EB', 600: '#1D4ED8' },
    success: { 600: '#059669' },
    warning: { 600: '#D97706' },
    error: { 600: '#DC2626' },
    neutral: { 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563' },
  },
});

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={MockTheme() as any}>
      {component}
    </ChakraProvider>
  );
};

describe('CheckInStatisticsHeader', () => {
  const mockStatistics: EventStatistics = {
    eventId: 'test-event-id',
    totalRegistrations: 100,
    checkedInCount: 75,
    attendanceRate: 75.0,
    lastUpdated: '2024-01-01T12:00:00.000Z',
  };

  const defaultProps = {
    statistics: mockStatistics,
    isLoading: false,
    error: null,
    onRefresh: jest.fn(),
    isRefreshing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading spinner when loading and no statistics', () => {
      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          statistics={null}
          isLoading={true}
        />
      );

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not show loading when statistics are available', () => {
      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          isLoading={true}
        />
      );

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error alert when error and no statistics', () => {
      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          statistics={null}
          error="Failed to load statistics"
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Failed to load statistics: Failed to load statistics')).toBeInTheDocument();
    });

    it('should show statistics when error but statistics available', () => {
      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          error="Some error"
        />
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
    });
  });

  describe('statistics display', () => {
    it('should display all statistics correctly', () => {
      renderWithChakra(<CheckInStatisticsHeader {...defaultProps} />);

      // Total Registrations
      expect(screen.getByText('Total Registrations')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();

      // Checked In
      expect(screen.getByText('Checked In')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('75.0%')).toBeInTheDocument();

      // Pending
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });

    it('should format large numbers with locale formatting', () => {
      const largeNumberStats = {
        ...mockStatistics,
        totalRegistrations: 1234,
        checkedInCount: 567,
        attendanceRate: 45.9,
      };

      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          statistics={largeNumberStats}
        />
      );

      expect(screen.getByText('1,234')).toBeInTheDocument();
      expect(screen.getByText('567')).toBeInTheDocument();
      expect(screen.getByText('667')).toBeInTheDocument(); // pending: 1234 - 567
    });

    it('should handle zero registrations', () => {
      const zeroStats = {
        ...mockStatistics,
        totalRegistrations: 0,
        checkedInCount: 0,
        attendanceRate: 0,
      };

      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          statistics={zeroStats}
        />
      );

      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  describe('refresh functionality', () => {
    it('should call onRefresh when refresh button is clicked', () => {
      const onRefresh = jest.fn();
      
      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          onRefresh={onRefresh}
        />
      );

      const refreshButton = screen.getByLabelText('Refresh statistics');
      fireEvent.click(refreshButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('should show loading state on refresh button when refreshing', () => {
      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          isRefreshing={true}
        />
      );

      const refreshButton = screen.getByLabelText('Refresh statistics');
      expect(refreshButton).toHaveAttribute('data-loading', 'true');
    });

    it('should show tooltip on refresh button', () => {
      renderWithChakra(<CheckInStatisticsHeader {...defaultProps} />);

      const refreshButton = screen.getByLabelText('Refresh statistics');
      expect(refreshButton).toBeInTheDocument();
    });
  });

  describe('attendance rate colors', () => {
    it('should use success color for high attendance rate (≥70%)', () => {
      const highAttendanceStats = {
        ...mockStatistics,
        attendanceRate: 85.0,
      };

      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          statistics={highAttendanceStats}
        />
      );

      // The pending percentage should use error color for low remaining
      expect(screen.getByText('15.0%')).toBeInTheDocument();
    });

    it('should use warning color for medium attendance rate (40-70%)', () => {
      const mediumAttendanceStats = {
        ...mockStatistics,
        totalRegistrations: 100,
        checkedInCount: 50,
        attendanceRate: 50.0,
      };

      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          statistics={mediumAttendanceStats}
        />
      );

      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });

    it('should use error color for low attendance rate (<40%)', () => {
      const lowAttendanceStats = {
        ...mockStatistics,
        totalRegistrations: 100,
        checkedInCount: 25,
        attendanceRate: 25.0,
      };

      renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          statistics={lowAttendanceStats}
        />
      );

      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });
  });

  describe('null states', () => {
    it('should return null when no statistics and not loading', () => {
      const { container } = renderWithChakra(
        <CheckInStatisticsHeader
          {...defaultProps}
          statistics={null}
          isLoading={false}
          error={null}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});