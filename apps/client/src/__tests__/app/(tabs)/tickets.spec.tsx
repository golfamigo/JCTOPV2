import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TicketsScreen from './tickets';
import registrationService from '@/services/registrationService';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

jest.mock('@/services/registrationService');
jest.mock('react-i18next');
jest.mock('@/theme');

const mockRegistrations = [
  {
    id: 'reg1',
    userId: 'user1',
    eventId: 'event1',
    status: 'paid',
    paymentStatus: 'completed',
    finalAmount: 1500,
    qrCode: 'qr-code-1',
    event: {
      id: 'event1',
      title: '音樂節',
      startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endDate: new Date(Date.now() + 90000000).toISOString(),
      location: '台北市',
      organizerName: '主辦方A',
    },
    ticketSelections: [
      {
        ticketTypeId: 'tt1',
        quantity: 2,
        ticketType: {
          id: 'tt1',
          name: '一般票',
          price: 750,
        },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'reg2',
    userId: 'user1',
    eventId: 'event2',
    status: 'paid',
    paymentStatus: 'completed',
    finalAmount: 2000,
    qrCode: 'qr-code-2',
    event: {
      id: 'event2',
      title: '技術研討會',
      startDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday (past)
      endDate: new Date(Date.now() - 43200000).toISOString(),
      location: '新竹市',
      organizerName: '主辦方B',
    },
    ticketSelections: [
      {
        ticketTypeId: 'tt2',
        quantity: 1,
        ticketType: {
          id: 'tt2',
          name: 'VIP票',
          price: 2000,
        },
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe('TicketsScreen', () => {
  const mockT = jest.fn((key, options) => {
    const translations = {
      'tickets.title': '我的票券',
      'tickets.upcoming': '即將到來',
      'tickets.past': '已結束',
      'tickets.noUpcomingTickets': '沒有即將到來的活動票券',
      'tickets.noPastTickets': '沒有已結束的活動票券',
      'common.error': '發生錯誤',
      'common.retry': '重試',
    };
    return translations[key] || options?.defaultValue || key;
  });

  const mockTheme = {
    colors: {
      primary: '#007BFF',
      background: '#FFFFFF',
      card: '#F8F9FA',
      textPrimary: '#212529',
      textSecondary: '#6C757D',
      danger: '#DC3545',
    },
    spacing: {
      md: 16,
      lg: 24,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render the tickets screen with tabs', () => {
    (registrationService.getUserRegistrations as jest.Mock).mockResolvedValue([]);
    
    const { getByText } = render(<TicketsScreen />);
    
    expect(getByText('我的票券')).toBeTruthy();
    expect(getByText('即將到來')).toBeTruthy();
    expect(getByText('已結束')).toBeTruthy();
  });

  it('should fetch registrations on mount', async () => {
    (registrationService.getUserRegistrations as jest.Mock).mockResolvedValue(mockRegistrations);
    
    render(<TicketsScreen />);
    
    await waitFor(() => {
      expect(registrationService.getUserRegistrations).toHaveBeenCalledTimes(1);
    });
  });

  it('should display loading state initially', () => {
    (registrationService.getUserRegistrations as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );
    
    const { getAllByTestId } = render(<TicketsScreen />);
    
    // Check for skeleton loaders
    const skeletons = getAllByTestId('RNE__Skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display error state when fetch fails', async () => {
    (registrationService.getUserRegistrations as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );
    
    const { getByText } = render(<TicketsScreen />);
    
    await waitFor(() => {
      expect(getByText('發生錯誤')).toBeTruthy();
      expect(getByText('重試')).toBeTruthy();
    });
  });

  it('should display empty state for upcoming tickets', async () => {
    (registrationService.getUserRegistrations as jest.Mock).mockResolvedValue([]);
    
    const { getByText } = render(<TicketsScreen />);
    
    await waitFor(() => {
      expect(getByText('沒有即將到來的活動票券')).toBeTruthy();
    });
  });

  it('should switch between upcoming and past tabs', async () => {
    (registrationService.getUserRegistrations as jest.Mock).mockResolvedValue(mockRegistrations);
    
    const { getByText, queryByText } = render(<TicketsScreen />);
    
    await waitFor(() => {
      expect(getByText('音樂節')).toBeTruthy();
    });
    
    // Switch to past tab
    fireEvent.press(getByText('已結束'));
    
    await waitFor(() => {
      expect(getByText('技術研討會')).toBeTruthy();
      expect(queryByText('音樂節')).toBeFalsy();
    });
  });

  it('should refresh registrations on pull to refresh', async () => {
    (registrationService.getUserRegistrations as jest.Mock).mockResolvedValue(mockRegistrations);
    
    const { getByTestId } = render(<TicketsScreen />);
    
    await waitFor(() => {
      expect(registrationService.getUserRegistrations).toHaveBeenCalledTimes(1);
    });
    
    // Trigger refresh
    const scrollView = getByTestId('scrollView');
    const { refreshControl } = scrollView.props;
    refreshControl.props.onRefresh();
    
    await waitFor(() => {
      expect(registrationService.getUserRegistrations).toHaveBeenCalledTimes(2);
    });
  });

  it('should retry fetching on error retry button press', async () => {
    (registrationService.getUserRegistrations as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockRegistrations);
    
    const { getByText } = render(<TicketsScreen />);
    
    await waitFor(() => {
      expect(getByText('重試')).toBeTruthy();
    });
    
    fireEvent.press(getByText('重試'));
    
    await waitFor(() => {
      expect(registrationService.getUserRegistrations).toHaveBeenCalledTimes(2);
    });
  });

  it('should filter registrations correctly by date', async () => {
    (registrationService.getUserRegistrations as jest.Mock).mockResolvedValue(mockRegistrations);
    
    const { getByText, queryByText } = render(<TicketsScreen />);
    
    await waitFor(() => {
      // Upcoming tab should show future event
      expect(getByText('音樂節')).toBeTruthy();
      expect(queryByText('技術研討會')).toBeFalsy();
    });
    
    // Switch to past tab
    fireEvent.press(getByText('已結束'));
    
    await waitFor(() => {
      // Past tab should show past event
      expect(getByText('技術研討會')).toBeTruthy();
      expect(queryByText('音樂節')).toBeFalsy();
    });
  });
});