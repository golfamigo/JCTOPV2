import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import DiscountCodeFormModal from './DiscountCodeFormModal';
import discountCodeService from '@/services/discountCodeService';
import * as Clipboard from 'expo-clipboard';

// Mock dependencies
jest.mock('@/services/discountCodeService');
jest.mock('expo-clipboard');
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      white: '#FFFFFF',
      dark: '#212529',
      grey1: '#E0E0E0',
      grey2: '#E9ECEF',
      grey3: '#6C757D',
      grey5: '#495057',
      error: '#DC3545',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  }),
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('DiscountCodeFormModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    visible: true,
    eventId: 'event-1',
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  const mockDiscountCode = {
    id: '1',
    eventId: 'event-1',
    code: 'SUMMER20',
    type: 'percentage' as const,
    value: 20,
    usageCount: 5,
    expiresAt: new Date('2025-12-31'),
    createdAt: new Date(),
    updatedAt: new Date(),
    status: 'active' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create form when no discount code provided', () => {
    const { getByText, getByPlaceholderText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    expect(getByText('discounts.addNew')).toBeTruthy();
    expect(getByPlaceholderText('SUMMER20')).toBeTruthy();
    expect(getByText('common.create')).toBeTruthy();
  });

  it('renders edit form when discount code provided', () => {
    const { getByText, getByDisplayValue } = render(
      <DiscountCodeFormModal {...defaultProps} discountCode={mockDiscountCode} />
    );

    expect(getByText('discounts.editCode')).toBeTruthy();
    expect(getByDisplayValue('SUMMER20')).toBeTruthy();
    expect(getByDisplayValue('20')).toBeTruthy();
    expect(getByText('common.update')).toBeTruthy();
  });

  it('generates random code when dice button pressed', () => {
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const buttons = UNSAFE_getAllByType(require('@rneui/themed').Button);
    const generateButton = buttons.find(b => 
      b.props.icon?.props?.name === 'dice-5'
    );

    fireEvent.press(generateButton);

    const codeInput = getByPlaceholderText('SUMMER20');
    // Random code should be generated (8 characters)
    expect(codeInput.props.value.length).toBe(8);
  });

  it('copies code to clipboard', async () => {
    (Clipboard.setStringAsync as jest.Mock).mockResolvedValue(undefined);

    const { getByPlaceholderText, UNSAFE_getAllByType } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const codeInput = getByPlaceholderText('SUMMER20');
    fireEvent.changeText(codeInput, 'TESTCODE');

    const buttons = UNSAFE_getAllByType(require('@rneui/themed').Button);
    const copyButton = buttons.find(b => 
      b.props.icon?.props?.name === 'content-copy'
    );

    fireEvent.press(copyButton);

    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('TESTCODE');
      expect(Alert.alert).toHaveBeenCalledWith('common.success', 'discounts.codeCopied');
    });
  });

  it('switches between percentage and fixed amount types', () => {
    const { getByText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const fixedAmountButton = getByText('discounts.fixedAmount');
    fireEvent.press(fixedAmountButton);

    // Value input should update placeholder and suffix
    expect(getByText('NT$')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const createButton = getByText('common.create');
    fireEvent.press(createButton);

    await waitFor(() => {
      // Should show validation errors
      expect(getByText('discounts.validation.codeRequired')).toBeTruthy();
      expect(getByText('discounts.validation.valueRequired')).toBeTruthy();
    });
  });

  it('validates code pattern', async () => {
    const { getByPlaceholderText, getByText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const codeInput = getByPlaceholderText('SUMMER20');
    fireEvent.changeText(codeInput, 'Invalid Code!');

    const createButton = getByText('common.create');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('discounts.validation.codePattern')).toBeTruthy();
    });
  });

  it('validates percentage range', async () => {
    const { getByPlaceholderText, getByText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const codeInput = getByPlaceholderText('SUMMER20');
    fireEvent.changeText(codeInput, 'TESTCODE');

    const valueInput = getByPlaceholderText('20');
    fireEvent.changeText(valueInput, '150');

    const createButton = getByText('common.create');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('discounts.validation.percentageRange')).toBeTruthy();
    });
  });

  it('validates fixed amount minimum', async () => {
    const { getByPlaceholderText, getByText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const fixedAmountButton = getByText('discounts.fixedAmount');
    fireEvent.press(fixedAmountButton);

    const codeInput = getByPlaceholderText('SUMMER20');
    fireEvent.changeText(codeInput, 'TESTCODE');

    const valueInput = getByPlaceholderText('100');
    fireEvent.changeText(valueInput, '0');

    const createButton = getByText('common.create');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(getByText('discounts.validation.amountMin')).toBeTruthy();
    });
  });

  it('creates new discount code successfully', async () => {
    (discountCodeService.createDiscountCode as jest.Mock).mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const codeInput = getByPlaceholderText('SUMMER20');
    fireEvent.changeText(codeInput, 'NEWCODE');

    const valueInput = getByPlaceholderText('20');
    fireEvent.changeText(valueInput, '25');

    const createButton = getByText('common.create');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(discountCodeService.createDiscountCode).toHaveBeenCalledWith(
        'event-1',
        expect.objectContaining({
          code: 'NEWCODE',
          type: 'percentage',
          value: 25,
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith('common.success', 'discounts.createSuccess');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('updates existing discount code successfully', async () => {
    (discountCodeService.updateDiscountCode as jest.Mock).mockResolvedValue({});

    const { getByDisplayValue, getByText } = render(
      <DiscountCodeFormModal {...defaultProps} discountCode={mockDiscountCode} />
    );

    const valueInput = getByDisplayValue('20');
    fireEvent.changeText(valueInput, '30');

    const updateButton = getByText('common.update');
    fireEvent.press(updateButton);

    await waitFor(() => {
      expect(discountCodeService.updateDiscountCode).toHaveBeenCalledWith(
        'event-1',
        '1',
        expect.objectContaining({
          code: 'SUMMER20',
          type: 'percentage',
          value: 30,
        })
      );
      expect(Alert.alert).toHaveBeenCalledWith('common.success', 'discounts.updateSuccess');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    (discountCodeService.createDiscountCode as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );

    const { getByPlaceholderText, getByText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const codeInput = getByPlaceholderText('SUMMER20');
    fireEvent.changeText(codeInput, 'TESTCODE');

    const valueInput = getByPlaceholderText('20');
    fireEvent.changeText(valueInput, '20');

    const createButton = getByText('common.create');
    fireEvent.press(createButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('common.error', 'discounts.createError');
    });
  });

  it('closes modal when cancel button pressed', () => {
    const { getByText } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const cancelButton = getByText('common.cancel');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes modal when backdrop pressed', () => {
    const { UNSAFE_getByType } = render(
      <DiscountCodeFormModal {...defaultProps} />
    );

    const overlay = UNSAFE_getByType(require('@rneui/themed').Overlay);
    overlay.props.onBackdropPress();

    expect(mockOnClose).toHaveBeenCalled();
  });
});