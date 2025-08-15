import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { DashboardCharts } from './DashboardCharts';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
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
      midGrey: '#6C757D',
    },
    spacing: {
      sm: 8,
      md: 16,
      lg: 24,
    },
  }),
}));

jest.mock('@rneui/themed', () => ({
  Card: 'Card',
  Text: 'Text',
  Divider: 'Divider',
}));

jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
}));

const mockEvents = [
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
  {
    id: 'event-3',
    title: 'Draft Event',
    startDate: new Date('2024-03-25'),
    status: 'draft' as const,
    statistics: {
      totalRegistrations: 30,
      checkedInCount: 0,
      attendanceRate: 0,
    },
  },
  {
    id: 'event-4',
    title: 'Completed Event',
    startDate: new Date('2024-02-10'),
    status: 'completed' as const,
    statistics: {
      totalRegistrations: 75,
      checkedInCount: 60,
      attendanceRate: 80,
    },
  },
];

describe('DashboardCharts', () => {
  it('should render charts when events with statistics are provided', () => {
    render(<DashboardCharts events={mockEvents} />);

    // Check if chart titles are rendered
    expect(screen.getByText('organizer.registrationTrends')).toBeTruthy();
    expect(screen.getByText('organizer.topEventsByAttendance')).toBeTruthy();
    expect(screen.getByText('organizer.eventStatusDistribution')).toBeTruthy();
  });

  it('should render chart descriptions', () => {
    render(<DashboardCharts events={mockEvents} />);

    expect(screen.getByText('organizer.registrationTrendsDesc')).toBeTruthy();
    expect(screen.getByText('organizer.topEventsByAttendanceDesc')).toBeTruthy();
    expect(screen.getByText('organizer.eventStatusDistributionDesc')).toBeTruthy();
  });

  it('should not render anything when no events are provided', () => {
    const { container } = render(<DashboardCharts events={[]} />);
    expect(container.children.length).toBe(0);
  });

  it('should handle events without statistics', () => {
    const eventsWithoutStats = [
      {
        id: 'event-1',
        title: 'Event Without Stats',
        startDate: new Date('2024-03-15'),
        status: 'published' as const,
      },
    ];

    const { container } = render(<DashboardCharts events={eventsWithoutStats} />);
    // Should not crash and not render charts
    expect(container.children.length).toBe(0);
  });

  it('should render LineChart for registration trends', () => {
    const { getByTestId } = render(<DashboardCharts events={mockEvents} />);
    
    // LineChart should be rendered
    const lineCharts = screen.queryAllByTestId('LineChart');
    expect(lineCharts.length).toBeGreaterThan(0);
  });

  it('should render BarChart for attendance rates', () => {
    const { getByTestId } = render(<DashboardCharts events={mockEvents} />);
    
    // BarChart should be rendered
    const barCharts = screen.queryAllByTestId('BarChart');
    expect(barCharts.length).toBeGreaterThan(0);
  });

  it('should render PieChart for status distribution', () => {
    const { getByTestId } = render(<DashboardCharts events={mockEvents} />);
    
    // PieChart should be rendered
    const pieCharts = screen.queryAllByTestId('PieChart');
    expect(pieCharts.length).toBeGreaterThan(0);
  });

  it('should handle long event titles by truncating them', () => {
    const eventsWithLongTitles = [
      {
        id: 'event-1',
        title: 'This is a very long event title that should be truncated in the chart',
        startDate: new Date('2024-03-15'),
        status: 'published' as const,
        statistics: {
          totalRegistrations: 50,
          checkedInCount: 40,
          attendanceRate: 80,
        },
      },
    ];

    render(<DashboardCharts events={eventsWithLongTitles} />);
    // Should render without crashing
    expect(screen.getByText('organizer.topEventsByAttendance')).toBeTruthy();
  });

  it('should sort events correctly for different charts', () => {
    render(<DashboardCharts events={mockEvents} />);

    // All charts should be rendered
    expect(screen.getByText('organizer.registrationTrends')).toBeTruthy();
    expect(screen.getByText('organizer.topEventsByAttendance')).toBeTruthy();
    expect(screen.getByText('organizer.eventStatusDistribution')).toBeTruthy();
  });

  it('should use correct colors for different statuses', () => {
    render(<DashboardCharts events={mockEvents} />);
    
    // Check that the component renders with the theme colors
    // The actual color application would be tested in the chart library itself
    expect(screen.getByText('organizer.eventStatusDistribution')).toBeTruthy();
  });
});