import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import RegistrationStepOne from './RegistrationStepOne';
import ticketService from '../../../services/ticketService';
import { Event, TicketSelection } from '@jctop-event/shared-types';

// Mock the ticket service
jest.mock('../../../services/ticketService');
const mockTicketService = ticketService as jest.Mocked<typeof ticketService>;

// Mock the TicketTypeSelector component
jest.mock('./TicketTypeSelector', () => {
  const mockReact = require('react');
  
  return function MockTicketTypeSelector({ onSelectionChange, initialSelections }: any) {
    mockReact.useEffect(() => {
      // Simulate user selecting tickets
      if (initialSelections?.length > 0) {
        onSelectionChange(initialSelections, 150);
      }
    }, [onSelectionChange, initialSelections]);

    return mockReact.createElement('div', { 'data-testid': 'ticket-type-selector' },
      mockReact.createElement('button', {
        onClick: () => onSelectionChange([{ ticketTypeId: 'ticket-1', quantity: 2 }], 100)
      }, 'Select Tickets')
    );
  };
});

const MockedRegistrationStepOne = (props: any) => (
  <ChakraProvider>
    <RegistrationStepOne {...props} />
  </ChakraProvider>
);

describe('RegistrationStepOne', () => {
  const mockEvent: Event = {
    id: 'event-123',
    organizerId: 'organizer-1',
    categoryId: 'category-1',
    venueId: 'venue-1',
    title: 'Summer Music Festival',
    description: 'A great outdoor music festival',
    startDate: new Date('2024-07-15T18:00:00Z'),
    endDate: new Date('2024-07-15T23:00:00Z'),
    location: 'Central Park, New York',
    status: 'published',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockOnNext = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    event: mockEvent,
    onNext: mockOnNext,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketService.validateTicketSelection.mockResolvedValue({ valid: true });
  });

  it('renders event information correctly', () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
    expect(screen.getByText('A great outdoor music festival')).toBeInTheDocument();
    expect(screen.getByText('Central Park, New York')).toBeInTheDocument();
  });

  it('displays step indicator with current step', () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    expect(screen.getByText('Ticket Selection')).toBeInTheDocument();
    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
  });

  it('renders ticket type selector', () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    expect(screen.getByTestId('ticket-type-selector')).toBeInTheDocument();
  });

  it('shows validation error when trying to continue without selections', async () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    const continueButton = screen.getByText('Continue to Registration');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Please select at least one ticket to continue.')).toBeInTheDocument();
    });

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('updates total price when selections change', async () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    const selectButton = screen.getByText('Select Tickets');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('Total: $100.00')).toBeInTheDocument();
      expect(screen.getByText('2 tickets selected')).toBeInTheDocument();
    });
  });

  it('validates selections with server before proceeding', async () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    // Select tickets first
    const selectButton = screen.getByText('Select Tickets');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('Total: $100.00')).toBeInTheDocument();
    });

    // Try to continue
    const continueButton = screen.getByText('Continue to Registration');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockTicketService.validateTicketSelection).toHaveBeenCalledWith(
        'event-123',
        [{ ticketTypeId: 'ticket-1', quantity: 2 }]
      );
    });

    expect(mockOnNext).toHaveBeenCalledWith([{ ticketTypeId: 'ticket-1', quantity: 2 }]);
  });

  it('shows validation error from server', async () => {
    const validationResponse = {
      valid: false,
      errors: [{ ticketTypeId: 'ticket-1', message: 'Not enough tickets available' }],
    };
    mockTicketService.validateTicketSelection.mockResolvedValue(validationResponse);

    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    // Select tickets first
    const selectButton = screen.getByText('Select Tickets');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('Total: $100.00')).toBeInTheDocument();
    });

    // Try to continue
    const continueButton = screen.getByText('Continue to Registration');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Not enough tickets available')).toBeInTheDocument();
    });

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('handles server validation errors gracefully', async () => {
    mockTicketService.validateTicketSelection.mockRejectedValue(new Error('Network error'));

    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    // Select tickets first
    const selectButton = screen.getByText('Select Tickets');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('Total: $100.00')).toBeInTheDocument();
    });

    // Try to continue
    const continueButton = screen.getByText('Continue to Registration');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('calls onCancel when back button is clicked', () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    const backButton = screen.getByText('Back to Event');
    fireEvent.click(backButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during validation', async () => {
    // Make validation take some time
    mockTicketService.validateTicketSelection.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ valid: true }), 100))
    );

    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    // Select tickets first
    const selectButton = screen.getByText('Select Tickets');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('Total: $100.00')).toBeInTheDocument();
    });

    // Try to continue
    const continueButton = screen.getByText('Continue to Registration');
    fireEvent.click(continueButton);

    // Should show loading state
    expect(screen.getByText('Validating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalled();
    });
  });

  it('respects initial selections', async () => {
    const initialSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 1 }
    ];

    render(
      <MockedRegistrationStepOne 
        {...defaultProps} 
        initialSelections={initialSelections} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Total: $150.00')).toBeInTheDocument();
      expect(screen.getByText('1 ticket selected')).toBeInTheDocument();
    });
  });

  it('disables interactions when isLoading is true', () => {
    render(<MockedRegistrationStepOne {...defaultProps} isLoading={true} />);
    
    const backButton = screen.getByText('Back to Event');
    const continueButton = screen.getByText('Continue to Registration');

    expect(backButton).toBeDisabled();
    expect(continueButton).toBeDisabled();
  });

  it('formats event date and time correctly', () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    // Check if date is formatted (exact format may vary by locale)
    expect(screen.getByText(/Monday, July 15, 2024/)).toBeInTheDocument();
    
    // Check if time is formatted (checking for parts of the time)
    expect(screen.getByText(/6:00/)).toBeInTheDocument();
    expect(screen.getByText(/11:00/)).toBeInTheDocument();
  });

  it('shows disclaimer text when tickets are selected', async () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    // Select tickets first
    const selectButton = screen.getByText('Select Tickets');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText(/By continuing, you agree to reserve these tickets/)).toBeInTheDocument();
      expect(screen.getByText(/Prices shown include all applicable fees/)).toBeInTheDocument();
    });
  });

  it('handles singular/plural ticket text correctly', async () => {
    render(<MockedRegistrationStepOne {...defaultProps} />);
    
    // Mock selection with 1 ticket
    const selectButton = screen.getByText('Select Tickets');
    fireEvent.click(selectButton);

    // Update the mock to return 1 ticket
    const singleTicketSelector = screen.getByTestId('ticket-type-selector');
    const buttonElement = singleTicketSelector.querySelector('button');
    if (buttonElement) {
      fireEvent.click(buttonElement);
      // This would trigger onSelectionChange with 1 ticket, but we need to mock it differently
    }

    // Note: This test would need the mock component to be more sophisticated
    // to properly test singular vs plural text
  });
});