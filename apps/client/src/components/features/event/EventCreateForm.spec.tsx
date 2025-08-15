import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventCreateForm from './EventCreateForm';
import theme from '@/theme';
import { CreateEventDto } from '@jctop-event/shared-types';

// Mock toast
const mockToast = jest.fn();
// Removed ChakraUI mock

const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('EventCreateForm', () => {
  const mockOnSubmit = jest.fn();
  const mockCategories = [
    { id: 'cat-1', name: 'Conference' },
    { id: 'cat-2', name: 'Workshop' },
  ];
  const mockVenues = [
    { id: 'venue-1', name: 'Convention Center' },
    { id: 'venue-2', name: 'Hotel Ballroom' },
  ];

  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    categories: mockCategories,
    venues: mockVenues,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields', () => {
    renderWithChakra(<EventCreateForm {...defaultProps} />);

    expect(screen.getByLabelText(/event title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date & time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date & time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/venue/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create event/i })).toBeInTheDocument();
  });

  it('should render category and venue options', () => {
    renderWithChakra(<EventCreateForm {...defaultProps} />);

    const categorySelect = screen.getByLabelText(/category/i);
    const venueSelect = screen.getByLabelText(/venue/i);

    fireEvent.click(categorySelect);
    expect(screen.getByText('Conference')).toBeInTheDocument();
    expect(screen.getByText('Workshop')).toBeInTheDocument();

    fireEvent.click(venueSelect);
    expect(screen.getByText('Convention Center')).toBeInTheDocument();
    expect(screen.getByText('Hotel Ballroom')).toBeInTheDocument();
  });

  it('should display loading state when isLoading is true', () => {
    renderWithChakra(<EventCreateForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /creating event/i });
    expect(submitButton).toBeDisabled();
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /create event/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/start date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/end date is required/i)).toBeInTheDocument();
        expect(screen.getByText(/location is required/i)).toBeInTheDocument();
        expect(screen.getByText(/category is required/i)).toBeInTheDocument();
        expect(screen.getByText(/venue is required/i)).toBeInTheDocument();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Validation Error',
        description: 'Please correct the errors in the form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when title exceeds 255 characters', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/event title/i);
      const longTitle = 'a'.repeat(256);
      
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));

      await waitFor(() => {
        expect(screen.getByText(/title cannot exceed 255 characters/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate future start date', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      const startDateInput = screen.getByLabelText(/start date & time/i);
      const pastDate = '2020-01-01T10:00';
      
      fireEvent.change(startDateInput, { target: { value: pastDate } });
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));

      await waitFor(() => {
        expect(screen.getByText(/start date must be in the future/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate end date is after start date', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      const startDateInput = screen.getByLabelText(/start date & time/i);
      const endDateInput = screen.getByLabelText(/end date & time/i);
      
      fireEvent.change(startDateInput, { target: { value: '2025-12-01T18:00' } });
      fireEvent.change(endDateInput, { target: { value: '2025-12-01T10:00' } });
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));

      await waitFor(() => {
        expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear errors when user starts typing', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      // Trigger validation error first
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Start typing to clear error
      const titleInput = screen.getByLabelText(/event title/i);
      fireEvent.change(titleInput, { target: { value: 'Test Event' } });

      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      title: 'Test Event',
      description: 'Test Description',
      startDate: '2025-12-01T10:00',
      endDate: '2025-12-01T18:00',
      location: 'Test Location',
      categoryId: 'cat-1',
      venueId: 'venue-1',
    };

    const fillForm = () => {
      fireEvent.change(screen.getByLabelText(/event title/i), {
        target: { value: validFormData.title },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: validFormData.description },
      });
      fireEvent.change(screen.getByLabelText(/start date & time/i), {
        target: { value: validFormData.startDate },
      });
      fireEvent.change(screen.getByLabelText(/end date & time/i), {
        target: { value: validFormData.endDate },
      });
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: validFormData.location },
      });
      fireEvent.change(screen.getByLabelText(/category/i), {
        target: { value: validFormData.categoryId },
      });
      fireEvent.change(screen.getByLabelText(/venue/i), {
        target: { value: validFormData.venueId },
      });
    };

    it('should submit form with valid data', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByRole('button', { name: /create event/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: validFormData.title,
          description: validFormData.description,
          startDate: validFormData.startDate,
          endDate: validFormData.endDate,
          location: validFormData.location,
          categoryId: validFormData.categoryId,
          venueId: validFormData.venueId,
        });
      });
    });

    it('should submit form without optional description', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      const { description, ...dataWithoutDescription } = validFormData;
      
      fireEvent.change(screen.getByLabelText(/event title/i), {
        target: { value: dataWithoutDescription.title },
      });
      fireEvent.change(screen.getByLabelText(/start date & time/i), {
        target: { value: dataWithoutDescription.startDate },
      });
      fireEvent.change(screen.getByLabelText(/end date & time/i), {
        target: { value: dataWithoutDescription.endDate },
      });
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: dataWithoutDescription.location },
      });
      fireEvent.change(screen.getByLabelText(/category/i), {
        target: { value: dataWithoutDescription.categoryId },
      });
      fireEvent.change(screen.getByLabelText(/venue/i), {
        target: { value: dataWithoutDescription.venueId },
      });

      fireEvent.click(screen.getByRole('button', { name: /create event/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          ...dataWithoutDescription,
          description: undefined,
        });
      });
    });

    it('should trim whitespace from text inputs', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      fireEvent.change(screen.getByLabelText(/event title/i), {
        target: { value: '  Test Event  ' },
      });
      fireEvent.change(screen.getByLabelText(/description/i), {
        target: { value: '  Test Description  ' },
      });
      fireEvent.change(screen.getByLabelText(/location/i), {
        target: { value: '  Test Location  ' },
      });
      fireEvent.change(screen.getByLabelText(/start date & time/i), {
        target: { value: validFormData.startDate },
      });
      fireEvent.change(screen.getByLabelText(/end date & time/i), {
        target: { value: validFormData.endDate },
      });
      fireEvent.change(screen.getByLabelText(/category/i), {
        target: { value: validFormData.categoryId },
      });
      fireEvent.change(screen.getByLabelText(/venue/i), {
        target: { value: validFormData.venueId },
      });

      fireEvent.click(screen.getByRole('button', { name: /create event/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Event',
          description: 'Test Description',
          location: 'Test Location',
          startDate: validFormData.startDate,
          endDate: validFormData.endDate,
          categoryId: validFormData.categoryId,
          venueId: validFormData.venueId,
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      expect(screen.getByLabelText(/event title/i)).toHaveAttribute('id', 'title');
      expect(screen.getByLabelText(/description/i)).toHaveAttribute('id', 'description');
      expect(screen.getByLabelText(/start date & time/i)).toHaveAttribute('id', 'startDate');
      expect(screen.getByLabelText(/end date & time/i)).toHaveAttribute('id', 'endDate');
      expect(screen.getByLabelText(/location/i)).toHaveAttribute('id', 'location');
      expect(screen.getByLabelText(/category/i)).toHaveAttribute('id', 'categoryId');
      expect(screen.getByLabelText(/venue/i)).toHaveAttribute('id', 'venueId');
    });

    it('should associate error messages with inputs via aria-describedby', async () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      fireEvent.click(screen.getByRole('button', { name: /create event/i }));

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/event title/i);
        expect(titleInput).toHaveAttribute('aria-describedby', 'title-error');
        
        const startDateInput = screen.getByLabelText(/start date & time/i);
        expect(startDateInput).toHaveAttribute('aria-describedby', 'start-date-error');
      });
    });

    it('should be keyboard navigable', () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      const titleInput = screen.getByLabelText(/event title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const submitButton = screen.getByRole('button', { name: /create event/i });

      titleInput.focus();
      expect(document.activeElement).toBe(titleInput);

      // Tab navigation should work
      fireEvent.keyDown(titleInput, { key: 'Tab' });
      expect(document.activeElement).toBe(descriptionInput);
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive padding', () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      const container = screen.getByRole('form').parentElement;
      expect(container).toHaveStyle('max-width: 600px');
    });

    it('should stack date inputs horizontally on larger screens', () => {
      renderWithChakra(<EventCreateForm {...defaultProps} />);

      const startDateControl = screen.getByLabelText(/start date & time/i).closest('[data-testid="form-control"]') || 
                              screen.getByLabelText(/start date & time/i).closest('div');
      const endDateControl = screen.getByLabelText(/end date & time/i).closest('[data-testid="form-control"]') ||
                            screen.getByLabelText(/end date & time/i).closest('div');

      // Both should be within the same HStack
      expect(startDateControl?.parentElement).toBe(endDateControl?.parentElement);
    });
  });
});