import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TicketType } from '@jctop-event/shared-types';
import TicketConfiguration from './TicketConfiguration';

// Mock useToast (removed since we're not using ChakraUI anymore)
const mockToast = jest.fn();

const mockTicketTypes: TicketType[] = [
  {
    id: '1',
    eventId: 'event-1',
    name: 'General Admission',
    price: 50,
    quantity: 100,
  },
  {
    id: '2',
    eventId: 'event-1',
    name: 'VIP',
    price: 150,
    quantity: 25,
  },
];

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('TicketConfiguration', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component correctly', () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('Ticket Configuration')).toBeInTheDocument();
    expect(screen.getByText('Set up different ticket types with pricing and quantities')).toBeInTheDocument();
  });

  it('should initialize with one empty ticket type when no ticket types provided', () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('Ticket Type 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Ticket Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Price ($)')).toBeInTheDocument();
    expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
  });

  it('should display existing ticket types when provided', () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={mockTicketTypes} onChange={mockOnChange} />
    );

    expect(screen.getByText('Ticket Type 1')).toBeInTheDocument();
    expect(screen.getByText('Ticket Type 2')).toBeInTheDocument();
    
    expect(screen.getByDisplayValue('General Admission')).toBeInTheDocument();
    expect(screen.getByDisplayValue('VIP')).toBeInTheDocument();
  });

  it('should add a new ticket type when Add button is clicked', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const addButton = screen.getByText('Add Another Ticket Type');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Ticket Type 2')).toBeInTheDocument();
    });
  });

  it('should remove a ticket type when delete button is clicked', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={mockTicketTypes} onChange={mockOnChange} />
    );

    const deleteButtons = screen.getAllByLabelText(/Remove ticket type/);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should not allow removing the last ticket type', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    // Try to find delete button - there should be none for single ticket type
    const deleteButtons = screen.queryAllByLabelText(/Remove ticket type/);
    expect(deleteButtons).toHaveLength(0);
  });

  it('should show warning when trying to add more than 10 ticket types', async () => {
    const manyTicketTypes = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      eventId: 'event-1',
      name: `Ticket ${i + 1}`,
      price: 50 + i * 10,
      quantity: 100,
    }));

    renderWithChakra(
      <TicketConfiguration ticketTypes={manyTicketTypes} onChange={mockOnChange} />
    );

    const addButton = screen.getByText('Add Another Ticket Type');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Maximum ticket types reached',
        description: 'You can create up to 10 ticket types per event',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it('should validate ticket name is required', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Ticket Name');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Ticket name is required')).toBeInTheDocument();
    });
  });

  it('should validate price cannot be negative', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const priceInput = screen.getByLabelText('Price ($)');
    fireEvent.change(priceInput, { target: { value: '-10' } });

    await waitFor(() => {
      expect(screen.getByText('Price cannot be negative')).toBeInTheDocument();
    });
  });

  it('should validate quantity must be at least 1', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const quantityInput = screen.getByLabelText('Quantity');
    fireEvent.change(quantityInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByText('Quantity must be at least 1')).toBeInTheDocument();
    });
  });

  it('should validate ticket names are unique', async () => {
    const duplicateTicketTypes = [
      { id: '1', eventId: 'event-1', name: 'General', price: 50, quantity: 100 },
      { id: '2', eventId: 'event-1', name: 'General', price: 75, quantity: 50 },
    ];

    renderWithChakra(
      <TicketConfiguration ticketTypes={duplicateTicketTypes} onChange={mockOnChange} />
    );

    await waitFor(() => {
      expect(screen.getByText('Ticket name must be unique')).toBeInTheDocument();
    });
  });

  it('should calculate total capacity correctly', () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={mockTicketTypes} onChange={mockOnChange} />
    );

    expect(screen.getByText('125 tickets')).toBeInTheDocument(); // 100 + 25
  });

  it('should calculate potential revenue correctly', () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={mockTicketTypes} onChange={mockOnChange} />
    );

    expect(screen.getByText('$8750.00')).toBeInTheDocument(); // (50 * 100) + (150 * 25)
  });

  it('should handle input changes and call onChange', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Ticket Name');
    fireEvent.change(nameInput, { target: { value: 'Test Ticket' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should disable add button when at maximum ticket types', () => {
    const maxTicketTypes = Array.from({ length: 10 }, (_, i) => ({
      id: `${i + 1}`,
      eventId: 'event-1',
      name: `Ticket ${i + 1}`,
      price: 50,
      quantity: 100,
    }));

    renderWithChakra(
      <TicketConfiguration ticketTypes={maxTicketTypes} onChange={mockOnChange} />
    );

    const addButton = screen.getByText('Add Another Ticket Type');
    expect(addButton).toBeDisabled();
  });

  it('should show error alert when validation errors exist', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Ticket Name');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Please correct the errors in the ticket configuration above.')).toBeInTheDocument();
    });
  });

  it('should be read-only when isReadOnly prop is true', () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={mockTicketTypes} onChange={mockOnChange} isReadOnly={true} />
    );

    const nameInput = screen.getByDisplayValue('General Admission');
    expect(nameInput).toHaveAttribute('readonly');

    const addButton = screen.queryByText('Add Another Ticket Type');
    expect(addButton).not.toBeInTheDocument();
  });

  it('should handle accessibility correctly', () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Ticket Name');
    expect(nameInput).toHaveAttribute('aria-describedby');

    const priceInput = screen.getByLabelText('Price ($)');
    expect(priceInput).toHaveAttribute('aria-describedby');

    const quantityInput = screen.getByLabelText('Quantity');
    expect(quantityInput).toHaveAttribute('aria-describedby');
  });

  it('should show revenue calculation for individual ticket types', () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={mockTicketTypes} onChange={mockOnChange} />
    );

    expect(screen.getByText('Revenue for this ticket type: $5000.00')).toBeInTheDocument(); // 50 * 100
    expect(screen.getByText('Revenue for this ticket type: $3750.00')).toBeInTheDocument(); // 150 * 25
  });

  it('should handle price changes with number input steppers', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const incrementButton = screen.getAllByLabelText('increment')[0]; // Price increment
    fireEvent.click(incrementButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should handle quantity changes with number input steppers', async () => {
    renderWithChakra(
      <TicketConfiguration ticketTypes={[]} onChange={mockOnChange} />
    );

    const incrementButton = screen.getAllByLabelText('increment')[1]; // Quantity increment
    fireEvent.click(incrementButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});