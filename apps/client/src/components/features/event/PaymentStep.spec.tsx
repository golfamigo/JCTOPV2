import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ChakraProvider } from '@chakra-ui/react';
import PaymentStep from './PaymentStep';
import { Event, RegistrationFormData } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';
import theme from '../../../theme';

// Mock the payment service
jest.mock('../../../services/paymentService');
const mockPaymentService = paymentService as jest.Mocked<typeof paymentService>;

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock Expo Linking
jest.mock('expo-linking', () => ({
  openURL: jest.fn(),
}));

const mockEvent: Event = {
  id: 'event-1',
  organizerId: 'org-1',
  title: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  startDate: new Date('2024-12-01T10:00:00Z'),
  endDate: new Date('2024-12-01T18:00:00Z'),
  ticketTypes: [
    {
      id: 'ticket-1',
      name: 'General Admission',
      description: 'Standard ticket',
      price: 1000,
      quantity: 100,
      soldQuantity: 10,
      isActive: true,
      features: ['Entry to event'],
      metadata: {},
    },
  ],
  customFields: [],
  registrationSettings: {
    requiresApproval: false,
    maxRegistrations: 100,
    registrationDeadline: new Date('2024-11-30T23:59:59Z'),
    allowCancellation: true,
    cancellationDeadline: new Date('2024-11-25T23:59:59Z'),
  },
  paymentSettings: {
    requiresPayment: true,
    currency: 'TWD',
    acceptedMethods: ['credit_card'],
    processingFee: 0,
    refundPolicy: 'Standard refund policy',
  },
  status: 'published',
  imageUrl: 'https://example.com/image.jpg',
  tags: ['test'],
  category: 'conference',
  visibility: 'public',
  maxAttendees: 100,
  currentAttendees: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  organizer: {
    id: 'org-1',
    name: 'Test Organizer',
    email: 'test@example.com',
    avatar: null,
  },
};

const mockFormData: RegistrationFormData = {
  attendeeInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+886912345678',
  },
  ticketSelections: [
    {
      ticketTypeId: 'ticket-1',
      quantity: 2,
      unitPrice: 1000,
      totalPrice: 2000,
    },
  ],
  customFieldResponses: {},
  discountCode: null,
  totalAmount: 2000,
  finalAmount: 2000,
  agreedToTerms: true,
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider theme={theme}>
    {children}
  </ChakraProvider>
);

