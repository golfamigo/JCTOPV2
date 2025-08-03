import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import RegistrationStepTwo from './RegistrationStepTwo';
import registrationService from '../../../services/registrationService';
import { Event, TicketSelection, CustomRegistrationField } from '@jctop-event/shared-types';

// Mock the registration service
jest.mock('../../../services/registrationService');
const mockedRegistrationService = registrationService as jest.Mocked<typeof registrationService>;

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

const mockEvent: Event = {
  id: 'event-1',
  organizerId: 'user-1',
  categoryId: 'cat-1',
  venueId: 'venue-1',
  title: 'Test Event',
  description: 'Test event description',
  startDate: new Date('2024-12-01T10:00:00Z'),
  endDate: new Date('2024-12-01T18:00:00Z'),
  location: 'Test Venue',
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTicketSelections: TicketSelection[] = [
  { ticketTypeId: 'ticket-1', quantity: 2 },
  { ticketTypeId: 'ticket-2', quantity: 1 },
];

const mockCustomFields: CustomRegistrationField[] = [
  {
    id: 'field-1',
    eventId: 'event-1',
    fieldName: 'full_name',
    fieldType: 'text',
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    order: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'field-2',
    eventId: 'event-1',
    fieldName: 'email',
    fieldType: 'email',
    label: 'Email Address',
    placeholder: 'Enter your email',
    required: true,
    order: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'field-3',
    eventId: 'event-1',
    fieldName: 'dietary_requirements',
    fieldType: 'select',
    label: 'Dietary Requirements',
    required: false,
    options: ['None', 'Vegetarian', 'Vegan', 'Gluten-Free'],
    order: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('RegistrationStepTwo', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();

  const defaultProps = {
    event: mockEvent,
    ticketSelections: mockTicketSelections,
    onNext: mockOnNext,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedRegistrationService.getCustomFields.mockResolvedValue(mockCustomFields);
  });

  it('should render loading state initially', () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    expect(screen.getByText(/loading registration form.../i)).toBeInTheDocument();
  });

  it('should load and display custom fields', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dietary requirements/i)).toBeInTheDocument();
    expect(mockedRegistrationService.getCustomFields).toHaveBeenCalledWith('event-1');
  });

  it('should display step indicator with correct current step', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Registration')).toBeInTheDocument();
    });
  });

  it('should display event title in page header', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/registration details/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/test event/i)).toBeInTheDocument();
  });

  it('should handle field value changes', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    expect(nameInput).toHaveValue('John Doe');
  });

  it('should validate required fields', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/continue to payment/i)).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', { name: /continue to payment/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const continueButton = screen.getByRole('button', { name: /continue to payment/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it('should proceed to next step with valid form data', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    // Fill required fields
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    const continueButton = screen.getByRole('button', { name: /continue to payment/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith({
        ticketSelections: mockTicketSelections,
        customFieldValues: {
          'field-1': 'John Doe',
          'field-2': 'john@example.com',
        },
        discountCode: undefined,
        totalAmount: 150, // 3 tickets × $50 placeholder price
        discountAmount: 0,
      });
    });
  });

  it('should handle back button click', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/back to tickets/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to tickets/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should display order summary', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/order summary/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/ticket × 2/i)).toBeInTheDocument();
    expect(screen.getByText(/ticket × 1/i)).toBeInTheDocument();
    expect(screen.getByText(/\$150\.00/)).toBeInTheDocument(); // Total
  });

  it('should handle discount code application', async () => {
    mockedRegistrationService.validateDiscountCode.mockResolvedValue({
      valid: true,
      discountAmount: 15,
      finalAmount: 135,
    });

    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter discount code/i)).toBeInTheDocument();
    });

    const discountInput = screen.getByPlaceholderText(/enter discount code/i);
    const applyButton = screen.getByRole('button', { name: /apply/i });

    fireEvent.change(discountInput, { target: { value: 'DISCOUNT15' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(screen.getByText(/discount applied successfully/i)).toBeInTheDocument();
    });

    expect(screen.getByText('-$15.00')).toBeInTheDocument();
    expect(screen.getByText('$135.00')).toBeInTheDocument();
  });

  it('should handle API error when loading fields', async () => {
    mockedRegistrationService.getCustomFields.mockRejectedValue(new Error('API Error'));

    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load registration form/i)).toBeInTheDocument();
    });

    expect(screen.getByText('API Error')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should retry loading fields when try again is clicked', async () => {
    mockedRegistrationService.getCustomFields
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(mockCustomFields);

    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load registration form/i)).toBeInTheDocument();
    });

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });
  });

  it('should handle select field options', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/dietary requirements/i)).toBeInTheDocument();
    });

    const selectField = screen.getByDisplayValue('');
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Vegetarian')).toBeInTheDocument();
    expect(screen.getByText('Vegan')).toBeInTheDocument();
    expect(screen.getByText('Gluten-Free')).toBeInTheDocument();
  });

  it('should initialize with initial form data', () => {
    const initialFormData = {
      customFieldValues: {
        'field-1': 'Pre-filled Name',
        'field-2': 'pre@example.com',
      },
    };

    renderWithChakra(
      <RegistrationStepTwo {...defaultProps} initialFormData={initialFormData} />
    );

    // Values should be set after fields load
    waitFor(() => {
      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      expect(nameInput).toHaveValue('Pre-filled Name');
      expect(emailInput).toHaveValue('pre@example.com');
    });
  });

  it('should clear field errors when user starts typing', async () => {
    renderWithChakra(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    // Trigger validation error
    const continueButton = screen.getByRole('button', { name: /continue to payment/i });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });

    // Start typing to clear error
    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: 'J' } });

    await waitFor(() => {
      expect(screen.queryByText(/full name is required/i)).not.toBeInTheDocument();
    });
  });
});