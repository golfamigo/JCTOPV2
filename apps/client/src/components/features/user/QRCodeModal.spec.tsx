import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QRCodeModal } from './QRCodeModal';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import type { Registration } from '@shared/types';

jest.mock('react-i18next');
jest.mock('@/theme');
jest.mock('react-native-qrcode-svg', () => 'QRCode');

describe('QRCodeModal', () => {
  const mockT = jest.fn((key, options) => {
    const translations: Record<string, string> = {
      'tickets.qrCode': 'QR Code',
      'tickets.registrationId': '訂單編號',
      'tickets.ticketDetails': '票券詳情',
      'tickets.ticket': '票券',
      'tickets.qrCodeInstruction': '請在入場時出示此 QR Code',
      'tickets.actions.downloadTicket': '下載票券',
      'tickets.actions.shareTicket': '分享票券',
    };
    return translations[key] || options?.defaultValue || key;
  });

  const mockTheme = {
    colors: {
      primary: '#007BFF',
      card: '#F8F9FA',
      textPrimary: '#212529',
      textSecondary: '#6C757D',
      white: '#FFFFFF',
      divider: '#E0E0E0',
      info: '#17A2B8',
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
    qrCode: 'https://example.com/qr/reg-123456789',
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

  const mockOnClose = jest.fn();
  const mockOnDownload = jest.fn();
  const mockOnShare = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTranslation as jest.Mock).mockReturnValue({ t: mockT });
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render modal when visible', () => {
    const { getByText } = render(
      <QRCodeModal
        visible={true}
        registration={mockRegistration}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    expect(getByText('QR Code')).toBeTruthy();
    expect(getByText('音樂節')).toBeTruthy();
    expect(getByText('台北市')).toBeTruthy();
    expect(getByText('訂單編號: REG-1234')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <QRCodeModal
        visible={false}
        registration={mockRegistration}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    expect(queryByText('QR Code')).toBeFalsy();
  });

  it('should not render when registration is null', () => {
    const { queryByText } = render(
      <QRCodeModal
        visible={true}
        registration={null}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    expect(queryByText('QR Code')).toBeFalsy();
  });

  it('should not render when QR code is missing', () => {
    const regWithoutQR = { ...mockRegistration, qrCode: undefined };
    const { queryByText } = render(
      <QRCodeModal
        visible={true}
        registration={regWithoutQR}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    expect(queryByText('QR Code')).toBeFalsy();
  });

  it('should call onClose when backdrop is pressed', () => {
    const { getByTestId } = render(
      <QRCodeModal
        visible={true}
        registration={mockRegistration}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    // Overlay component typically has a backdrop press handler
    const backdrop = getByTestId('RNE__Overlay__backdrop');
    fireEvent.press(backdrop);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when close button is pressed', () => {
    const { getByTestId } = render(
      <QRCodeModal
        visible={true}
        registration={mockRegistration}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    // Find close button by its icon
    const closeButton = getByTestId('close-button');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display ticket details', () => {
    const { getByText } = render(
      <QRCodeModal
        visible={true}
        registration={mockRegistration}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    expect(getByText('票券詳情')).toBeTruthy();
    expect(getByText('一般票')).toBeTruthy();
    expect(getByText('x2')).toBeTruthy();
  });

  it('should display instruction text', () => {
    const { getByText } = render(
      <QRCodeModal
        visible={true}
        registration={mockRegistration}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    expect(getByText('請在入場時出示此 QR Code')).toBeTruthy();
  });

  it('should render download button when onDownload is provided', () => {
    const { getByText } = render(
      <QRCodeModal
        visible={true}
        registration={mockRegistration}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    const downloadButton = getByText('下載票券');
    expect(downloadButton).toBeTruthy();
    
    fireEvent.press(downloadButton);
    expect(mockOnDownload).toHaveBeenCalledTimes(1);
  });

  it('should render share button when onShare is provided', () => {
    const { getByText } = render(
      <QRCodeModal
        visible={true}
        registration={mockRegistration}
        onClose={mockOnClose}
        onDownload={mockOnDownload}
        onShare={mockOnShare}
      />
    );

    const shareButton = getByText('分享票券');
    expect(shareButton).toBeTruthy();
    
    fireEvent.press(shareButton);
    expect(mockOnShare).toHaveBeenCalledTimes(1);
  });

  it('should not render action buttons when handlers are not provided', () => {
    const { queryByText } = render(
      <QRCodeModal
        visible={true}
        registration={mockRegistration}
        onClose={mockOnClose}
      />
    );

    expect(queryByText('下載票券')).toBeFalsy();
    expect(queryByText('分享票券')).toBeFalsy();
  });
});