describe('PaymentStep', () => {
  const mockOnSuccess = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockPaymentService.initiatePayment.mockResolvedValue({
      paymentId: 'payment-123',
      status: 'requires_action',
      redirectUrl: 'https://payment.ecpay.com.tw/test',
      amount: 2000,
      currency: 'TWD',
      merchantTradeNo: 'PAY123456789',
      formData: {
        MerchantID: '2000132',
        MerchantTradeNo: 'PAY123456789',
        TotalAmount: '2000',
        TradeDesc: 'Test Event Registration',
        CheckMacValue: 'test-hash',
      },
    });
  });

  const renderPaymentStep = (props = {}) => {
    return render(
      <TestWrapper>
        <PaymentStep
          event={mockEvent}
          formData={mockFormData}
          onSuccess={mockOnSuccess}
          onBack={mockOnBack}
          isLoading={false}
          {...props}
        />
      </TestWrapper>
    );
  };

  describe('rendering', () => {
    it('should render payment step with event details', () => {
      renderPaymentStep();

      expect(screen.getByText('付款資訊')).toBeTruthy();
      expect(screen.getByText('Test Event')).toBeTruthy();
      expect(screen.getByText('NT$ 2,000')).toBeTruthy();
    });

    it('should render step indicator showing step 3', () => {
      renderPaymentStep();

      const stepIndicator = screen.getByText('付款');
      expect(stepIndicator).toBeTruthy();
    });

    it('should render attendee information', () => {
      renderPaymentStep();

      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('john.doe@example.com')).toBeTruthy();
    });

    it('should render ticket selection summary', () => {
      renderPaymentStep();

      expect(screen.getByText('General Admission')).toBeTruthy();
      expect(screen.getByText('數量: 2')).toBeTruthy();
      expect(screen.getByText('NT$ 1,000 × 2')).toBeTruthy();
    });

    it('should render payment method selection', () => {
      renderPaymentStep();

      expect(screen.getByText('選擇付款方式')).toBeTruthy();
      expect(screen.getByText('信用卡付款')).toBeTruthy();
    });

    it('should render action buttons', () => {
      renderPaymentStep();

      expect(screen.getByText('返回上一步')).toBeTruthy();
      expect(screen.getByText('確認付款')).toBeTruthy();
    });
  });

  describe('payment initiation', () => {
    it('should initiate payment when confirm button is clicked', async () => {
      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockPaymentService.initiatePayment).toHaveBeenCalledWith({
          organizerId: 'org-1',
          resourceType: 'event',
          resourceId: 'event-1',
          amount: 2000,
          currency: 'TWD',
          description: 'Test Event Registration',
          paymentMethod: 'Credit',
          attendeeInfo: mockFormData.attendeeInfo,
          ticketSelections: mockFormData.ticketSelections,
          metadata: {
            eventTitle: 'Test Event',
            attendeeEmail: 'john.doe@example.com',
          },
        });
      });
    });

    it('should call onSuccess when payment is initiated successfully', async () => {
      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({
          paymentId: 'payment-123',
          status: 'requires_action',
          redirectUrl: 'https://payment.ecpay.com.tw/test',
          amount: 2000,
          currency: 'TWD',
          merchantTradeNo: 'PAY123456789',
          formData: expect.any(Object),
        });
      });
    });

    it('should handle payment initiation errors', async () => {
      mockPaymentService.initiatePayment.mockRejectedValue(
        new Error('Payment service unavailable')
      );

      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('付款處理失敗')).toBeTruthy();
        expect(screen.getByText('Payment service unavailable')).toBeTruthy();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should disable confirm button while loading', () => {
      renderPaymentStep({ isLoading: true });

      const confirmButton = screen.getByText('確認付款');
      expect(confirmButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('should show loading state during payment initiation', async () => {
      let resolvePayment: (value: any) => void;
      const paymentPromise = new Promise((resolve) => {
        resolvePayment = resolve;
      });
      mockPaymentService.initiatePayment.mockReturnValue(paymentPromise);

      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      // Should show loading state
      await waitFor(() => {
        expect(confirmButton.props.accessibilityState?.disabled).toBe(true);
      });

      // Resolve the payment
      resolvePayment!({
        paymentId: 'payment-123',
        status: 'requires_action',
        redirectUrl: 'https://payment.ecpay.com.tw/test',
        amount: 2000,
        currency: 'TWD',
        merchantTradeNo: 'PAY123456789',
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('payment method selection', () => {
    it('should allow selecting different payment methods', () => {
      renderPaymentStep();

      // Initially credit card should be selected
      const creditCardOption = screen.getByText('信用卡付款');
      expect(creditCardOption).toBeTruthy();

      // If other payment methods were available, test selection here
      // For now, only credit card is implemented
    });

    it('should update payment request based on selected method', async () => {
      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(mockPaymentService.initiatePayment).toHaveBeenCalledWith(
          expect.objectContaining({
            paymentMethod: 'Credit',
          })
        );
      });
    });
  });

  describe('navigation', () => {
    it('should call onBack when back button is pressed', () => {
      renderPaymentStep();

      const backButton = screen.getByText('返回上一步');
      fireEvent.press(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should not allow navigation back while payment is processing', async () => {
      let resolvePayment: (value: any) => void;
      const paymentPromise = new Promise((resolve) => {
        resolvePayment = resolve;
      });
      mockPaymentService.initiatePayment.mockReturnValue(paymentPromise);

      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      const backButton = screen.getByText('返回上一步');
      expect(backButton.props.accessibilityState?.disabled).toBe(true);

      // Resolve payment
      resolvePayment!({
        paymentId: 'payment-123',
        status: 'requires_action',
        redirectUrl: 'https://payment.ecpay.com.tw/test',
        amount: 2000,
        currency: 'TWD',
        merchantTradeNo: 'PAY123456789',
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('form validation', () => {
    it('should validate required attendee information', () => {
      const invalidFormData = {
        ...mockFormData,
        attendeeInfo: {
          ...mockFormData.attendeeInfo,
          email: '', // Invalid email
        },
      };

      renderPaymentStep({ formData: invalidFormData });

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      // Should show validation error
      expect(screen.getByText('請檢查報名資訊')).toBeTruthy();
      expect(mockPaymentService.initiatePayment).not.toHaveBeenCalled();
    });

    it('should validate ticket selections', () => {
      const invalidFormData = {
        ...mockFormData,
        ticketSelections: [], // No tickets selected
      };

      renderPaymentStep({ formData: invalidFormData });

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      // Should show validation error
      expect(screen.getByText('請選擇至少一張票券')).toBeTruthy();
      expect(mockPaymentService.initiatePayment).not.toHaveBeenCalled();
    });

    it('should validate terms agreement', () => {
      const invalidFormData = {
        ...mockFormData,
        agreedToTerms: false, // Terms not agreed
      };

      renderPaymentStep({ formData: invalidFormData });

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      // Should show validation error
      expect(screen.getByText('請同意服務條款')).toBeTruthy();
      expect(mockPaymentService.initiatePayment).not.toHaveBeenCalled();
    });
  });

  describe('amount calculation', () => {
    it('should display correct total amount', () => {
      renderPaymentStep();

      expect(screen.getByText('NT$ 2,000')).toBeTruthy();
    });

    it('should handle discount codes', () => {
      const discountedFormData = {
        ...mockFormData,
        discountCode: 'SAVE10',
        totalAmount: 2000,
        finalAmount: 1800, // 10% discount
      };

      renderPaymentStep({ formData: discountedFormData });

      expect(screen.getByText('NT$ 1,800')).toBeTruthy();
      expect(screen.getByText('折扣: SAVE10')).toBeTruthy();
    });

    it('should handle processing fees', () => {
      const eventWithFees = {
        ...mockEvent,
        paymentSettings: {
          ...mockEvent.paymentSettings!,
          processingFee: 30,
        },
      };

      renderPaymentStep({ event: eventWithFees });

      expect(screen.getByText('處理費: NT$ 30')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    it('should have proper accessibility labels', () => {
      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      expect(confirmButton.props.accessibilityLabel).toBe('確認付款並前往付款頁面');

      const backButton = screen.getByText('返回上一步');
      expect(backButton.props.accessibilityLabel).toBe('返回到上一個註冊步驟');
    });

    it('should have proper accessibility hints', () => {
      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      expect(confirmButton.props.accessibilityHint).toBe('點擊後將導向付款服務商頁面');
    });

    it('should announce loading states to screen readers', async () => {
      let resolvePayment: (value: any) => void;
      const paymentPromise = new Promise((resolve) => {
        resolvePayment = resolve;
      });
      mockPaymentService.initiatePayment.mockReturnValue(paymentPromise);

      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('正在處理付款...')).toBeTruthy();
      });

      resolvePayment!({
        paymentId: 'payment-123',
        status: 'requires_action',
        redirectUrl: 'https://payment.ecpay.com.tw/test',
        amount: 2000,
        currency: 'TWD',
        merchantTradeNo: 'PAY123456789',
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockPaymentService.initiatePayment.mockRejectedValue(
        new Error('Network request failed')
      );

      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('網路連線錯誤')).toBeTruthy();
        expect(screen.getByText('請檢查網路連線後再試')).toBeTruthy();
      });
    });

    it('should handle payment service errors', async () => {
      mockPaymentService.initiatePayment.mockRejectedValue({
        response: {
          data: {
            message: 'Payment provider configuration error',
          },
        },
      });

      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('付款設定錯誤')).toBeTruthy();
        expect(screen.getByText('請聯絡活動主辦方')).toBeTruthy();
      });
    });

    it('should provide retry option for failed payments', async () => {
      mockPaymentService.initiatePayment.mockRejectedValueOnce(
        new Error('Temporary error')
      );

      renderPaymentStep();

      const confirmButton = screen.getByText('確認付款');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(screen.getByText('重試')).toBeTruthy();
      });

      // Mock successful retry
      mockPaymentService.initiatePayment.mockResolvedValueOnce({
        paymentId: 'payment-123',
        status: 'requires_action',
        redirectUrl: 'https://payment.ecpay.com.tw/test',
        amount: 2000,
        currency: 'TWD',
        merchantTradeNo: 'PAY123456789',
      });

      const retryButton = screen.getByText('重試');
      fireEvent.press(retryButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });
});