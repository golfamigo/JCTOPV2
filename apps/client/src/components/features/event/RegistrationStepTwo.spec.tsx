import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegistrationStepTwo from './RegistrationStepTwo';
import registrationService from '../../../services/registrationService';
import { Event, TicketSelection, RegistrationFormData, CustomRegistrationField } from '@jctop-event/shared-types';

// Mock dependencies
jest.mock('@rneui/themed', () => ({
  Card: 'Card',
  Text: 'Text',
  Button: 'Button',
  Divider: 'Divider',
  Icon: 'Icon',
  Input: 'Input',
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
jest.mock('./DynamicFieldRenderer', () => 'DynamicFieldRenderer');
jest.mock('./DiscountCodeInput', () => 'DiscountCodeInput');
jest.mock('../../../services/registrationService');

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('RegistrationStepTwo', () => {
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

  const mockTicketSelections: TicketSelection[] = [
    { ticketTypeId: 'ticket-1', quantity: 2 },
    { ticketTypeId: 'ticket-2', quantity: 1 },
  ];

  const mockCustomFields: CustomRegistrationField[] = [
    {
      id: 'field-1',
      label: '姓名',
      fieldType: 'text',
      required: true,
      order: 1,
    },
    {
      id: 'field-2',
      label: '電子郵件',
      fieldType: 'email',
      required: true,
      order: 2,
    },
    {
      id: 'field-3',
      label: '電話號碼',
      fieldType: 'text',
      required: false,
      order: 3,
    },
  ];

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
    (registrationService.getCustomFields as jest.Mock).mockResolvedValue(mockCustomFields);
  });

  it('should render step indicator with correct steps', async () => {
    const { UNSAFE_getByType } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const stepIndicator = UNSAFE_getByType('StepIndicator' as any);
      expect(stepIndicator.props.currentStep).toBe(1);
      expect(stepIndicator.props.steps).toHaveLength(3);
    });
  });

  it('should load and display custom fields', async () => {
    const { UNSAFE_getAllByType } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const dynamicFields = UNSAFE_getAllByType('DynamicFieldRenderer' as any);
      expect(dynamicFields).toHaveLength(mockCustomFields.length);
      expect(registrationService.getCustomFields).toHaveBeenCalledWith(mockEvent.id);
    });
  });

  it('should handle field value changes', async () => {
    const { UNSAFE_getAllByType } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const dynamicFields = UNSAFE_getAllByType('DynamicFieldRenderer' as any);
      expect(dynamicFields.length).toBeGreaterThan(0);
    });

    const firstField = UNSAFE_getAllByType('DynamicFieldRenderer' as any)[0];
    firstField.props.onChange('Test Name');
    
    expect(firstField.props.value).toBeDefined();
  });

  it('should display discount code input', async () => {
    const { UNSAFE_getByType } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const discountInput = UNSAFE_getByType('DiscountCodeInput' as any);
      expect(discountInput).toBeDefined();
      expect(discountInput.props.eventId).toBe(mockEvent.id);
      expect(discountInput.props.totalAmount).toBe(150); // 3 tickets * 50 (placeholder price)
    });
  });

  it('should display order summary with correct calculations', async () => {
    const { getByText } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      expect(getByText(/registration.orderSummary/)).toBeTruthy();
      expect(getByText(/registration.ticketQuantity × 2/)).toBeTruthy();
      expect(getByText(/registration.ticketQuantity × 1/)).toBeTruthy();
      expect(getByText(/registration.total/)).toBeTruthy();
    });
  });

  it('should validate required fields before submission', async () => {
    const { getAllByText } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const continueButtons = getAllByText('registration.continueToPayment');
      expect(continueButtons.length).toBeGreaterThan(0);
    });

    const continueButton = getAllByText('registration.continueToPayment')[0];
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'registration.formValidation.errorTitle',
        'registration.formValidation.errorDescription',
        expect.any(Array)
      );
      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  it('should submit form with valid data', async () => {
    const { UNSAFE_getAllByType, getAllByText } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const dynamicFields = UNSAFE_getAllByType('DynamicFieldRenderer' as any);
      expect(dynamicFields.length).toBeGreaterThan(0);
    });

    // Fill in required fields
    const fields = UNSAFE_getAllByType('DynamicFieldRenderer' as any);
    fields[0].props.onChange('Test User'); // Name
    fields[1].props.onChange('test@example.com'); // Email

    const continueButton = getAllByText('registration.continueToPayment')[0];
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(mockOnNext).toHaveBeenCalledWith(
        expect.objectContaining({
          ticketSelections: mockTicketSelections,
          customFieldValues: expect.any(Object),
          totalAmount: 150,
        })
      );
    });
  });

  it('should handle discount code application', async () => {
    const { UNSAFE_getByType } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const discountInput = UNSAFE_getByType('DiscountCodeInput' as any);
      expect(discountInput).toBeDefined();
    });

    const discountInput = UNSAFE_getByType('DiscountCodeInput' as any);
    const mockDiscountResult = {
      valid: true,
      discountAmount: 30,
      finalAmount: 120,
    };
    
    discountInput.props.onDiscountApplied(mockDiscountResult, 'TESTCODE');

    // Verify discount is reflected in the form data
    expect(discountInput.props.totalAmount).toBe(150);
  });

  it('should handle back navigation', async () => {
    const { getAllByText } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const backButtons = getAllByText('registration.backToTickets');
      expect(backButtons.length).toBeGreaterThan(0);
    });

    const backButton = getAllByText('registration.backToTickets')[0];
    fireEvent.press(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should show loading state while fetching fields', () => {
    (registrationService.getCustomFields as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { getByText } = render(<RegistrationStepTwo {...defaultProps} />);
    
    expect(getByText('registration.loadingForm')).toBeTruthy();
  });

  it('should handle error when loading fields fails', async () => {
    const errorMessage = 'Failed to load fields';
    (registrationService.getCustomFields as jest.Mock).mockRejectedValue(
      new Error(errorMessage)
    );

    const { getByText } = render(<RegistrationStepTwo {...defaultProps} />);

    await waitFor(() => {
      expect(getByText('registration.errors.loadFormFailed')).toBeTruthy();
      expect(getByText(errorMessage)).toBeTruthy();
      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  it('should preserve initial form data', async () => {
    const initialFormData = {
      customFieldValues: {
        'field-1': 'Initial Name',
        'field-2': 'initial@email.com',
      },
      discountCode: 'INITIAL',
    };

    const { UNSAFE_getAllByType } = render(
      <RegistrationStepTwo {...defaultProps} initialFormData={initialFormData} />
    );

    await waitFor(() => {
      const dynamicFields = UNSAFE_getAllByType('DynamicFieldRenderer' as any);
      expect(dynamicFields[0].props.value).toBe('Initial Name');
      expect(dynamicFields[1].props.value).toBe('initial@email.com');
    });
  });

  it('should validate email format', async () => {
    const { UNSAFE_getAllByType, getAllByText } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      const dynamicFields = UNSAFE_getAllByType('DynamicFieldRenderer' as any);
      expect(dynamicFields.length).toBeGreaterThan(0);
    });

    // Fill in fields with invalid email
    const fields = UNSAFE_getAllByType('DynamicFieldRenderer' as any);
    fields[0].props.onChange('Test User');
    fields[1].props.onChange('invalid-email'); // Invalid email

    const continueButton = getAllByText('registration.continueToPayment')[0];
    fireEvent.press(continueButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  it('should handle disabled state', () => {
    const { UNSAFE_getAllByType, getAllByText } = render(
      <RegistrationStepTwo {...defaultProps} isLoading={true} />
    );

    const buttons = getAllByText('registration.continueToPayment');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Buttons should be disabled when loading
    buttons.forEach(button => {
      expect(button.props.disabled).toBeTruthy();
    });
  });

  it('should format currency in TWD', async () => {
    const { getByText } = render(<RegistrationStepTwo {...defaultProps} />);
    
    await waitFor(() => {
      // Should show TWD currency format
      expect(getByText(/NT\$/)).toBeTruthy();
    });
  });
});