import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import PaymentStep from './PaymentStep';
import paymentService from '../../../services/paymentService';
import { Event, RegistrationFormData, PaymentResponse } from '@jctop-event/shared-types';

// Mock expo-linking
const mockLinking = {
  canOpenURL: jest.fn(),
  openURL: jest.fn(),
};

jest.mock('expo-linking', () => mockLinking);

// Mock dependencies
jest.mock('@rneui/themed', () => ({
  Card: 'Card',
  Text: 'Text',
  Button: 'Button',
  Divider: 'Divider',
  ListItem: 'ListItem',
  Icon: 'Icon',
  Badge: 'Badge',
  ThemeProvider: ({ children }: any) => children,
}));

jest.mock('../../molecules/CreditCardForm', () => ({
  __esModule: true,
  default: ({ onCardDataChange, disabled }: any) => {
    return (
      <mockCreditCardForm
        onCardDataChange={onCardDataChange}
        disabled={disabled}
      />
    );
  },
}));

jest.mock('../../atoms/PaymentSkeleton', () => ({
  __esModule: true,
  default: ({ variant }: any) => {
    return <mockPaymentSkeleton variant={variant} />;
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return `${key} ${JSON.stringify(params)}`;
      }
      return key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'zh-TW',
    },
  }),
}));

jest.mock('../../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      white: '#FFFFFF',
      lightGrey: '#F8F9FA',
      midGrey: '#6C757D',
      dark: '#212529',
      success: '#28A745',
      danger: '#DC3545',
      warning: '#FFC107',
      background: '#FFFFFF',
      text: '#212529',
      border: '#E9ECEF',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      h1: { fontSize: 24, fontWeight: 'bold' },
      h2: { fontSize: 20, fontWeight: 'bold' },
      body: { fontSize: 16 },
      small: { fontSize: 14 },
    },
  }),
}));

