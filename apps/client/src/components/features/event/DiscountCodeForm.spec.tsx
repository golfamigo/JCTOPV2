import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiscountCodeForm from './DiscountCodeForm';
import { DiscountCodeResponse } from '@jctop-event/shared-types';

// Mock toast hook
const mockToast = jest.fn();
// Removed ChakraUI mock

const renderComponent = (props: any = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
  };

  return render(
    <ChakraProvider>
      <DiscountCodeForm {...defaultProps} {...props} />
    </ChakraProvider>
  );
};

describe('DiscountCodeForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form correctly', () => {
      renderComponent();

      expect(screen.getByText('Create Discount Code')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)')).toBeInTheDocument();
      expect(screen.getByDisplayValue('percentage')).toBeInTheDocument();
      expect(screen.getByText('Create Discount Code')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const onSubmit = jest.fn();
      renderComponent({ onSubmit });

      const submitButton = screen.getByText('Create Discount Code');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Discount code is required')).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should validate percentage values', async () => {
      const onSubmit = jest.fn();
      renderComponent({ onSubmit });

      // Fill in form
      fireEvent.change(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)'), {
        target: { value: 'TEST25' }
      });

      // Set percentage type and invalid value
      fireEvent.change(screen.getByDisplayValue('percentage'), {
        target: { value: 'percentage' }
      });

      const valueInput = screen.getByPlaceholderText('Enter percentage');
      fireEvent.change(valueInput, { target: { value: '150' } });

      const submitButton = screen.getByText('Create Discount Code');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Percentage cannot exceed 100%')).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should validate zero values', async () => {
      const onSubmit = jest.fn();
      renderComponent({ onSubmit });

      // Fill in form with zero value
      fireEvent.change(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)'), {
        target: { value: 'TEST25' }
      });

      const valueInput = screen.getByPlaceholderText('Enter percentage');
      fireEvent.change(valueInput, { target: { value: '0' } });

      const submitButton = screen.getByText('Create Discount Code');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Value must be greater than 0')).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should validate expiration date', async () => {
      const onSubmit = jest.fn();
      renderComponent({ onSubmit });

      // Fill in form with past expiration date
      fireEvent.change(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)'), {
        target: { value: 'TEST25' }
      });

      const valueInput = screen.getByPlaceholderText('Enter percentage');
      fireEvent.change(valueInput, { target: { value: '25' } });

      const expirationInput = screen.getByLabelText('Expiration Date (Optional)');
      fireEvent.change(expirationInput, { target: { value: '2020-01-01T00:00' } });

      const submitButton = screen.getByText('Create Discount Code');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Expiration date must be in the future')).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should submit valid form data', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onClose = jest.fn();
      renderComponent({ onSubmit, onClose });

      // Fill in valid form data
      fireEvent.change(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)'), {
        target: { value: 'summer25' }
      });

      const valueInput = screen.getByPlaceholderText('Enter percentage');
      fireEvent.change(valueInput, { target: { value: '25' } });

      const submitButton = screen.getByText('Create Discount Code');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          code: 'SUMMER25', // Should be uppercase
          type: 'percentage',
          value: 25,
          expiresAt: undefined,
        });
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const mockExistingCode: DiscountCodeResponse = {
      id: 'code-1',
      eventId: 'event-1',
      code: 'EXISTING25',
      type: 'percentage',
      value: 25,
      usageCount: 5,
      expiresAt: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should render edit form with existing data', () => {
      renderComponent({ initialData: mockExistingCode });

      expect(screen.getByText('Edit Discount Code')).toBeInTheDocument();
      expect(screen.getByDisplayValue('EXISTING25')).toBeInTheDocument();
      expect(screen.getByDisplayValue('percentage')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
      expect(screen.getByText('Update Discount Code')).toBeInTheDocument();
    });

    it('should submit updated data', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      const onClose = jest.fn();
      renderComponent({ 
        initialData: mockExistingCode, 
        onSubmit, 
        onClose 
      });

      // Update the value
      const valueInput = screen.getByDisplayValue('25');
      fireEvent.change(valueInput, { target: { value: '30' } });

      const submitButton = screen.getByText('Update Discount Code');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          code: 'EXISTING25',
          type: 'percentage',
          value: 30,
          expiresAt: expect.any(String),
        });
      });

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Fixed Amount Type', () => {
    it('should handle fixed amount type correctly', async () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      renderComponent({ onSubmit });

      // Fill in form with fixed amount
      fireEvent.change(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)'), {
        target: { value: 'FIXED10' }
      });

      // Select fixed amount type
      fireEvent.change(screen.getByDisplayValue('percentage'), {
        target: { value: 'fixed_amount' }
      });

      await waitFor(() => {
        expect(screen.getByText('Amount ($)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
      });

      const valueInput = screen.getByPlaceholderText('Enter amount');
      fireEvent.change(valueInput, { target: { value: '10.99' } });

      const submitButton = screen.getByText('Create Discount Code');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          code: 'FIXED10',
          type: 'fixed_amount',
          value: 10.99,
          expiresAt: undefined,
        });
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      renderComponent({ isLoading: true });

      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    it('should show updating loading state for edit mode', () => {
      const mockExistingCode: DiscountCodeResponse = {
        id: 'code-1',
        eventId: 'event-1',
        code: 'EXISTING25',
        type: 'percentage',
        value: 25,
        usageCount: 5,
        expiresAt: new Date('2025-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      renderComponent({ 
        initialData: mockExistingCode, 
        isLoading: true 
      });

      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });
  });

  describe('Form Reset', () => {
    it('should reset form when closed', () => {
      const onClose = jest.fn();
      const { rerender } = renderComponent({ onClose });

      // Fill in some data
      fireEvent.change(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)'), {
        target: { value: 'TEST' }
      });

      // Close the modal
      fireEvent.click(screen.getByLabelText('Close'));

      // Reopen with fresh props
      rerender(
        <ChakraProvider>
          <DiscountCodeForm
            isOpen={true}
            onClose={onClose}
            onSubmit={jest.fn()}
            isLoading={false}
          />
        </ChakraProvider>
      );

      // Form should be reset
      expect(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)')).toHaveValue('');
    });
  });
});