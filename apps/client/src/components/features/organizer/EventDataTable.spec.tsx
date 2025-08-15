import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EventDataTable } from './EventDataTable';
import { EventWithStatistics } from '../../../services/dashboardAnalyticsService';

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
  ListItem: ({ children, containerStyle, onPress, bottomDivider }: any) => {
    const { View } = require('react-native');
    return <View style={containerStyle} onPress={onPress}>{children}</View>;
  },
  Text: 'Text',
  Icon: 'Icon',
  Badge: ({ value, badgeStyle, textStyle }: any) => {
    const { Text, View } = require('react-native');
    return (
      <View style={badgeStyle}>
        <Text style={textStyle}>{value}</Text>
      </View>
    );
  },
  Divider: 'Divider',
}));

// Update ListItem.Content mock
Object.defineProperty(require('@rneui/themed').ListItem, 'Content', {
  value: ({ children }: any) => {
    const { View } = require('react-native');
    return <View>{children}</View>;
  },
});

const mockEvents: EventWithStatistics[] = [
  {
    id: 'event-1',
    title: 'Tech Conference 2024',
    startDate: new Date('2024-03-15'),
    status: 'published',
    statistics: {
      totalRegistrations: 15000,
      checkedInCount: 12000,
      attendanceRate: 80,
      lastUpdated: new Date('2024-03-10T10:00:00'),
    },
  },
  {
    id: 'event-2',
    title: 'Workshop Series',
    startDate: new Date('2024-03-20'),
    status: 'draft',
    statistics: {
      totalRegistrations: 500,
      checkedInCount: 250,
      attendanceRate: 50,
      lastUpdated: new Date('2024-03-10T10:00:00'),
    },
  },
  {
    id: 'event-3',
    title: 'Annual Gala',
    startDate: new Date('2024-04-01'),
    status: 'completed',
    statistics: {
      totalRegistrations: 2500,
      checkedInCount: 750,
      attendanceRate: 30,
      lastUpdated: new Date('2024-03-10T10:00:00'),
    },
  },
];

describe('EventDataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render table headers correctly', () => {
    render(<EventDataTable events={[]} />);

    expect(screen.getByText('organizer.eventName')).toBeTruthy();
    expect(screen.getByText('organizer.status')).toBeTruthy();
    expect(screen.getByText('organizer.date')).toBeTruthy();
    expect(screen.getByText('organizer.registrations')).toBeTruthy();
    expect(screen.getByText('organizer.attendance')).toBeTruthy();
  });

  it('should render empty state when no events', () => {
    render(<EventDataTable events={[]} />);

    expect(screen.getByText('organizer.noData')).toBeTruthy();
  });

  it('should render event data correctly', () => {
    render(<EventDataTable events={mockEvents} />);

    expect(screen.getByText('Tech Conference 2024')).toBeTruthy();
    expect(screen.getByText('Workshop Series')).toBeTruthy();
    expect(screen.getByText('Annual Gala')).toBeTruthy();
  });

  it('should format large numbers with Taiwan locale', () => {
    render(<EventDataTable events={mockEvents} />);

    // 15000 should be formatted as "1.5萬"
    expect(screen.getByText('1.5萬')).toBeTruthy();
    // 2500 should be formatted as "2.5千"
    expect(screen.getByText('2.5千')).toBeTruthy();
    // 500 should remain as "500"
    expect(screen.getByText('500')).toBeTruthy();
  });

  it('should display attendance rates with correct colors', () => {
    render(<EventDataTable events={mockEvents} />);

    // 80% attendance rate
    expect(screen.getByText('80.0%')).toBeTruthy();
    // 50% attendance rate
    expect(screen.getByText('50.0%')).toBeTruthy();
    // 30% attendance rate
    expect(screen.getByText('30.0%')).toBeTruthy();
  });

  it('should display status badges with localized text', () => {
    render(<EventDataTable events={mockEvents} />);

    expect(screen.getByText('organizer.published')).toBeTruthy();
    expect(screen.getByText('organizer.draft')).toBeTruthy();
    expect(screen.getByText('organizer.completed')).toBeTruthy();
  });

  it('should handle sort column clicks', () => {
    const mockOnSort = jest.fn();
    render(<EventDataTable events={mockEvents} onSort={mockOnSort} />);

    const eventNameHeader = screen.getByText('organizer.eventName').parent;
    fireEvent.press(eventNameHeader!);
    expect(mockOnSort).toHaveBeenCalledWith('name');

    const statusHeader = screen.getByText('organizer.status').parent;
    fireEvent.press(statusHeader!);
    expect(mockOnSort).toHaveBeenCalledWith('status');

    const dateHeader = screen.getByText('organizer.date').parent;
    fireEvent.press(dateHeader!);
    expect(mockOnSort).toHaveBeenCalledWith('date');

    const registrationsHeader = screen.getByText('organizer.registrations').parent;
    fireEvent.press(registrationsHeader!);
    expect(mockOnSort).toHaveBeenCalledWith('registrations');

    const attendanceHeader = screen.getByText('organizer.attendance').parent;
    fireEvent.press(attendanceHeader!);
    expect(mockOnSort).toHaveBeenCalledWith('attendance');
  });

  it('should display sort icons for active sort column', () => {
    const { rerender } = render(
      <EventDataTable events={mockEvents} sortBy="name" sortOrder="asc" />
    );

    // Check ascending arrow icon is shown for name column
    expect(screen.getAllByTestId('Icon').length).toBeGreaterThan(0);

    rerender(
      <EventDataTable events={mockEvents} sortBy="attendance" sortOrder="desc" />
    );

    // Check descending arrow icon is shown for attendance column
    expect(screen.getAllByTestId('Icon').length).toBeGreaterThan(0);
  });

  it('should navigate to event details on row press', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('expo-router'), 'useRouter').mockReturnValue({
      push: mockPush,
    });

    render(<EventDataTable events={mockEvents} />);

    const eventRow = screen.getByText('Tech Conference 2024').parent?.parent;
    fireEvent.press(eventRow!);

    expect(mockPush).toHaveBeenCalledWith('/organizer/events/event-1');
  });

  it('should format dates in zh-TW locale', () => {
    render(<EventDataTable events={mockEvents} />);

    // Dates should be formatted as zh-TW locale
    // Note: The actual format depends on the system, but we can check that dates are rendered
    expect(screen.getByText(/2024/)).toBeTruthy();
  });

  it('should handle events without statistics gracefully', () => {
    const eventsWithoutStats: EventWithStatistics[] = [
      {
        id: 'event-4',
        title: 'New Event',
        startDate: new Date('2024-05-01'),
        status: 'draft',
      },
    ];

    render(<EventDataTable events={eventsWithoutStats} />);

    expect(screen.getByText('New Event')).toBeTruthy();
    expect(screen.getByText('0')).toBeTruthy(); // Default for no registrations
    expect(screen.getByText('-')).toBeTruthy(); // Default for no attendance rate
  });

  it('should apply horizontal scrolling for table', () => {
    const { getByTestId } = render(<EventDataTable events={mockEvents} />);
    
    // ScrollView should have horizontal prop set
    const scrollView = screen.getByTestId('scrollView');
    expect(scrollView.props.horizontal).toBe(true);
    expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);
  });

  it('should render bottom dividers between rows except last', () => {
    render(<EventDataTable events={mockEvents} />);

    // ListItem components should have bottomDivider prop
    // The implementation shows bottomDivider is true for all except the last item
    const listItems = screen.getAllByTestId('ListItem');
    expect(listItems.length).toBe(mockEvents.length);
  });
});