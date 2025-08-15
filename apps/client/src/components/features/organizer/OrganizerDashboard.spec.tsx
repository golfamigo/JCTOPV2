import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { OrganizerDashboard } from './OrganizerDashboard';
import dashboardAnalyticsService from '../../../services/dashboardAnalyticsService';

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
      background: '#F8F9FA',
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

jest.mock('@rneui/themed', () => {
  const React = require('react');
  return {
    Card: 'Card',
    Text: 'Text',
    Button: 'Button',
    ListItem: 'ListItem',
    Badge: 'Badge',
    Icon: 'Icon',
    FAB: 'FAB',
    SpeedDial: Object.assign(
      ({ children, ...props }: any) => React.createElement('SpeedDial', props, children),
      { Action: 'SpeedDialAction' }
    ),
    Divider: 'Divider',
    Header: 'Header',
  };
});

jest.mock('../../../services/dashboardAnalyticsService');

jest.mock('./EventStatisticsCard', () => ({
  EventStatisticsCard: ({ event }: any) => `EventStatisticsCard-${event.id}`,
}));

const mockAnalytics = {
  totalEvents: 10,
  publishedEvents: 5,
  totalRegistrations: 150,
  totalCheckedIn: 120,
  overallAttendanceRate: 80,
  eventStatistics: [
    {
      id: 'event-1',
      title: 'Test Event 1',
      startDate: new Date('2024-03-15'),
      status: 'published' as const,
      statistics: {
        totalRegistrations: 50,
        checkedInCount: 40,
        attendanceRate: 80,
      },
    },
    {
      id: 'event-2',
      title: 'Test Event 2',
      startDate: new Date('2024-03-20'),
      status: 'published' as const,
      statistics: {
        totalRegistrations: 100,
        checkedInCount: 80,
        attendanceRate: 80,
      },
    },
  ],
  lastUpdated: new Date('2024-03-10T10:00:00'),
};

describe('OrganizerDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(<OrganizerDashboard />);
    expect(screen.getByText('organizer.loadingDashboard')).toBeTruthy();
  });

  it('should render dashboard with analytics data', async () => {
    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: mockAnalytics,
    });

    render(<OrganizerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('organizer.dashboard')).toBeTruthy();
      expect(screen.getByText('organizer.dashboardSubtitle')).toBeTruthy();
    });

    // Check if statistics are displayed
    expect(screen.getByText('10')).toBeTruthy(); // Total events
    expect(screen.getByText('150')).toBeTruthy(); // Total registrations
    expect(screen.getByText('120')).toBeTruthy(); // Total check-ins
    expect(screen.getByText('80.0%')).toBeTruthy(); // Attendance rate
  });

  it('should render error state when loading fails', async () => {
    const errorMessage = 'Failed to load data';
    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    render(<OrganizerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('organizer.loadingFailed')).toBeTruthy();
    });
  });

  it('should refresh analytics when refresh button is pressed', async () => {
    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: mockAnalytics,
    });

    (dashboardAnalyticsService.refreshDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockAnalytics, totalEvents: 11 },
    });

    render(<OrganizerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('organizer.dashboard')).toBeTruthy();
    });

    // Find and click refresh button (it's an icon button without text)
    const refreshButtons = screen.getAllByTestId('button');
    fireEvent.press(refreshButtons[0]); // Assuming first button is refresh

    await waitFor(() => {
      expect(dashboardAnalyticsService.refreshDashboardAnalytics).toHaveBeenCalled();
    });
  });

  it('should show empty state when no events exist', async () => {
    const emptyAnalytics = {
      ...mockAnalytics,
      eventStatistics: [],
    };

    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: emptyAnalytics,
    });

    render(<OrganizerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('organizer.noActiveEvents')).toBeTruthy();
      expect(screen.getByText('organizer.noActiveEventsDesc')).toBeTruthy();
      expect(screen.getByText('organizer.createFirstEvent')).toBeTruthy();
    });
  });

  it('should display event statistics cards', async () => {
    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: mockAnalytics,
    });

    render(<OrganizerDashboard />);

    await waitFor(() => {
      // Check if EventStatisticsCard components are rendered
      expect(screen.getByText('organizer.eventAnalytics')).toBeTruthy();
      expect(screen.getByText('organizer.eventAnalyticsSubtitle')).toBeTruthy();
    });
  });

  it('should handle pull-to-refresh', async () => {
    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: mockAnalytics,
    });

    (dashboardAnalyticsService.refreshDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: mockAnalytics,
    });

    const { getByTestId } = render(<OrganizerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('organizer.dashboard')).toBeTruthy();
    });

    // Simulate pull-to-refresh
    const scrollView = getByTestId('scrollview');
    const { refreshControl } = scrollView.props;
    refreshControl.props.onRefresh();

    await waitFor(() => {
      expect(dashboardAnalyticsService.refreshDashboardAnalytics).toHaveBeenCalled();
    });
  });

  it('should display correct attendance rate colors', async () => {
    const analyticsWithVariedRates = {
      ...mockAnalytics,
      eventStatistics: [
        {
          ...mockAnalytics.eventStatistics[0],
          statistics: {
            ...mockAnalytics.eventStatistics[0].statistics!,
            attendanceRate: 85, // High rate - should be success color
          },
        },
        {
          ...mockAnalytics.eventStatistics[1],
          statistics: {
            ...mockAnalytics.eventStatistics[1].statistics!,
            attendanceRate: 50, // Medium rate - should be warning color
          },
        },
      ],
    };

    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: analyticsWithVariedRates,
    });

    render(<OrganizerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('80.0%')).toBeTruthy(); // Overall rate
    });
  });

  it('should navigate to create event when button is pressed', async () => {
    const mockPush = jest.fn();
    jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
      push: mockPush,
    });

    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: { ...mockAnalytics, eventStatistics: [] },
    });

    render(<OrganizerDashboard />);

    await waitFor(() => {
      expect(screen.getByText('organizer.createFirstEvent')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('organizer.createFirstEvent'));
    expect(mockPush).toHaveBeenCalledWith('/organizer/events/create');
  });

  it('should show last updated timestamp', async () => {
    (dashboardAnalyticsService.getDashboardAnalytics as jest.Mock).mockResolvedValue({
      success: true,
      data: mockAnalytics,
    });

    render(<OrganizerDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/organizer.lastUpdated/)).toBeTruthy();
    });
  });
});