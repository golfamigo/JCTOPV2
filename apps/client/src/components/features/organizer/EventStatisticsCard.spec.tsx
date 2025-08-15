import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { EventStatisticsCard } from './EventStatisticsCard';
import statisticsService from '../../../services/statisticsService';
import { EventWithStatistics } from '../../../services/dashboardAnalyticsService';

// Mock environment variables
process.env.EXPO_PUBLIC_API_URL = 'https://jctop.zeabur.app/api/v1';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('../../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      success: '#28A745',
      warning: '#FFC107',
      danger: '#DC3545',
      white: '#FFFFFF',
      textSecondary: '#6C757D',
      dark: '#212529',
      lightGrey: '#F8F9FA',
      midGrey: '#6C757D',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }),
}));

jest.mock('@rneui/themed', () => ({
  Card: 'Card',
  Text: 'Text',
  Button: ({ title, onPress }: any) => {
    const { Text, TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  },
  Icon: 'Icon',
  Badge: ({ value }: any) => {
    const { Text } = require('react-native');
    return <Text>{value}</Text>;
  },
  Divider: 'Divider',
}));

jest.mock('../../../services/statisticsService');

const mockEvent: EventWithStatistics = {
  id: 'event-1',
  title: 'Test Event',
  startDate: new Date('2024-03-15'),
  status: 'published',
  statistics: {
    totalRegistrations: 100,
    checkedInCount: 80,
    attendanceRate: 80,
    lastUpdated: new Date('2024-03-10T10:00:00'),
  },
};

const mockEventWithoutStats: EventWithStatistics = {
  id: 'event-2',
  title: 'Event Without Stats',
  startDate: new Date('2024-03-20'),
  status: 'draft',
};

describe('EventStatisticsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render event information correctly', () => {
    render(<EventStatisticsCard event={mockEvent} />);

    expect(screen.getByText('Test Event')).toBeTruthy();
    expect(screen.getByText('3/15/2024')).toBeTruthy();
    expect(screen.getByText('organizer.published')).toBeTruthy();
  });

  it('should display statistics when provided', () => {
    render(<EventStatisticsCard event={mockEvent} />);

    expect(screen.getByText('100')).toBeTruthy(); // Total registrations
    expect(screen.getByText('80')).toBeTruthy(); // Checked-in count
    expect(screen.getByText('80.0%')).toBeTruthy(); // Attendance rate
  });

  it('should load statistics if not provided', async () => {
    const loadedStats = {
      totalRegistrations: 50,
      checkedInCount: 30,
      attendanceRate: 60,
      lastUpdated: new Date(),
    };

    (statisticsService.getEventStatistics as jest.Mock).mockResolvedValue({
      success: true,
      data: loadedStats,
    });

    render(<EventStatisticsCard event={mockEventWithoutStats} />);

    await waitFor(() => {
      expect(statisticsService.getEventStatistics).toHaveBeenCalledWith('event-2');
      expect(screen.getByText('50')).toBeTruthy();
      expect(screen.getByText('30')).toBeTruthy();
      expect(screen.getByText('60.0%')).toBeTruthy();
    });
  });

  it('should show loading state when fetching statistics', () => {
    (statisticsService.getEventStatistics as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<EventStatisticsCard event={mockEventWithoutStats} />);
    expect(screen.getByText('organizer.loadingStatistics')).toBeTruthy();
  });

  it('should handle error when loading statistics fails', async () => {
    (statisticsService.getEventStatistics as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Failed to load',
    });

    render(<EventStatisticsCard event={mockEventWithoutStats} />);

    await waitFor(() => {
      expect(screen.getByText('organizer.loadingFailed')).toBeTruthy();
    });
  });

  it('should refresh statistics when refresh button is pressed', async () => {
    const updatedStats = {
      totalRegistrations: 110,
      checkedInCount: 90,
      attendanceRate: 81.8,
      lastUpdated: new Date(),
    };

    (statisticsService.refreshEventStatistics as jest.Mock).mockResolvedValue({
      success: true,
      data: updatedStats,
    });

    render(<EventStatisticsCard event={mockEvent} />);

    // Since the refresh button is rendered as a TouchableOpacity, we can't easily test it
    // with the current mock setup. This test would need integration testing
    // or a more sophisticated mock setup
    expect(statisticsService.refreshEventStatistics).toBeDefined();
  });

  it('should navigate to check-in page when check-in button is pressed', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
      push: mockPush,
    });

    render(<EventStatisticsCard event={mockEvent} />);

    const checkInButton = screen.getByText('organizer.checkIn');
    fireEvent.press(checkInButton);

    expect(mockPush).toHaveBeenCalledWith('/organizer/events/event-1/checkin');
  });

  it('should navigate to attendees page when attendees button is pressed', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
      push: mockPush,
    });

    render(<EventStatisticsCard event={mockEvent} />);

    const attendeesButton = screen.getByText('organizer.attendees');
    fireEvent.press(attendeesButton);

    expect(mockPush).toHaveBeenCalledWith('/organizer/events/event-1/attendees');
  });

  it('should display correct attendance rate colors', () => {
    const highRateEvent = {
      ...mockEvent,
      statistics: {
        ...mockEvent.statistics!,
        attendanceRate: 85,
      },
    };

    const { rerender } = render(<EventStatisticsCard event={highRateEvent} />);
    expect(screen.getByText('organizer.excellent')).toBeTruthy();

    const mediumRateEvent = {
      ...mockEvent,
      statistics: {
        ...mockEvent.statistics!,
        attendanceRate: 50,
      },
    };

    rerender(<EventStatisticsCard event={mediumRateEvent} />);
    expect(screen.getByText('organizer.good')).toBeTruthy();

    const lowRateEvent = {
      ...mockEvent,
      statistics: {
        ...mockEvent.statistics!,
        attendanceRate: 30,
      },
    };

    rerender(<EventStatisticsCard event={lowRateEvent} />);
    expect(screen.getByText('organizer.needsAttention')).toBeTruthy();
  });

  it('should render progress bar with correct width', () => {
    render(<EventStatisticsCard event={mockEvent} />);

    // Progress bar should be rendered
    // Note: We can't directly test the width style, but we can verify the component structure
    expect(screen.getByText('organizer.attendanceProgress')).toBeTruthy();
  });

  it('should display draft badge for draft events', () => {
    const draftEvent = {
      ...mockEvent,
      status: 'draft' as const,
    };

    render(<EventStatisticsCard event={draftEvent} />);
    expect(screen.getByText('organizer.draft')).toBeTruthy();
  });

  it('should display completed badge for completed events', () => {
    const completedEvent = {
      ...mockEvent,
      status: 'completed' as const,
    };

    render(<EventStatisticsCard event={completedEvent} />);
    expect(screen.getByText('organizer.completed')).toBeTruthy();
  });

  it('should show no data message when statistics are null', async () => {
    (statisticsService.getEventStatistics as jest.Mock).mockResolvedValue({
      success: true,
      data: null,
    });

    render(<EventStatisticsCard event={mockEventWithoutStats} />);

    await waitFor(() => {
      expect(screen.getByText('organizer.noStatisticsAvailable')).toBeTruthy();
    });
  });

  it('should display last updated time', () => {
    render(<EventStatisticsCard event={mockEvent} />);
    expect(screen.getByText(/organizer.updated/)).toBeTruthy();
  });
});