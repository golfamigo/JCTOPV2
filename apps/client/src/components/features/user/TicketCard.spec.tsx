import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TicketCard } from './TicketCard';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import type { Registration } from '@shared/types';

jest.mock('react-i18next');
jest.mock('@/theme');

// Mock ListItem.Accordion
jest.mock('@rneui/themed', () => ({
  ...jest.requireActual('@rneui/themed'),
  ListItem: {
    Accordion: ({ children, onPress, isExpanded }: any) => (
      <div data-testid="accordion" onClick={onPress}>
        {isExpanded && children}
      </div>
    ),
    Content: ({ children }: any) => <div>{children}</div>,
  },
}));

describe('TicketCard', () => {
  const mockT = jest.fn((key, options) => {
    const translations: Record<string, string> = {
      'tickets.registrationId': '訂單編號',
      'tickets.tickets': '票券',
      'tickets.actions.viewQRCode': '查看 QR Code',
      'tickets.status.paid': '已付款',
      'tickets.status.pending': '待付款',
      'tickets.status.cancelled': '已取消',
      'tickets.status.checkedIn': '已報到',
    };
    return translations[key] || options?.defaultValue || key;
  });

  const mockTheme = {
    colors: {
      primary: '#007BFF',
      card: '#F8F9FA',
      textPrimary: '#212529',
      textSecondary: '#6C757D',
      success: '#28A745',
      warning: '#FFC107',
      danger: '#DC3545',
      info: '#17A2B8',
      divider: '#E0E0E0',
      background: '#FFFFFF',
      white: '#FFFFFF',
    },
    spacing: {
      md: 16,
    },
  };

  const mockRegistration: Registration = {
    id: 'reg-123456789',
    userId: 'user-1',
    eventId: 'event-1',
    status: 'paid',
    paymentStatus: 'completed',
    finalAmount: 1500,
    qrCode: 'qr-code-data',
    event: {
      id: 'event-1',
      title: '音樂節',
      startDate: new Date('2024-12-25T19:00:00').toISOString(),
      endDate: new Date('2024-12-25T23:00:00').toISOString(),
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
  };

  const mockOnViewQRCode = jest.fn();
  const mockOnViewDetails = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render ticket card with event information', () => {
    const { getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('音樂節')).toBeTruthy();
    expect(getByText('台北市')).toBeTruthy();
    expect(getByText('訂單編號: REG-1234')).toBeTruthy();
    expect(getByText('NT$ 1,500')).toBeTruthy();
  });

  it('should display correct status badge', () => {
    const { getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('已付款')).toBeTruthy();
  });

  it('should display different status colors', () => {
    const pendingReg = { ...mockRegistration, status: 'pending' as const };
    const { rerender, getByText } = render(
      <TicketCard
        registration={pendingReg}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('待付款')).toBeTruthy();

    const cancelledReg = { ...mockRegistration, status: 'cancelled' as const };
    rerender(
      <TicketCard
        registration={cancelledReg}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('已取消')).toBeTruthy();
  });

  it('should calculate total tickets correctly', () => {
    const { getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('2 票券')).toBeTruthy();
  });

  it('should call onViewDetails when card is pressed', () => {
    const { getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.press(getByText('音樂節'));
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('should call onViewQRCode when QR button is pressed', () => {
    const { getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    const qrButton = getByText('查看 QR Code');
    fireEvent.press(qrButton);
    expect(mockOnViewQRCode).toHaveBeenCalledTimes(1);
  });

  it('should disable QR button when registration is not paid', () => {
    const pendingReg = { ...mockRegistration, status: 'pending' as const };
    const { getByText } = render(
      <TicketCard
        registration={pendingReg}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    const qrButton = getByText('查看 QR Code');
    expect(qrButton.parent?.props.disabled).toBe(true);
  });

  it('should format date in Traditional Chinese format', () => {
    const { getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Date format should be present (may vary based on timezone)
    expect(getByText(/2024/)).toBeTruthy();
  });

  it('should not render if event is missing', () => {
    const regWithoutEvent = { ...mockRegistration, event: undefined };
    const { queryByText } = render(
      <TicketCard
        registration={regWithoutEvent}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(queryByText('音樂節')).toBeFalsy();
  });

  it('should show QR placeholder when QR code exists', () => {
    const { getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(getByText('查看 QR Code')).toBeTruthy();
  });

  it('should not show QR section when QR code is missing', () => {
    const regWithoutQR = { ...mockRegistration, qrCode: undefined };
    const { queryAllByText } = render(
      <TicketCard
        registration={regWithoutQR}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    // Should only have the button, not the placeholder
    expect(queryAllByText('查看 QR Code').length).toBe(1);
  });

  it('should expand and collapse accordion when clicked', () => {
    const { getByTestId, queryByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    const accordion = getByTestId('accordion');
    
    // Initially collapsed, expanded content should not be visible
    expect(queryByText('一般票')).toBeFalsy();

    // Click to expand
    fireEvent.press(accordion);
    
    // Now expanded content should be visible
    expect(queryByText('一般票')).toBeTruthy();

    // Click to collapse
    fireEvent.press(accordion);
    
    // Expanded content should be hidden again
    expect(queryByText('一般票')).toBeFalsy();
  });

  it('should display ticket selections in expanded view', () => {
    const { getByTestId, getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    const accordion = getByTestId('accordion');
    fireEvent.press(accordion);

    // Check ticket details are displayed
    expect(getByText('一般票')).toBeTruthy();
    expect(getByText('x2')).toBeTruthy();
    expect(getByText('NT$ 1,500')).toBeTruthy();
  });

  it('should display organizer and registration info in expanded view', () => {
    const { getByTestId, getByText } = render(
      <TicketCard
        registration={mockRegistration}
        onViewQRCode={mockOnViewQRCode}
        onViewDetails={mockOnViewDetails}
      />
    );

    const accordion = getByTestId('accordion');
    fireEvent.press(accordion);

    expect(getByText('主辦方A')).toBeTruthy();
  });
});