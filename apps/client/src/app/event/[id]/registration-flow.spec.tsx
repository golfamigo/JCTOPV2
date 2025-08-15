import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '@rneui/themed';
import { I18nextProvider } from 'react-i18next';
import { theme } from '@/theme';
import EventDetailsScreen from './index';
import i18n from '@/localization';

// Mock modules
jest.mock('@/services/eventService');
jest.mock('@/services/ticketService');
jest.mock('@/services/paymentService');
jest.mock('@/services/discountCodeService');

// Mock navigation
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: mockGoBack,
  }),
  useRoute: () => ({
    params: { id: 'event-123' },
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      <ThemeProvider theme={theme}>
        <I18nextProvider i18n={i18n}>
          {component}
        </I18nextProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

describe('Event Registration Flow Integration Test', () => {
  const mockEvent = {
    id: 'event-123',
    title: '2024 音樂節',
    description: '年度最大音樂盛會',
    startDate: new Date('2024-12-25T19:00:00'),
    endDate: new Date('2024-12-25T23:00:00'),
    location: '台北小巨蛋',
    ticketTypes: [
      {
        id: 'ticket-1',
        name: '一般票',
        price: 1500,
        quantity: 100,
        available: 50,
      },
      {
        id: 'ticket-2',
        name: 'VIP票',
        price: 3000,
        quantity: 20,
        available: 10,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup service mocks
    const eventService = require('@/services/eventService');
    eventService.getEventById.mockResolvedValue(mockEvent);
    
    const ticketService = require('@/services/ticketService');
    ticketService.checkAvailability.mockResolvedValue({ available: true });
    
    const paymentService = require('@/services/paymentService');
    paymentService.createPaymentIntent.mockResolvedValue({
      paymentIntentId: 'pi_123',
      clientSecret: 'secret_123',
    });
    
    const discountCodeService = require('@/services/discountCodeService');
    discountCodeService.validateDiscountCode.mockResolvedValue({
      valid: true,
      discountAmount: 100,
    });
  });

  it('completes full registration flow from event details to payment', async () => {
    const { getByText, getByTestId, getAllByTestId } = renderWithProviders(
      <EventDetailsScreen />
    );

    // Wait for event details to load
    await waitFor(() => {
      expect(getByText('2024 音樂節')).toBeTruthy();
    });

    // Step 1: View event details
    expect(getByText('台北小巨蛋')).toBeTruthy();
    expect(getByText('一般票')).toBeTruthy();
    expect(getByText('NT$ 1,500')).toBeTruthy();

    // Step 2: Click register button
    const registerButton = getByText('立即報名');
    fireEvent.press(registerButton);

    // Step 3: Select ticket type and quantity
    await waitFor(() => {
      expect(getByText('選擇票種')).toBeTruthy();
    });

    const ticketSelector = getByTestId('ticket-type-selector');
    fireEvent.press(ticketSelector);
    
    const vipOption = getByText('VIP票');
    fireEvent.press(vipOption);

    // Increase quantity
    const increaseButton = getByTestId('quantity-increase');
    fireEvent.press(increaseButton);
    fireEvent.press(increaseButton);

    // Step 4: Fill registration information
    const continueButton = getByText('繼續');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('填寫報名資料')).toBeTruthy();
    });

    const nameInput = getByTestId('attendee-name');
    const emailInput = getByTestId('attendee-email');
    const phoneInput = getByTestId('attendee-phone');

    fireEvent.changeText(nameInput, '王小明');
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(phoneInput, '0912345678');

    // Step 5: Apply discount code
    const discountCodeInput = getByTestId('discount-code-input');
    fireEvent.changeText(discountCodeInput, 'SAVE100');
    
    const applyButton = getByText('套用');
    fireEvent.press(applyButton);

    await waitFor(() => {
      expect(getByText('折扣已套用')).toBeTruthy();
    });

    // Step 6: Proceed to payment
    const proceedToPaymentButton = getByText('前往付款');
    fireEvent.press(proceedToPaymentButton);

    await waitFor(() => {
      expect(getByText('付款資訊')).toBeTruthy();
    });

    // Step 7: Enter payment details
    const cardNumberInput = getByTestId('card-number');
    const expiryInput = getByTestId('card-expiry');
    const cvvInput = getByTestId('card-cvv');

    fireEvent.changeText(cardNumberInput, '4242424242424242');
    fireEvent.changeText(expiryInput, '12/25');
    fireEvent.changeText(cvvInput, '123');

    // Step 8: Confirm payment
    const confirmPaymentButton = getByText('確認付款');
    fireEvent.press(confirmPaymentButton);

    // Verify payment processing
    await waitFor(() => {
      expect(getByText('處理中...')).toBeTruthy();
    });

    // Verify success state
    await waitFor(() => {
      expect(getByText('報名成功！')).toBeTruthy();
    }, { timeout: 5000 });

    // Verify navigation to success page
    expect(mockNavigate).toHaveBeenCalledWith('PaymentSuccess', {
      eventId: 'event-123',
      registrationId: expect.any(String),
    });
  });

  it('handles ticket unavailability during registration', async () => {
    const ticketService = require('@/services/ticketService');
    ticketService.checkAvailability.mockResolvedValue({ available: false });

    const { getByText } = renderWithProviders(
      <EventDetailsScreen />
    );

    await waitFor(() => {
      expect(getByText('2024 音樂節')).toBeTruthy();
    });

    const registerButton = getByText('立即報名');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('票券已售完')).toBeTruthy();
    });
  });

  it('handles payment failure gracefully', async () => {
    const paymentService = require('@/services/paymentService');
    paymentService.createPaymentIntent.mockRejectedValue(
      new Error('Payment declined')
    );

    const { getByText, getByTestId } = renderWithProviders(
      <EventDetailsScreen />
    );

    // Navigate to payment step
    await waitFor(() => {
      expect(getByText('2024 音樂節')).toBeTruthy();
    });

    const registerButton = getByText('立即報名');
    fireEvent.press(registerButton);

    // Fill minimal required information
    await waitFor(() => {
      expect(getByText('選擇票種')).toBeTruthy();
    });

    const continueButton = getByText('繼續');
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(getByText('填寫報名資料')).toBeTruthy();
    });

    const nameInput = getByTestId('attendee-name');
    fireEvent.changeText(nameInput, '測試用戶');

    const proceedToPaymentButton = getByText('前往付款');
    fireEvent.press(proceedToPaymentButton);

    // Attempt payment
    await waitFor(() => {
      expect(getByText('付款資訊')).toBeTruthy();
    });

    const confirmPaymentButton = getByText('確認付款');
    fireEvent.press(confirmPaymentButton);

    // Verify error handling
    await waitFor(() => {
      expect(getByText('付款失敗')).toBeTruthy();
      expect(getByText('Payment declined')).toBeTruthy();
    });
  });

  it('validates Traditional Chinese localization throughout flow', async () => {
    const { getByText, queryByText } = renderWithProviders(
      <EventDetailsScreen />
    );

    await waitFor(() => {
      expect(getByText('2024 音樂節')).toBeTruthy();
    });

    // Check all UI elements are in Traditional Chinese
    expect(getByText('活動詳情')).toBeTruthy();
    expect(getByText('立即報名')).toBeTruthy();
    expect(queryByText('Register Now')).toBeNull(); // No English text

    const registerButton = getByText('立即報名');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(getByText('選擇票種')).toBeTruthy();
      expect(queryByText('Select Ticket Type')).toBeNull();
    });
  });

  it('maintains state during navigation back and forth', async () => {
    const { getByText, getByTestId } = renderWithProviders(
      <EventDetailsScreen />
    );

    await waitFor(() => {
      expect(getByText('2024 音樂節')).toBeTruthy();
    });

    // Start registration
    const registerButton = getByText('立即報名');
    fireEvent.press(registerButton);

    // Select ticket
    await waitFor(() => {
      expect(getByText('選擇票種')).toBeTruthy();
    });

    const increaseButton = getByTestId('quantity-increase');
    fireEvent.press(increaseButton); // Quantity = 2

    // Go to next step
    const continueButton = getByText('繼續');
    fireEvent.press(continueButton);

    // Go back
    const backButton = getByTestId('back-button');
    fireEvent.press(backButton);

    // Verify state is maintained
    await waitFor(() => {
      const quantityDisplay = getByTestId('quantity-display');
      expect(quantityDisplay.props.children).toBe('2');
    });
  });
});