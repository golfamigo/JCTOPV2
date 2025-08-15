import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SeatingZone } from '@jctop-event/shared-types';
import SeatingConfiguration from './SeatingConfiguration';

// Mock useToast (removed since we're not using ChakraUI anymore)
const mockToast = jest.fn();

const mockSeatingZones: SeatingZone[] = [
  {
    id: '1',
    eventId: 'event-1',
    name: 'Orchestra',
    capacity: 200,
    description: 'Main floor seating',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    eventId: 'event-1',
    name: 'Balcony',
    capacity: 100,
    description: 'Upper level seating',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('SeatingConfiguration', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component correctly', () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('Seating Configuration')).toBeInTheDocument();
    expect(screen.getByText('Define seating areas and zones for your event')).toBeInTheDocument();
  });

  it('should initialize with one empty seating zone when no zones provided', () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    expect(screen.getByText('Seating Zone 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Zone Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Capacity')).toBeInTheDocument();
    expect(screen.getByLabelText('Description (Optional)')).toBeInTheDocument();
  });

  it('should display existing seating zones when provided', () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={mockSeatingZones} onChange={mockOnChange} />
    );

    expect(screen.getByText('Seating Zone 1')).toBeInTheDocument();
    expect(screen.getByText('Seating Zone 2')).toBeInTheDocument();
    
    expect(screen.getByDisplayValue('Orchestra')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Balcony')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Main floor seating')).toBeInTheDocument();
  });

  it('should add a new seating zone when Add button is clicked', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const addButton = screen.getByText('Add Another Seating Zone');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Seating Zone 2')).toBeInTheDocument();
    });
  });

  it('should remove a seating zone when delete button is clicked', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={mockSeatingZones} onChange={mockOnChange} />
    );

    const deleteButtons = screen.getAllByLabelText(/Remove seating zone/);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should not allow removing the last seating zone', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    // Try to find delete button - there should be none for single seating zone
    const deleteButtons = screen.queryAllByLabelText(/Remove seating zone/);
    expect(deleteButtons).toHaveLength(0);
  });

  it('should show warning when trying to add more than 20 seating zones', async () => {
    const manySeatingZones = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      eventId: 'event-1',
      name: `Zone ${i + 1}`,
      capacity: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    renderWithChakra(
      <SeatingConfiguration seatingZones={manySeatingZones} onChange={mockOnChange} />
    );

    const addButton = screen.getByText('Add Another Seating Zone');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Maximum seating zones reached',
        description: 'You can create up to 20 seating zones per event',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    });
  });

  it('should validate zone name is required', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Zone Name');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Zone name is required')).toBeInTheDocument();
    });
  });

  it('should validate capacity must be at least 1', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const capacityInput = screen.getByLabelText('Capacity');
    fireEvent.change(capacityInput, { target: { value: '0' } });

    await waitFor(() => {
      expect(screen.getByText('Capacity must be at least 1')).toBeInTheDocument();
    });
  });

  it('should validate zone names are unique', async () => {
    const duplicateSeatingZones = [
      { 
        id: '1', 
        eventId: 'event-1', 
        name: 'VIP', 
        capacity: 50, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        id: '2', 
        eventId: 'event-1', 
        name: 'VIP', 
        capacity: 25, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ];

    renderWithChakra(
      <SeatingConfiguration seatingZones={duplicateSeatingZones} onChange={mockOnChange} />
    );

    await waitFor(() => {
      expect(screen.getByText('Zone name must be unique')).toBeInTheDocument();
    });
  });

  it('should calculate total seating capacity correctly', () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={mockSeatingZones} onChange={mockOnChange} />
    );

    expect(screen.getByText('300 seats')).toBeInTheDocument(); // 200 + 100
  });

  it('should show venue capacity and utilization when venueCapacity provided', () => {
    renderWithChakra(
      <SeatingConfiguration 
        seatingZones={mockSeatingZones} 
        onChange={mockOnChange} 
        venueCapacity={500} 
      />
    );

    expect(screen.getByText('500 seats')).toBeInTheDocument(); // Venue capacity
    expect(screen.getByText('60.0%')).toBeInTheDocument(); // 300/500 * 100
  });

  it('should show over-capacity warning when seating exceeds venue capacity', () => {
    renderWithChakra(
      <SeatingConfiguration 
        seatingZones={mockSeatingZones} 
        onChange={mockOnChange} 
        venueCapacity={250} 
      />
    );

    expect(screen.getByText('Seating exceeds venue capacity')).toBeInTheDocument();
    expect(screen.getByText(/exceeds the venue capacity of 250 seats by 50 seats/)).toBeInTheDocument();
  });

  it('should handle input changes and call onChange', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Zone Name');
    fireEvent.change(nameInput, { target: { value: 'Test Zone' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should disable add button when at maximum seating zones', () => {
    const maxSeatingZones = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      eventId: 'event-1',
      name: `Zone ${i + 1}`,
      capacity: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    renderWithChakra(
      <SeatingConfiguration seatingZones={maxSeatingZones} onChange={mockOnChange} />
    );

    const addButton = screen.getByText('Add Another Seating Zone');
    expect(addButton).toBeDisabled();
  });

  it('should show error alert when validation errors exist', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Zone Name');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);

    await waitFor(() => {
      expect(screen.getByText('Please correct the errors in the seating configuration above.')).toBeInTheDocument();
    });
  });

  it('should be read-only when isReadOnly prop is true', () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={mockSeatingZones} onChange={mockOnChange} isReadOnly={true} />
    );

    const nameInput = screen.getByDisplayValue('Orchestra');
    expect(nameInput).toHaveAttribute('readonly');

    const addButton = screen.queryByText('Add Another Seating Zone');
    expect(addButton).not.toBeInTheDocument();
  });

  it('should handle accessibility correctly', () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Zone Name');
    expect(nameInput).toHaveAttribute('aria-describedby');

    const capacityInput = screen.getByLabelText('Capacity');
    expect(capacityInput).toHaveAttribute('aria-describedby');
  });

  it('should show individual zone capacity', () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={mockSeatingZones} onChange={mockOnChange} />
    );

    expect(screen.getByText('Zone capacity: 200 seats')).toBeInTheDocument();
    expect(screen.getByText('Zone capacity: 100 seats')).toBeInTheDocument();
  });

  it('should handle capacity changes with number input steppers', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const incrementButton = screen.getByLabelText('increment');
    fireEvent.click(incrementButton);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should handle description changes', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const descriptionInput = screen.getByLabelText('Description (Optional)');
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  it('should show progress bar with correct color scheme', () => {
    renderWithChakra(
      <SeatingConfiguration 
        seatingZones={mockSeatingZones} 
        onChange={mockOnChange} 
        venueCapacity={250} // Over capacity
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should handle capacity validation for maximum values', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const capacityInput = screen.getByLabelText('Capacity');
    fireEvent.change(capacityInput, { target: { value: '1000000' } });

    await waitFor(() => {
      expect(screen.getByText('Capacity cannot exceed 999,999')).toBeInTheDocument();
    });
  });

  it('should handle name validation for maximum length', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    const nameInput = screen.getByLabelText('Zone Name');
    const longName = 'a'.repeat(256);
    fireEvent.change(nameInput, { target: { value: longName } });

    await waitFor(() => {
      expect(screen.getByText('Zone name cannot exceed 255 characters')).toBeInTheDocument();
    });
  });

  it('should prevent removal when only one zone exists and show toast', async () => {
    renderWithChakra(
      <SeatingConfiguration seatingZones={[]} onChange={mockOnChange} />
    );

    // Add a second zone first
    const addButton = screen.getByText('Add Another Seating Zone');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Seating Zone 2')).toBeInTheDocument();
    });

    // Remove one zone
    const deleteButtons = screen.getAllByLabelText(/Remove seating zone/);
    fireEvent.click(deleteButtons[0]);

    // Now try to remove the last zone (should show toast)
    await waitFor(() => {
      const remainingDeleteButtons = screen.queryAllByLabelText(/Remove seating zone/);
      if (remainingDeleteButtons.length > 0) {
        fireEvent.click(remainingDeleteButtons[0]);
      }
    });

    expect(mockToast).toHaveBeenCalledWith({
      title: 'Cannot remove last seating zone',
      description: 'Events must have at least one seating zone',
      status: 'warning',
      duration: 3000,
      isClosable: true,
    });
  });
});