import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'expo-router';
import RegistrationConfirmationPage from './RegistrationConfirmationPage';
import registrationService from '../../../services/registrationService';

// Mock the router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock the registration service
jest.mock('../../../services/registrationService', () => ({
  getRegistration: jest.fn(),
}));

// Mock Chakra UI toast
const mockToast = jest.fn();
// Removed ChakraUI mock

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockRegistration = {
  id: 'registration-123',
  userId: 'user-123',
  eventId: 'event-123',
  status: 'paid' as const,
  paymentStatus: 'completed' as const,
  qrCode: 'data:image/png;base64,test-qr-code',
  totalAmount: 1200,
  discountAmount: 200,
  finalAmount: 1000,
  ticketSelections: [
    { ticketTypeId: 'ticket-1', quantity: 2, price: 500 },
  ],
  customFieldValues: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  event: {
    id: 'event-123',
    title: 'Test Event',
    startDate: new Date('2024-12-25'),
    location: 'Test Venue',
    organizerId: 'organizer-123',
    categoryId: 'category-123',
    venueId: 'venue-123',
    description: 'Test Description',
    endDate: new Date('2024-12-25'),
    status: 'published' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe('RegistrationConfirmationPage', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (registrationService.getRegistration as jest.Mock).mockClear();
    mockRouter.push.mockClear();
    mockToast.mockClear();
  });

  it('renders loading state initially', () => {
    (registrationService.getRegistration as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<RegistrationConfirmationPage registrationId="test-id" />);

    expect(screen.getByText('載入報名資訊中...')).toBeInTheDocument();
  });

  it('renders registration confirmation after loading', async () => {
    (registrationService.getRegistration as jest.Mock).mockResolvedValue(mockRegistration);

    render(<RegistrationConfirmationPage registrationId="registration-123" />);

    await waitFor(() => {
      expect(screen.getByText('報名成功！')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Venue')).toBeInTheDocument();
    expect(screen.getByText('NT$ 1,000')).toBeInTheDocument();
    expect(screen.getByText('已付款完成')).toBeInTheDocument();
  });

  it('renders error state when registration fails to load', async () => {
    const errorMessage = 'Failed to load registration';
    (registrationService.getRegistration as jest.Mock).mockRejectedValue(new Error(errorMessage));

    render(<RegistrationConfirmationPage registrationId="test-id" />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays QR code when available', async () => {
    (registrationService.getRegistration as jest.Mock).mockResolvedValue(mockRegistration);

    render(<RegistrationConfirmationPage registrationId="registration-123" />);

    await waitFor(() => {
      const qrImage = screen.getByAltText('活動入場 QR Code');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', mockRegistration.qrCode);
    });
  });

  it('shows discount information when available', async () => {
    (registrationService.getRegistration as jest.Mock).mockResolvedValue(mockRegistration);

    render(<RegistrationConfirmationPage registrationId="registration-123" />);

    await waitFor(() => {
      expect(screen.getByText('NT$ 1,200')).toBeInTheDocument(); // Original amount
      expect(screen.getByText('-NT$ 200')).toBeInTheDocument(); // Discount
      expect(screen.getByText('NT$ 1,000')).toBeInTheDocument(); // Final amount
    });
  });

  it('handles navigation to tickets page', async () => {
    (registrationService.getRegistration as jest.Mock).mockResolvedValue(mockRegistration);

    render(<RegistrationConfirmationPage registrationId="registration-123" />);

    await waitFor(() => {
      const viewTicketsButton = screen.getByText('查看我的票券');
      expect(viewTicketsButton).toBeInTheDocument();
    });

    // Note: Testing button click would require more complex setup with user events
    // This test focuses on rendering and basic functionality
  });

  it('handles registration without QR code', async () => {
    const registrationWithoutQR = { ...mockRegistration, qrCode: null };
    (registrationService.getRegistration as jest.Mock).mockResolvedValue(registrationWithoutQR);

    render(<RegistrationConfirmationPage registrationId="registration-123" />);

    await waitFor(() => {
      expect(screen.getByText('QR Code 生成中...')).toBeInTheDocument();
    });
  });

  it('displays ticket selection information', async () => {
    (registrationService.getRegistration as jest.Mock).mockResolvedValue(mockRegistration);

    render(<RegistrationConfirmationPage registrationId="registration-123" />);

    await waitFor(() => {
      expect(screen.getByText('2 張 × NT$ 500')).toBeInTheDocument();
    });
  });
});