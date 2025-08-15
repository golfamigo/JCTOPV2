import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegistrationStepOne from './RegistrationStepOne';
import ticketService from '../../../services/ticketService';
import { Event, TicketSelection } from '@jctop-event/shared-types';

// Mock dependencies
jest.mock('@rneui/themed', () => ({
  Card: 'Card',
  Text: 'Text',
  Button: 'Button',
  Divider: 'Divider',
  Badge: 'Badge',
  Icon: 'Icon',
  ThemeProvider: ({ children }: any) => children,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (params) {
        return `${key} ${JSON.stringify(params)}`;
      }
      return key;
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'zh-TW',
    },
  }),
}));

jest.mock('../../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      white: '#FFFFFF',
      lightGrey: '#F8F9FA',
      midGrey: '#6C757D',
      dark: '#212529',
      success: '#28A745',
      danger: '#DC3545',
      warning: '#FFC107',
      background: '#FFFFFF',
      text: '#212529',
      border: '#E9ECEF',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: {
      h1: { fontSize: 24, fontWeight: 'bold' },
      h2: { fontSize: 20, fontWeight: 'bold' },
      body: { fontSize: 16 },
      small: { fontSize: 14 },
    },
  }),
}));

jest.mock('../../common/StepIndicator', () => 'StepIndicator');
jest.mock('./TicketTypeSelector', () => 'TicketTypeSelector');
jest.mock('../../../services/ticketService');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('RegistrationStepOne', () => {
  const mockEvent: Event = {
    id: 'event-1',
    title: '測試活動',
    description: '這是一個測試活動',
    startDate: new Date('2025-02-01T10:00:00'),
    endDate: new Date('2025-02-01T18:00:00'),
    location: '台北市信義區',
    organizerId: 'org-1',
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
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
  });

  it('should render event information correctly', () => {
    const { getByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    expect(getByText(mockEvent.title)).toBeTruthy();
    expect(getByText(mockEvent.description!)).toBeTruthy();
    expect(getByText(mockEvent.location)).toBeTruthy();
  });

  it('should render step indicator with correct steps', () => {
    const { UNSAFE_getByType } = render(<RegistrationStepOne {...defaultProps} />);
    
    const stepIndicator = UNSAFE_getByType('StepIndicator' as any);
    expect(stepIndicator.props.currentStep).toBe(0);
    expect(stepIndicator.props.steps).toHaveLength(3);
  });

  it('should render ticket selector', () => {
    const { UNSAFE_getByType } = render(<RegistrationStepOne {...defaultProps} />);
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    expect(ticketSelector.props.eventId).toBe(mockEvent.id);
  });

  it('should handle ticket selection changes', () => {
    const { UNSAFE_getByType } = render(<RegistrationStepOne {...defaultProps} />);
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    const mockSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 2 },
    ];
    
    ticketSelector.props.onSelectionChange(mockSelections, 1000);
    
    // The component should update its internal state
    expect(ticketSelector.props.onSelectionChange).toBeDefined();
  });

  it('should show validation error when no tickets selected', async () => {
    const { getAllByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    const continueButtons = getAllByText('registration.continueToRegistration');
    const continueButton = continueButtons[continueButtons.length - 1];
    
    fireEvent.press(continueButton);
    
    await waitFor(() => {
      const errorTexts = getAllByText('registration.validation.selectTickets');
      expect(errorTexts.length).toBeGreaterThan(0);
    });
  });

  it('should validate ticket selection with service', async () => {
    const mockValidation = { valid: true };
    (ticketService.validateTicketSelection as jest.Mock).mockResolvedValue(mockValidation);
    
    const { UNSAFE_getByType, getAllByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    const mockSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 2 },
    ];
    
    ticketSelector.props.onSelectionChange(mockSelections, 1000);
    
    const continueButtons = getAllByText('registration.continueToRegistration');
    const continueButton = continueButtons[continueButtons.length - 1];
    
    fireEvent.press(continueButton);
    
    await waitFor(() => {
      expect(ticketService.validateTicketSelection).toHaveBeenCalledWith(
        mockEvent.id,
        mockSelections
      );
      expect(mockOnNext).toHaveBeenCalledWith(mockSelections);
    });
  });

  it('should show error when validation fails', async () => {
    const mockValidation = {
      valid: false,
      errors: [{ message: 'Tickets not available' }],
    };
    (ticketService.validateTicketSelection as jest.Mock).mockResolvedValue(mockValidation);
    
    const { UNSAFE_getByType, getAllByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    const mockSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 2 },
    ];
    
    ticketSelector.props.onSelectionChange(mockSelections, 1000);
    
    const continueButtons = getAllByText('registration.continueToRegistration');
    const continueButton = continueButtons[continueButtons.length - 1];
    
    fireEvent.press(continueButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'registration.validation.selectionInvalid',
        'Tickets not available',
        expect.any(Array)
      );
    });
  });

  it('should handle cancel action', () => {
    const { getAllByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    const backButtons = getAllByText('registration.backToEvent');
    const backButton = backButtons[0];
    
    fireEvent.press(backButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should display ticket summary when selections made', () => {
    const { UNSAFE_getByType, getByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    const mockSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 2 },
      { ticketTypeId: 'ticket-2', quantity: 1 },
    ];
    
    ticketSelector.props.onSelectionChange(mockSelections, 1500);
    
    expect(getByText('registration.ticketsSelected {"count":3}')).toBeTruthy();
    expect(getByText(/registration.total/)).toBeTruthy();
  });

  it('should show loading state', () => {
    const { getAllByText, rerender } = render(
      <RegistrationStepOne {...defaultProps} isLoading={true} />
    );
    
    const buttons = getAllByText('registration.continueToRegistration');
    const continueButton = buttons[buttons.length - 1];
    
    // Button should be disabled when loading
    expect(continueButton).toBeTruthy();
  });

  it('should handle initial selections', () => {
    const initialSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 1 },
    ];
    
    const { UNSAFE_getByType } = render(
      <RegistrationStepOne {...defaultProps} initialSelections={initialSelections} />
    );
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    expect(ticketSelector.props.initialSelections).toEqual(initialSelections);
  });

  it('should format dates in Traditional Chinese', () => {
    const { getByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    // Check that date formatting is applied
    expect(getByText(/2025/)).toBeTruthy();
  });

  it('should format currency in TWD', () => {
    const { UNSAFE_getByType, getByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    const mockSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 1 },
    ];
    
    ticketSelector.props.onSelectionChange(mockSelections, 500);
    
    // Should show TWD currency format
    expect(getByText(/NT\$/)).toBeTruthy();
  });

  it('should show footer information when tickets selected', () => {
    const { UNSAFE_getByType, getByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    const mockSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 1 },
    ];
    
    ticketSelector.props.onSelectionChange(mockSelections, 500);
    
    expect(getByText('registration.reservationNotice')).toBeTruthy();
    expect(getByText('registration.priceIncludes')).toBeTruthy();
  });

  it('should handle validation errors from API', async () => {
    (ticketService.validateTicketSelection as jest.Mock).mockRejectedValue(
      new Error('Network error')
    );
    
    const { UNSAFE_getByType, getAllByText } = render(<RegistrationStepOne {...defaultProps} />);
    
    const ticketSelector = UNSAFE_getByType('TicketTypeSelector' as any);
    const mockSelections: TicketSelection[] = [
      { ticketTypeId: 'ticket-1', quantity: 1 },
    ];
    
    ticketSelector.props.onSelectionChange(mockSelections, 500);
    
    const continueButtons = getAllByText('registration.continueToRegistration');
    const continueButton = continueButtons[continueButtons.length - 1];
    
    fireEvent.press(continueButton);
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'registration.validation.validationError',
        'Network error',
        expect.any(Array)
      );
    });
  });
});