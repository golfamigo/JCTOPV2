import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@/theme';
import { PDFPreviewModal } from './PDFPreviewModal';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: jest.fn(() => ({ width: 375, height: 812 })),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PDFPreviewModal', () => {
  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
    invoiceId: 'inv-123',
    invoiceNumber: 'INV-2024-001',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible', () => {
    const { getByText } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} />
    );
    
    expect(getByText('invoice.previewTitle')).toBeTruthy();
    expect(getByText('INV-2024-001')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} onClose={onClose} />
    );
    
    fireEvent.press(getByText('common.close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles download action', async () => {
    const onDownload = jest.fn().mockResolvedValue(undefined);
    const { getByText } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} onDownload={onDownload} />
    );
    
    fireEvent.press(getByText('common.download'));
    
    await waitFor(() => {
      expect(onDownload).toHaveBeenCalledTimes(1);
    });
  });

  it('shows success alert after successful download without custom handler', async () => {
    const { getByText } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} />
    );
    
    fireEvent.press(getByText('common.download'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'common.success',
        'invoice.pdfDownloaded'
      );
    });
  });

  it('handles share action', async () => {
    const onShare = jest.fn().mockResolvedValue(undefined);
    const { getByText } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} onShare={onShare} />
    );
    
    fireEvent.press(getByText('common.share'));
    
    await waitFor(() => {
      expect(onShare).toHaveBeenCalledTimes(1);
    });
  });

  it('shows error alert on download failure', async () => {
    const onDownload = jest.fn().mockRejectedValue(new Error('Network error'));
    const { getByText } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} onDownload={onDownload} />
    );
    
    fireEvent.press(getByText('common.download'));
    
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'common.error',
        'Network error'
      );
    });
  });

  it('disables buttons while loading', async () => {
    const onDownload = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const { getByText } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} onDownload={onDownload} />
    );
    
    const downloadButton = getByText('common.download');
    fireEvent.press(downloadButton);
    
    // Button should be disabled during loading
    expect(downloadButton.parent?.props.disabled).toBe(true);
    
    await waitFor(() => {
      expect(onDownload).toHaveBeenCalled();
    });
  });

  it('renders tablet layout for wider screens', () => {
    // Mock tablet dimensions
    const Dimensions = require('react-native/Libraries/Utilities/Dimensions');
    Dimensions.get.mockReturnValue({ width: 768, height: 1024 });
    
    const { root } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} />
    );
    
    expect(root).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = renderWithTheme(
      <PDFPreviewModal {...defaultProps} isVisible={false} />
    );
    
    expect(queryByText('invoice.previewTitle')).toBeNull();
  });
});