import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicketTypeSelector from './TicketTypeSelector';
import ticketService from '../../../services/ticketService';
import { TicketTypeWithAvailability } from '@jctop-event/shared-types';

// Mock the ticket service
jest.mock('../../../services/ticketService');
const mockTicketService = ticketService as jest.Mocked<typeof ticketService>;

const MockedTicketTypeSelector = (props: any) => (
  <ChakraProvider>
    <TicketTypeSelector {...props} />
  </ChakraProvider>
);

describe('TicketTypeSelector', () => {
  const mockEventId = 'event-123';
  const mockOnSelectionChange = jest.fn();

  const mockTicketTypes: TicketTypeWithAvailability[] = [
    {
      id: 'ticket-1',
      eventId: mockEventId,
      name: 'General Admission',
      price: 50,
      totalQuantity: 100,
      availableQuantity: 75,
      soldQuantity: 25,
    },
    {
      id: 'ticket-2',
      eventId: mockEventId,
      name: 'VIP',
      price: 150,
      totalQuantity: 20,
      availableQuantity: 15,
      soldQuantity: 5,
    },
    {
      id: 'ticket-3',
      eventId: mockEventId,
      name: 'Student',
      price: 30,
      totalQuantity: 50,
      availableQuantity: 0,
      soldQuantity: 50,
    },
  ];

  const defaultProps = {
    eventId: mockEventId,
    onSelectionChange: mockOnSelectionChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketService.getTicketTypesWithAvailability.mockResolvedValue(mockTicketTypes);
    mockTicketService.calculateTotalPrice.mockReturnValue(0);
    mockTicketService.validateSelectionClientSide.mockReturnValue({ valid: true, errors: [] });
  });

  it('renders loading state initially', () => {
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    expect(screen.getByText('Loading ticket information...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });

  it('renders ticket types after loading', async () => {
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('General Admission')).toBeInTheDocument();
      expect(screen.getByText('VIP')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
    });

    expect(screen.getByText('$50.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
    expect(screen.getByText('$30.00')).toBeInTheDocument();
  });

  it('shows sold out badge for unavailable tickets', async () => {
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Sold Out')).toBeInTheDocument();
    });
  });

  it('shows limited availability badge when few tickets remain', async () => {
    const limitedTicketTypes = [{
      ...mockTicketTypes[0],
      availableQuantity: 5,
    }];
    
    mockTicketService.getTicketTypesWithAvailability.mockResolvedValue(limitedTicketTypes);
    
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('5 left')).toBeInTheDocument();
    });
  });

  it('handles quantity changes correctly', async () => {
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    // Find the increment button for General Admission tickets
    const increaseButtons = screen.getAllByLabelText('Increase quantity');
    fireEvent.click(increaseButtons[0]);

    expect(mockOnSelectionChange).toHaveBeenCalled();
  });

  it('displays total when tickets are selected', async () => {
    mockTicketService.calculateTotalPrice.mockReturnValue(50);
    
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    // Simulate selection by directly calling the callback
    const increaseButtons = screen.getAllByLabelText('Increase quantity');
    fireEvent.click(increaseButtons[0]);

    // The total should be displayed after selection
    await waitFor(() => {
      expect(screen.getByText('Total Selected')).toBeInTheDocument();
    });
  });

  it('shows error state when API call fails', async () => {
    const errorMessage = 'Failed to load tickets';
    mockTicketService.getTicketTypesWithAvailability.mockRejectedValue(new Error(errorMessage));
    
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load ticket information')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows info message when no tickets are available', async () => {
    mockTicketService.getTicketTypesWithAvailability.mockResolvedValue([]);
    
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No tickets available')).toBeInTheDocument();
      expect(screen.getByText('Ticket sales have not started yet or all tickets have been sold.')).toBeInTheDocument();
    });
  });

  it('displays client-side validation errors', async () => {
    const validationErrors = ['General Admission: Only 75 tickets available'];
    mockTicketService.validateSelectionClientSide.mockReturnValue({ 
      valid: false, 
      errors: validationErrors 
    });
    
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    // Trigger an update to show validation errors
    const increaseButtons = screen.getAllByLabelText('Increase quantity');
    fireEvent.click(increaseButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Selection Error')).toBeInTheDocument();
      expect(screen.getByText(validationErrors[0])).toBeInTheDocument();
    });
  });

  it('disables interactions when isDisabled prop is true', async () => {
    render(<MockedTicketTypeSelector {...defaultProps} isDisabled={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    const increaseButtons = screen.getAllByLabelText('Increase quantity');
    const decreaseButtons = screen.getAllByLabelText('Decrease quantity');
    
    // All buttons should be disabled
    increaseButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
    decreaseButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('respects initial selections', async () => {
    const initialSelections = [{ ticketTypeId: 'ticket-1', quantity: 2 }];
    
    render(
      <MockedTicketTypeSelector 
        {...defaultProps} 
        initialSelections={initialSelections} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    // Should call onSelectionChange with initial selections
    expect(mockOnSelectionChange).toHaveBeenCalled();
  });

  it('formats prices correctly', async () => {
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('$50.00')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('$30.00')).toBeInTheDocument();
    });
  });

  it('shows availability information', async () => {
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('75 of 100 available')).toBeInTheDocument();
      expect(screen.getByText('15 of 20 available')).toBeInTheDocument();
      expect(screen.getByText('0 of 50 available')).toBeInTheDocument();
    });
  });

  it('shows sold quantity information', async () => {
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('25 already sold')).toBeInTheDocument();
      expect(screen.getByText('5 already sold')).toBeInTheDocument();
      expect(screen.getByText('50 already sold')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<MockedTicketTypeSelector {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('General Admission')).toBeInTheDocument();
    });

    // Check for proper aria-labels on quantity selectors
    expect(screen.getByLabelText('General Admission quantity selector')).toBeInTheDocument();
    expect(screen.getByLabelText('VIP quantity selector')).toBeInTheDocument();
  });
});