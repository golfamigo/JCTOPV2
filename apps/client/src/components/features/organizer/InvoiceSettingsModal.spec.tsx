import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { useReportStore } from '../../../stores/reportStore';
import { InvoiceSettingsModal } from './InvoiceSettingsModal';
import { InvoiceSettings } from '@jctop-event/shared-types';

// Mock environment variables
process.env.EXPO_PUBLIC_API_URL = 'https://jctop.zeabur.app/api/v1';

// Mock dependencies
jest.mock('../../../services/invoiceService', () => ({
  getInvoiceSettings: jest.fn(),
  saveInvoiceSettings: jest.fn(),
  deleteInvoiceSettings: jest.fn(),
}));
jest.mock('react-i18next');
jest.mock('../../../theme');
jest.mock('../../../stores/reportStore');
jest.mock('../../../services/invoiceService');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseAppTheme = useAppTheme as jest.MockedFunction<typeof useAppTheme>;
const mockUseReportStore = useReportStore as jest.MockedFunction<typeof useReportStore>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

// Import mocked service
const mockInvoiceService = require('../../../services/invoiceService').default;

describe('InvoiceSettingsModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    eventId: 'event-123',
    eventTitle: 'Test Event',
  };

  const mockTheme = {
    colors: {
      white: '#FFFFFF',
      error: '#DC3545',
      grey2: '#6C757D',
      greyOutline: '#E9ECEF',
      grey0: '#F8F9FA',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
    },
  };

  const mockStore = {
    invoiceSettings: null,
    invoiceSettingsLoading: false,
    invoiceSettingsError: null,
    setInvoiceSettings: jest.fn(),
    setInvoiceSettingsLoading: jest.fn(),
    setInvoiceSettingsError: jest.fn(),
  };

  const mockTranslation = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue(mockTranslation);
    mockUseAppTheme.mockReturnValue(mockTheme);
    mockUseReportStore.mockReturnValue(mockStore);
  });

  it('renders modal when open', () => {
    render(<InvoiceSettingsModal {...mockProps} />);
    
    expect(screen.getByText('invoice.invoiceSettings - Test Event')).toBeTruthy();
    expect(screen.getByText('invoice.companyName')).toBeTruthy();
    expect(screen.getByText('invoice.companyAddress')).toBeTruthy();
    expect(screen.getByText('invoice.taxNumber')).toBeTruthy();
    expect(screen.getByText('invoice.invoicePrefix')).toBeTruthy();
    expect(screen.getByText('invoice.invoiceFooter')).toBeTruthy();
  });

  it('does not render modal when closed', () => {
    render(<InvoiceSettingsModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('invoice.invoiceSettings - Test Event')).toBeNull();
  });

  it('displays error message when there is an error', () => {
    mockUseReportStore.mockReturnValue({
      ...mockStore,
      invoiceSettingsError: 'Test error message',
    });

    render(<InvoiceSettingsModal {...mockProps} />);
    
    expect(screen.getByText('Test error message')).toBeTruthy();
  });

  it('loads existing invoice settings on mount', async () => {
    const mockSettings: InvoiceSettings = {
      id: '1',
      eventId: 'event-123',
      companyName: 'Test Company',
      companyAddress: 'Test Address',
      taxNumber: '12345678',
      invoicePrefix: 'INV-',
      invoiceFooter: 'Test Footer',
      customFields: {},
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    mockInvoiceService.getInvoiceSettings.mockResolvedValue(mockSettings);

    render(<InvoiceSettingsModal {...mockProps} />);
    
    await waitFor(() => {
      expect(mockInvoiceService.getInvoiceSettings).toHaveBeenCalledWith('event-123');
    });
  });

  it('updates form data when input changes', () => {
    render(<InvoiceSettingsModal {...mockProps} />);
    
    const companyNameInput = screen.getByPlaceholderText('invoice.enterCompanyName');
    fireEvent.changeText(companyNameInput, 'New Company Name');
    
    // The input should reflect the new value
    expect(companyNameInput.props.value).toBe('New Company Name');
  });

  it('saves invoice settings successfully', async () => {
    const mockSavedSettings: InvoiceSettings = {
      id: '1',
      eventId: 'event-123',
      companyName: 'Test Company',
      companyAddress: 'Test Address',
      taxNumber: '12345678',
      invoicePrefix: 'INV-',
      invoiceFooter: 'Test Footer',
      customFields: {},
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    };

    mockInvoiceService.saveInvoiceSettings.mockResolvedValue(mockSavedSettings);

    render(<InvoiceSettingsModal {...mockProps} />);
    
    // Fill in company name (required field)
    const companyNameInput = screen.getByPlaceholderText('invoice.enterCompanyName');
    fireEvent.changeText(companyNameInput, 'Test Company');
    
    // Click save button
    const saveButton = screen.getByText('common.create');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockInvoiceService.saveInvoiceSettings).toHaveBeenCalledWith(
        'event-123',
        expect.objectContaining({
          companyName: 'Test Company',
        }),
        false
      );
    });

    expect(mockAlert).toHaveBeenCalledWith(
      'invoice.settingsUpdated',
      'invoice.settingsUpdateSuccess'
    );

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('shows error toast when save fails', async () => {
    mockInvoiceService.saveInvoiceSettings.mockRejectedValue(new Error('Save failed'));

    render(<InvoiceSettingsModal {...mockProps} />);
    
    // Fill in company name (required field)
    const companyNameInput = screen.getByPlaceholderText('invoice.enterCompanyName');
    fireEvent.changeText(companyNameInput, 'Test Company');
    
    // Click save button
    const saveButton = screen.getByText('common.create');
    fireEvent.press(saveButton);
    
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        'common.error',
        'Save failed'
      );
    });
  });

  it('shows delete confirmation dialog', async () => {
    // Mock existing settings
    mockUseReportStore.mockReturnValue({
      ...mockStore,
      invoiceSettings: {
        id: '1',
        eventId: 'event-123',
        companyName: 'Test Company',
        companyAddress: 'Test Address',
        taxNumber: '12345678',
        invoicePrefix: 'INV-',
        invoiceFooter: 'Test Footer',
        customFields: {},
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      } as InvoiceSettings,
    });

    render(<InvoiceSettingsModal {...mockProps} />);
    
    const deleteButton = screen.getByText('common.delete');
    fireEvent.press(deleteButton);
    
    expect(mockAlert).toHaveBeenCalledWith(
      'invoice.confirmDelete',
      'invoice.confirmDeleteMessage',
      expect.arrayContaining([
        expect.objectContaining({ text: 'common.cancel', style: 'cancel' }),
        expect.objectContaining({ text: 'common.delete', style: 'destructive' }),
      ])
    );
  });

  it('toggles preview mode', () => {
    render(<InvoiceSettingsModal {...mockProps} />);
    
    // Fill in company name (required field)
    const companyNameInput = screen.getByPlaceholderText('invoice.enterCompanyName');
    fireEvent.changeText(companyNameInput, 'Test Company');
    
    // Click preview button
    const previewButton = screen.getByText('invoice.previewTemplate');
    fireEvent.press(previewButton);
    
    // Should show preview mode
    expect(screen.getByText('invoice.invoicePreview')).toBeTruthy();
    expect(screen.getByText('common.backToEdit')).toBeTruthy();
    
    // Click back to edit
    const backButton = screen.getByText('common.backToEdit');
    fireEvent.press(backButton);
    
    // Should be back to edit mode
    expect(screen.getByText('invoice.previewTemplate')).toBeTruthy();
  });

  it('disables save button when company name is empty', () => {
    render(<InvoiceSettingsModal {...mockProps} />);
    
    const saveButton = screen.getByText('common.create');
    expect(saveButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('enables save button when company name is provided', () => {
    render(<InvoiceSettingsModal {...mockProps} />);
    
    const companyNameInput = screen.getByPlaceholderText('invoice.enterCompanyName');
    fireEvent.changeText(companyNameInput, 'Test Company');
    
    const saveButton = screen.getByText('common.create');
    expect(saveButton.props.accessibilityState?.disabled).toBe(false);
  });

  it('shows update button text when editing existing settings', () => {
    mockUseReportStore.mockReturnValue({
      ...mockStore,
      invoiceSettings: {
        id: '1',
        eventId: 'event-123',
        companyName: 'Test Company',
        companyAddress: 'Test Address',
        taxNumber: '12345678',
        invoicePrefix: 'INV-',
        invoiceFooter: 'Test Footer',
        customFields: {},
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      } as InvoiceSettings,
    });

    render(<InvoiceSettingsModal {...mockProps} />);
    
    expect(screen.getByText('common.update')).toBeTruthy();
  });

  it('closes modal when close button is pressed', () => {
    render(<InvoiceSettingsModal {...mockProps} />);
    
    const cancelButton = screen.getByText('common.cancel');
    fireEvent.press(cancelButton);
    
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});