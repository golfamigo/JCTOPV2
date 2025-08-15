import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiscountCodeList from './DiscountCodeList';
import discountCodeService from '../../../services/discountCodeService';
import { DiscountCodeResponse } from '@jctop-event/shared-types';

// Mock the discount code service
jest.mock('../../../services/discountCodeService');
const mockedDiscountCodeService = discountCodeService as jest.Mocked<typeof discountCodeService>;

// Mock toast hook
const mockToast = jest.fn();
// Removed ChakraUI mock

const renderComponent = (props: any = {}) => {
  const defaultProps = {
    eventId: 'test-event-id',
  };

  return render(
    <ChakraProvider>
      <DiscountCodeList {...defaultProps} {...props} />
    </ChakraProvider>
  );
};

const mockDiscountCodes: DiscountCodeResponse[] = [
  {
    id: 'code-1',
    eventId: 'test-event-id',
    code: 'SUMMER25',
    type: 'percentage',
    value: 25,
    usageCount: 10,
    expiresAt: new Date('2025-12-31'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'code-2',
    eventId: 'test-event-id',
    code: 'FIXED10',
    type: 'fixed_amount',
    value: 10,
    usageCount: 5,
    expiresAt: null,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

describe('DiscountCodeList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner initially', () => {
      mockedDiscountCodeService.getDiscountCodes.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();

      expect(screen.getByText('Loading discount codes...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no discount codes exist', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue([]);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No discount codes created yet')).toBeInTheDocument();
      });

      expect(screen.getByText('Create Your First Discount Code')).toBeInTheDocument();
      expect(mockedDiscountCodeService.getDiscountCodes).toHaveBeenCalledWith('test-event-id');
    });
  });

  describe('Success State', () => {
    it('should display discount codes when loaded successfully', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('SUMMER25')).toBeInTheDocument();
        expect(screen.getByText('FIXED10')).toBeInTheDocument();
      });

      // Check stats
      expect(screen.getByText('2')).toBeInTheDocument(); // Total codes
      expect(screen.getByText('2')).toBeInTheDocument(); // Active codes (both are active)
      expect(screen.getByText('15')).toBeInTheDocument(); // Total usage (10 + 5)
    });

    it('should display correct stats for expired codes', async () => {
      const expiredCodes = [
        {
          ...mockDiscountCodes[0],
          expiresAt: new Date('2020-01-01'), // Expired
        },
        mockDiscountCodes[1], // Active (no expiration)
      ];

      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(expiredCodes);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total codes
      });

      // Should show 1 active code (the one without expiration)
      const activeElements = screen.getAllByText('1');
      expect(activeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should show error message when loading fails', async () => {
      const errorMessage = 'Failed to load discount codes';
      mockedDiscountCodeService.getDiscountCodes.mockRejectedValue(new Error(errorMessage));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Create Discount Code', () => {
    it('should open create form when create button is clicked', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('SUMMER25')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create Discount Code');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create Discount Code')).toBeInTheDocument();
      });
    });

    it('should create new discount code', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue([]);
      
      const newCode: DiscountCodeResponse = {
        id: 'new-code',
        eventId: 'test-event-id',
        code: 'NEW25',
        type: 'percentage',
        value: 25,
        usageCount: 0,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedDiscountCodeService.createDiscountCode.mockResolvedValue(newCode);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('No discount codes created yet')).toBeInTheDocument();
      });

      // Click create button to open form
      const createButton = screen.getByText('Create Your First Discount Code');
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText('Create Discount Code')).toBeInTheDocument();
      });

      // Fill form and submit
      fireEvent.change(screen.getByPlaceholderText('Enter discount code (e.g., SUMMER25)'), {
        target: { value: 'NEW25' }
      });

      fireEvent.change(screen.getByPlaceholderText('Enter percentage'), {
        target: { value: '25' }
      });

      const submitButton = screen.getByRole('button', { name: /create discount code/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedDiscountCodeService.createDiscountCode).toHaveBeenCalledWith(
          'test-event-id',
          {
            code: 'NEW25',
            type: 'percentage',
            value: 25,
            expiresAt: undefined,
          }
        );
      });
    });
  });

  describe('Delete Discount Code', () => {
    it('should delete discount code when confirmed', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);
      mockedDiscountCodeService.deleteDiscountCode.mockResolvedValue();

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('SUMMER25')).toBeInTheDocument();
      });

      // Find and click delete button for the first code
      const deleteButtons = screen.getAllByLabelText('Delete discount code');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Discount Code')).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockedDiscountCodeService.deleteDiscountCode).toHaveBeenCalledWith(
          'test-event-id',
          'code-1'
        );
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Discount code deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    });

    it('should show error toast when deletion fails', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);
      mockedDiscountCodeService.deleteDiscountCode.mockRejectedValue(new Error('Delete failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('SUMMER25')).toBeInTheDocument();
      });

      // Find and click delete button
      const deleteButtons = screen.getAllByLabelText('Delete discount code');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Delete Discount Code')).toBeInTheDocument();
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Failed to delete discount code',
          description: 'Delete failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    });
  });

  describe('Edit Discount Code', () => {
    it('should open edit form when edit button is clicked', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('SUMMER25')).toBeInTheDocument();
      });

      // Find and click edit button for the first code
      const editButtons = screen.getAllByLabelText('Edit discount code');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Discount Code')).toBeInTheDocument();
      });

      // Should show existing data
      expect(screen.getByDisplayValue('SUMMER25')).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    });

    it('should update discount code', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);
      
      const updatedCode = { ...mockDiscountCodes[0], value: 30 };
      mockedDiscountCodeService.updateDiscountCode.mockResolvedValue(updatedCode);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('SUMMER25')).toBeInTheDocument();
      });

      // Click edit button
      const editButtons = screen.getAllByLabelText('Edit discount code');
      fireEvent.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Edit Discount Code')).toBeInTheDocument();
      });

      // Update value
      const valueInput = screen.getByDisplayValue('25');
      fireEvent.change(valueInput, { target: { value: '30' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /update discount code/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockedDiscountCodeService.updateDiscountCode).toHaveBeenCalledWith(
          'test-event-id',
          'code-1',
          expect.objectContaining({
            value: 30,
          })
        );
      });
    });
  });

  describe('Refresh Data', () => {
    it('should reload data when component mounts', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);

      renderComponent();

      await waitFor(() => {
        expect(mockedDiscountCodeService.getDiscountCodes).toHaveBeenCalledWith('test-event-id');
      });
    });

    it('should reload data when eventId changes', async () => {
      mockedDiscountCodeService.getDiscountCodes.mockResolvedValue(mockDiscountCodes);

      const { rerender } = renderComponent({ eventId: 'event-1' });

      await waitFor(() => {
        expect(mockedDiscountCodeService.getDiscountCodes).toHaveBeenCalledWith('event-1');
      });

      // Change eventId
      rerender(
        <ChakraProvider>
          <DiscountCodeList eventId="event-2" />
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(mockedDiscountCodeService.getDiscountCodes).toHaveBeenCalledWith('event-2');
      });
    });
  });
});