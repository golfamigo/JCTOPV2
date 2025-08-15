import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportExportControls } from './ReportExportControls';
import { useReportStore } from '../../../stores/reportStore';
import reportService from '../../../services/reportService';

// Mock the store
jest.mock('../../../stores/reportStore');
const mockUseReportStore = useReportStore as jest.MockedFunction<typeof useReportStore>;

// Mock the service
jest.mock('../../../services/reportService');
const mockReportService = reportService as jest.Mocked<typeof reportService>;

// Mock toast
const mockToast = jest.fn();
// Removed ChakraUI mock

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

describe('ReportExportControls', () => {
  const mockStoreActions = {
    isExporting: false,
    setExporting: jest.fn(),
    setExportError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseReportStore.mockReturnValue(mockStoreActions as any);
    mockToast.mockClear();
  });

  const defaultProps = {
    eventId: 'event-1',
    eventTitle: 'Test Event',
  };

  it('should render export button', () => {
    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByRole('button', { name: /export report/i })).toBeInTheDocument();
  });

  it('should show export options when clicked', async () => {
    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /export report/i }));

    await waitFor(() => {
      expect(screen.getByText('PDF Report')).toBeInTheDocument();
      expect(screen.getByText('CSV Data')).toBeInTheDocument();
      expect(screen.getByText('Excel Spreadsheet')).toBeInTheDocument();
    });
  });

  it('should export PDF when PDF option is selected', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockReportService.exportEventReport.mockResolvedValue(mockBlob);
    mockReportService.generateFilename.mockReturnValue('Test_Event_Report_2024-01-01.pdf');

    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    // Open menu and click PDF option
    fireEvent.click(screen.getByRole('button', { name: /export report/i }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('PDF Report'));
    });

    // Verify service calls
    await waitFor(() => {
      expect(mockReportService.exportEventReport).toHaveBeenCalledWith('event-1', 'pdf');
      expect(mockReportService.generateFilename).toHaveBeenCalledWith('Test Event', 'pdf');
      expect(mockStoreActions.setExporting).toHaveBeenCalledWith(true);
    });

    // Wait for completion
    await waitFor(() => {
      expect(mockStoreActions.setExporting).toHaveBeenCalledWith(false);
    });

    // Verify success toast
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Export Complete',
        status: 'success',
      })
    );
  });

  it('should export CSV when CSV option is selected', async () => {
    const mockBlob = new Blob(['CSV content'], { type: 'text/csv' });
    mockReportService.exportEventReport.mockResolvedValue(mockBlob);
    mockReportService.generateFilename.mockReturnValue('Test_Event_Report_2024-01-01.csv');

    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    // Open menu and click CSV option
    fireEvent.click(screen.getByRole('button', { name: /export report/i }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('CSV Data'));
    });

    // Verify service calls
    await waitFor(() => {
      expect(mockReportService.exportEventReport).toHaveBeenCalledWith('event-1', 'csv');
      expect(mockReportService.generateFilename).toHaveBeenCalledWith('Test Event', 'csv');
    });
  });

  it('should export Excel when Excel option is selected', async () => {
    const mockBlob = new Blob(['Excel content'], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    mockReportService.exportEventReport.mockResolvedValue(mockBlob);
    mockReportService.generateFilename.mockReturnValue('Test_Event_Report_2024-01-01.xlsx');

    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    // Open menu and click Excel option
    fireEvent.click(screen.getByRole('button', { name: /export report/i }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Excel Spreadsheet'));
    });

    // Verify service calls
    await waitFor(() => {
      expect(mockReportService.exportEventReport).toHaveBeenCalledWith('event-1', 'excel');
      expect(mockReportService.generateFilename).toHaveBeenCalledWith('Test Event', 'excel');
    });
  });

  it('should handle export errors', async () => {
    const mockError = new Error('Export failed');
    mockReportService.exportEventReport.mockRejectedValue(mockError);

    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    // Open menu and click PDF option
    fireEvent.click(screen.getByRole('button', { name: /export report/i }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('PDF Report'));
    });

    // Wait for error handling
    await waitFor(() => {
      expect(mockStoreActions.setExportError).toHaveBeenCalledWith('Failed to export PDF report');
      expect(mockStoreActions.setExporting).toHaveBeenCalledWith(false);
    });

    // Verify error toast
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Export Failed',
        status: 'error',
      })
    );
  });

  it('should show loading state while exporting', () => {
    mockUseReportStore.mockReturnValue({
      ...mockStoreActions,
      isExporting: true,
    } as any);

    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /exporting.../i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should disable menu items while exporting', async () => {
    mockUseReportStore.mockReturnValue({
      ...mockStoreActions,
      isExporting: true,
    } as any);

    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    // Try to open menu (should not be possible when disabled)
    const button = screen.getByRole('button', { name: /exporting.../i });
    expect(button).toBeDisabled();
  });

  it('should show initial loading toast when starting export', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockReportService.exportEventReport.mockResolvedValue(mockBlob);

    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    // Open menu and click PDF option
    fireEvent.click(screen.getByRole('button', { name: /export report/i }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('PDF Report'));
    });

    // Verify initial toast
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Generating Report',
        description: 'Preparing PDF export...',
        status: 'info',
      })
    );
  });

  it('should trigger file download on successful export', async () => {
    const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
    mockReportService.exportEventReport.mockResolvedValue(mockBlob);
    mockReportService.generateFilename.mockReturnValue('Test_Event_Report_2024-01-01.pdf');
    mockReportService.downloadFile.mockImplementation(() => {});

    render(
      <TestWrapper>
        <ReportExportControls {...defaultProps} />
      </TestWrapper>
    );

    // Open menu and click PDF option
    fireEvent.click(screen.getByRole('button', { name: /export report/i }));
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('PDF Report'));
    });

    // Verify download was triggered
    await waitFor(() => {
      expect(mockReportService.downloadFile).toHaveBeenCalledWith(
        mockBlob,
        'Test_Event_Report_2024-01-01.pdf'
      );
    });
  });
});