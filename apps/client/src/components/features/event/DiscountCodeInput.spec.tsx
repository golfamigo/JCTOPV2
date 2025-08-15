import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiscountCodeInput from './DiscountCodeInput';
import registrationService from '../../../services/registrationService';

// Mock the registration service
jest.mock('../../../services/registrationService');
const mockedRegistrationService = registrationService as jest.Mocked<typeof registrationService>;

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('DiscountCodeInput', () => {
  const mockOnDiscountApplied = jest.fn();
  const defaultProps = {
    eventId: 'event-1',
    totalAmount: 100,
    onDiscountApplied: mockOnDiscountApplied,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render discount code input form', () => {
    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    expect(screen.getByLabelText(/discount code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter discount code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  it('should convert input to uppercase', () => {
    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    fireEvent.change(input, { target: { value: 'discount10' } });

    expect(input).toHaveValue('DISCOUNT10');
  });

  it('should disable apply button when input is empty', () => {
    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const applyButton = screen.getByRole('button', { name: /apply/i });
    expect(applyButton).toBeDisabled();
  });

  it('should enable apply button when input has value', () => {
    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: 'DISCOUNT10' } });

    expect(applyButton).not.toBeDisabled();
  });

  it('should validate discount code successfully', async () => {
    const mockResponse = {
      valid: true,
      discountAmount: 10,
      finalAmount: 90,
    };

    mockedRegistrationService.validateDiscountCode.mockResolvedValue(mockResponse);

    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: 'VALID10' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(mockedRegistrationService.validateDiscountCode).toHaveBeenCalledWith('event-1', 'VALID10', 100);
    });

    await waitFor(() => {
      expect(screen.getByText(/discount applied successfully/i)).toBeInTheDocument();
    });

    expect(mockOnDiscountApplied).toHaveBeenCalledWith(mockResponse);
  });

  it('should handle invalid discount code', async () => {
    const mockResponse = {
      valid: false,
      discountAmount: 0,
      finalAmount: 100,
      errorMessage: 'Invalid discount code',
    };

    mockedRegistrationService.validateDiscountCode.mockResolvedValue(mockResponse);

    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: 'INVALID' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid discount code')).toBeInTheDocument();
    });

    expect(mockOnDiscountApplied).not.toHaveBeenCalled();
  });

  it('should handle expired discount code', async () => {
    const mockResponse = {
      valid: false,
      discountAmount: 0,
      finalAmount: 100,
      errorMessage: 'Discount code has expired',
    };

    mockedRegistrationService.validateDiscountCode.mockResolvedValue(mockResponse);

    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: 'EXPIRED' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Discount code has expired')).toBeInTheDocument();
    });
  });

  it('should validate discount code on Enter key press', async () => {
    const mockResponse = {
      valid: true,
      discountAmount: 5,
      finalAmount: 95,
    };

    mockedRegistrationService.validateDiscountCode.mockResolvedValue(mockResponse);

    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);

    fireEvent.change(input, { target: { value: 'ENTER10' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockedRegistrationService.validateDiscountCode).toHaveBeenCalledWith('event-1', 'ENTER10', 100);
    });
  });

  it('should show loading state during validation', async () => {
    mockedRegistrationService.validateDiscountCode.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        valid: true,
        discountAmount: 10,
        finalAmount: 90,
      }), 100))
    );

    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: 'LOADING' } });
    fireEvent.click(applyButton);

    expect(screen.getByText(/checking.../i)).toBeInTheDocument();
    expect(screen.getByText(/validating discount code.../i)).toBeInTheDocument();
  });

  it('should allow removing applied discount', async () => {
    const mockResponse = {
      valid: true,
      discountAmount: 10,
      finalAmount: 90,
    };

    mockedRegistrationService.validateDiscountCode.mockResolvedValue(mockResponse);

    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    // Apply discount
    fireEvent.change(input, { target: { value: 'REMOVE10' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText(/discount applied successfully/i)).toBeInTheDocument();
    });

    // Remove discount
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(input).toHaveValue('');
    expect(mockOnDiscountApplied).toHaveBeenLastCalledWith({
      valid: false,
      discountAmount: 0,
      finalAmount: 100,
    });
  });

  it('should handle API errors gracefully', async () => {
    mockedRegistrationService.validateDiscountCode.mockRejectedValue(new Error('Network error'));

    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: 'ERROR' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should be disabled when isDisabled prop is true', () => {
    renderWithChakra(<DiscountCodeInput {...defaultProps} isDisabled={true} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    expect(input).toBeDisabled();
    expect(applyButton).toBeDisabled();
  });

  it('should display price formatting correctly', async () => {
    const mockResponse = {
      valid: true,
      discountAmount: 15.50,
      finalAmount: 84.50,
    };

    mockedRegistrationService.validateDiscountCode.mockResolvedValue(mockResponse);

    renderWithChakra(<DiscountCodeInput {...defaultProps} />);

    const input = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(input, { target: { value: 'PRICE15' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText('$15.50')).toBeInTheDocument();
      expect(screen.getByText('$84.50')).toBeInTheDocument();
    });
  });
});