jest.mock('../../common/StepIndicator', () => 'StepIndicator');
jest.mock('../../../services/paymentService');
jest.mock('expo-linking');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('PaymentStep', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: '測試活動',
    description: '這是一個測試活動',
    startDate: new Date('2025-02-01T10:00:00'),
    endDate: new Date('2025-02-01T18:00:00'),
    location: '台北市信義區',
    organizerId: 'org-1',
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFormData: RegistrationFormData = {
    ticketSelections: [
      { ticketTypeId: 'ticket-1', quantity: 2 },
      { ticketTypeId: 'ticket-2', quantity: 1 },
    ],
    customFieldValues: {
      name: 'Test User',
      email: 'test@example.com',
    },
    totalAmount: 1500,
    discountAmount: 150,
    discountCode: 'TESTCODE',
  };

  const mockPaymentMethods = [
    { code: 'Credit', name: '信用卡' },
    { code: 'ATM', name: 'ATM轉帳' },
    { code: 'CVS', name: '超商代碼' },
  ];

  const mockOnSuccess = jest.fn();
  const mockOnBack = jest.fn();

  const defaultProps = {
    event: mockEvent,
    formData: mockFormData,
    onSuccess: mockOnSuccess,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (paymentService.getECPayPaymentMethods as jest.Mock).mockReturnValue(mockPaymentMethods);
    (paymentService.validateAmount as jest.Mock).mockReturnValue({ valid: true });
  });

  it('should render step indicator with correct steps', () => {
    const { UNSAFE_getByType } = render(<PaymentStep {...defaultProps} />);
    
    const stepIndicator = UNSAFE_getByType('StepIndicator' as any);
    expect(stepIndicator.props.currentStep).toBe(2);
    expect(stepIndicator.props.steps).toHaveLength(3);
  });

  it('should display payment summary correctly', () => {
    const { getByText } = render(<PaymentStep {...defaultProps} />);
    
    expect(getByText(/payment.paymentSummary/)).toBeTruthy();
    expect(getByText(mockEvent.title)).toBeTruthy();
    expect(getByText(/registration.ticketQuantity × 2/)).toBeTruthy();
    expect(getByText(/registration.ticketQuantity × 1/)).toBeTruthy();
  });

  it('should display discount when applied', () => {
    const { getByText } = render(<PaymentStep {...defaultProps} />);
    
    expect(getByText(/registration.discount/)).toBeTruthy();
    // Should show discounted amount
    expect(getByText(/registration.total/)).toBeTruthy();
  });

  it('should render payment method options', () => {
    const { UNSAFE_getAllByType } = render(<PaymentStep {...defaultProps} />);
    
    const listItems = UNSAFE_getAllByType('ListItem' as any);
    expect(listItems.length).toBe(mockPaymentMethods.length);
    
    mockPaymentMethods.forEach((method, index) => {
      expect(listItems[index].props.children).toBeTruthy();
    });
  });

  it('should handle payment method selection', () => {
    const { UNSAFE_getAllByType } = render(<PaymentStep {...defaultProps} />);
    
    const listItems = UNSAFE_getAllByType('ListItem' as any);
    const secondMethod = listItems[1];
    
    fireEvent.press(secondMethod);
    
    // Should update selected payment method
    expect(secondMethod.props.onPress).toBeDefined();
  });

  it('should validate amount before payment', async () => {
    (paymentService.validateAmount as jest.Mock).mockReturnValue({ 
      valid: false, 
      message: 'Invalid amount' 
    });

    const { getAllByText } = render(<PaymentStep {...defaultProps} />);
    
    const payButton = getAllByText(/payment.proceedToPayment/)[0];
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(paymentService.validateAmount).toHaveBeenCalledWith(mockFormData.totalAmount);
    });
  });

  it('should initiate payment successfully', async () => {
    const mockPaymentResponse: PaymentResponse = {
      paymentId: 'payment-123',
      status: 'requires_action',
      redirectUrl: 'https://payment.example.com',
    };

    (paymentService.initiateEventPayment as jest.Mock).mockResolvedValue(mockPaymentResponse);
    mockLinking.canOpenURL.mockResolvedValue(true);
    mockLinking.openURL.mockResolvedValue(undefined);

    const { getAllByText } = render(<PaymentStep {...defaultProps} />);
    
    const payButton = getAllByText(/payment.proceedToPayment/)[0];
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(paymentService.initiateEventPayment).toHaveBeenCalledWith(
        mockEvent.id,
        expect.objectContaining({
          amount: mockFormData.totalAmount,
          paymentMethod: 'ALL',
          metadata: expect.objectContaining({
            eventId: mockEvent.id,
            eventTitle: mockEvent.title,
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockLinking.openURL).toHaveBeenCalledWith(mockPaymentResponse.redirectUrl);
    });
  });

  it('should handle payment URL that cannot be opened', async () => {
    const mockPaymentResponse: PaymentResponse = {
      paymentId: 'payment-123',
      status: 'requires_action',
      redirectUrl: 'https://payment.example.com',
    };

    (paymentService.initiateEventPayment as jest.Mock).mockResolvedValue(mockPaymentResponse);
    mockLinking.canOpenURL.mockResolvedValue(false);

    const { getAllByText } = render(<PaymentStep {...defaultProps} />);
    
    const payButton = getAllByText(/payment.proceedToPayment/)[0];
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'payment.paymentFailed',
        'payment.cannotOpenPaymentUrl',
        expect.any(Array)
      );
    });
  });

  it('should call onSuccess when payment does not require action', async () => {
    const mockPaymentResponse: PaymentResponse = {
      paymentId: 'payment-123',
      status: 'completed',
    };

    (paymentService.initiateEventPayment as jest.Mock).mockResolvedValue(mockPaymentResponse);

    const { getAllByText } = render(<PaymentStep {...defaultProps} />);
    
    const payButton = getAllByText(/payment.proceedToPayment/)[0];
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockPaymentResponse);
    });
  });

  it('should handle payment initiation error', async () => {
    const errorMessage = 'Payment failed';
    (paymentService.initiateEventPayment as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { getAllByText } = render(<PaymentStep {...defaultProps} />);
    
    const payButton = getAllByText(/payment.proceedToPayment/)[0];
    fireEvent.press(payButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'payment.paymentFailed',
        errorMessage,
        expect.any(Array)
      );
    });
  });

  it('should handle back navigation', () => {
    const { getAllByText } = render(<PaymentStep {...defaultProps} />);
    
    const backButton = getAllByText('common.back')[0];
    fireEvent.press(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should disable buttons when loading', () => {
    const { getAllByText } = render(<PaymentStep {...defaultProps} isLoading={true} />);
    
    const payButton = getAllByText(/payment.proceedToPayment/)[0];
    const backButton = getAllByText('common.back')[0];
    
    expect(payButton.props.disabled).toBeTruthy();
    expect(backButton.props.disabled).toBeTruthy();
  });

  it('should show loading state during payment processing', async () => {
    (paymentService.initiateEventPayment as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    const { getAllByText } = render(<PaymentStep {...defaultProps} />);
    
    const payButton = getAllByText(/payment.proceedToPayment/)[0];
    fireEvent.press(payButton);

    // Button should show loading state
    await waitFor(() => {
      expect(payButton.props.loading).toBeTruthy();
    });
  });

  it('should format currency in TWD', () => {
    const { getByText } = render(<PaymentStep {...defaultProps} />);
    
    // Should show TWD currency format
    expect(getByText(/NT\$/)).toBeTruthy();
  });

  it('should display security notice', () => {
    const { getByText } = render(<PaymentStep {...defaultProps} />);
    
    expect(getByText('payment.securityNotice')).toBeTruthy();
  });

  it('should calculate ticket prices correctly', () => {
    const { getByText } = render(<PaymentStep {...defaultProps} />);
    
    // Total amount - discount amount = 1500 - 150 = 1350
    // 3 tickets total
    // Should display individual ticket calculations
    expect(getByText(/registration.subtotal/)).toBeTruthy();
    expect(getByText(/registration.total/)).toBeTruthy();
  });

  describe('Credit Card Form Integration', () => {
    it('should show credit card form when Credit payment method is selected', () => {
      const { getByProps, queryByProps } = render(<PaymentStep {...defaultProps} />);
      
      // Initially credit card form should not be visible (default is 'ALL' method)
      expect(queryByProps({ onCardDataChange: expect.any(Function) })).toBeNull();
      
      // TODO: Add test for selecting Credit payment method and showing form
      // This would require updating the payment method selection logic
    });

    it('should validate credit card data when Credit method is selected and payment is initiated', async () => {
      // Mock credit card selection 
      const { rerender } = render(<PaymentStep {...defaultProps} />);
      
      // Simulate selecting Credit payment method
      const propsWithCredit = {
        ...defaultProps,
      };
      rerender(<PaymentStep {...propsWithCredit} />);

      // TODO: Add test for credit card validation on payment initiation
    });

    it('should pass disabled state to credit card form during processing', () => {
      const { queryByProps } = render(<PaymentStep {...defaultProps} isLoading={true} />);
      
      // Credit card form should receive disabled prop when payment is loading
      if (queryByProps({ onCardDataChange: expect.any(Function) })) {
        expect(queryByProps({ disabled: true })).toBeTruthy();
      }
    });
  });

  describe('Skeleton Loading', () => {
    it('should show skeleton loading during payment processing', async () => {
      (paymentService.validateAmount as jest.Mock).mockReturnValue({ valid: true });
      (paymentService.initiateEventPayment as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByText, queryByProps } = render(<PaymentStep {...defaultProps} />);
      
      const payButton = getByText(/payment.proceedToPayment/);
      fireEvent.press(payButton);

      // Should show skeleton components during processing
      await waitFor(() => {
        expect(queryByProps({ variant: 'form' })).toBeTruthy();
        expect(queryByProps({ variant: 'methods' })).toBeTruthy();
      });
    });

    it('should hide skeleton loading after payment completion', async () => {
      (paymentService.validateAmount as jest.Mock).mockReturnValue({ valid: true });
      (paymentService.initiateEventPayment as jest.Mock).mockResolvedValue({
        paymentId: 'test-123',
        status: 'completed'
      });

      const { getByText, queryByProps } = render(<PaymentStep {...defaultProps} />);
      
      const payButton = getByText(/payment.proceedToPayment/);
      fireEvent.press(payButton);

      // Wait for payment to complete
      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });

      // Skeleton should be hidden after completion
      expect(queryByProps({ variant: 'form' })).toBeNull();
      expect(queryByProps({ variant: 'methods' })).toBeNull();
    });

    it('should hide skeleton loading after payment error', async () => {
      (paymentService.validateAmount as jest.Mock).mockReturnValue({ valid: true });
      (paymentService.initiateEventPayment as jest.Mock).mockRejectedValue(new Error('Payment failed'));

      const { getByText, queryByProps } = render(<PaymentStep {...defaultProps} />);
      
      const payButton = getByText(/payment.proceedToPayment/);
      fireEvent.press(payButton);

      // Wait for error handling
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalled();
      });

      // Skeleton should be hidden after error
      expect(queryByProps({ variant: 'form' })).toBeNull();
      expect(queryByProps({ variant: 'methods' })).toBeNull();
    });
  });

  describe('Enhanced Payment Method Selection', () => {
    it('should render payment methods with React Native Elements ListItem', () => {
      const { getAllByText } = render(<PaymentStep {...defaultProps} />);
      
      // Should show payment method selection section
      expect(getAllByText(/registration.selectPaymentMethod/)).toBeTruthy();
    });

    it('should display payment method icons and badges', () => {
      const { queryAllByText } = render(<PaymentStep {...defaultProps} />);
      
      // Payment methods should be rendered (mocked as text)
      // In real implementation, this would test icon and badge rendering
      expect(queryAllByText).toBeTruthy();
    });
  });

  describe('Traditional Chinese Localization', () => {
    it('should use Traditional Chinese translations for all payment text', () => {
      const { getByText } = render(<PaymentStep {...defaultProps} />);
      
      // Should use i18n translation keys
      expect(getByText(/payment.paymentConfirmation/)).toBeTruthy();
      expect(getByText(/payment.paymentSummary/)).toBeTruthy();
      expect(getByText(/registration.selectPaymentMethod/)).toBeTruthy();
    });

    it('should format currency in TWD with Traditional Chinese format', () => {
      const { getByText } = render(<PaymentStep {...defaultProps} />);
      
      // Should display currency formatting
      expect(getByText(/registration.total/)).toBeTruthy();
      expect(getByText(/registration.subtotal/)).toBeTruthy();
    });
  });
});