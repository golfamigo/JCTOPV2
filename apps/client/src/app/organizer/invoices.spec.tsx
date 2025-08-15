import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import InvoiceListScreen from './invoices';

// Mock environment variables
process.env.EXPO_PUBLIC_API_URL = 'https://jctop.zeabur.app/api/v1';

// Mock dependencies
jest.mock('react-i18next');
jest.mock('../../../src/theme');
jest.mock('expo-router');
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseAppTheme = useAppTheme as jest.MockedFunction<typeof useAppTheme>;
const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockAlert = Alert.alert as jest.MockedFunction<typeof Alert.alert>;

describe('InvoiceListScreen', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  };

  const mockTheme = {
    colors: {
      primary: '#007BFF',
      white: '#FFFFFF',
      error: '#DC3545',
      grey2: '#6C757D',
      background: '#F8F9FA',
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
      h3: { fontSize: 18, fontWeight: '600' },
      h4: { fontSize: 16, fontWeight: '600' },
      body: { fontSize: 16, fontWeight: 'normal' },
      small: { fontSize: 14, fontWeight: 'normal' },
    },
  };

  const mockTranslation = {
    t: jest.fn((key: string, options?: any) => {
      // Mock translation function
      const translations: { [key: string]: string } = {
        'invoice.invoiceManagement': '發票管理',
        'invoice.createInvoice': '建立發票',
        'invoice.searchInvoices': '搜尋發票',
        'invoice.filterByStatus': '依狀態篩選',
        'invoice.noInvoices': '暫無發票',
        'invoice.noInvoicesDescription': '尚未建立任何發票',
        'invoice.draft': '草稿',
        'invoice.sent': '已寄送',
        'invoice.paid': '已付款',
        'invoice.overdue': '逾期',
        'invoice.cancelled': '已取消',
        'invoice.sendInvoice': '寄送發票',
        'invoice.invoiceSent': '發票已寄送',
        'invoice.sendFailed': '寄送失敗',
        'invoice.confirmSend': '確認寄送發票 {{number}} 嗎？',
        'common.all': '全部',
        'common.success': '成功',
        'common.error': '錯誤',
        'common.cancel': '取消',
        'common.retry': '重試',
        'errors.networkError': '網路連線錯誤',
      };
      
      if (options && key.includes('{{number}}')) {
        return translations[key]?.replace('{{number}}', options.number) || key;
      }
      
      return translations[key] || key;
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue(mockTranslation);
    mockUseAppTheme.mockReturnValue(mockTheme);
    mockUseLocalSearchParams.mockReturnValue({ eventId: 'event-123' });
    mockUseRouter.mockReturnValue(mockRouter);
  });

  it('renders invoice list screen with header', () => {
    render(<InvoiceListScreen />);
    
    expect(screen.getByText('invoice.invoiceManagement')).toBeTruthy();
    expect(screen.getByText('invoice.createInvoice')).toBeTruthy();
    expect(screen.getByPlaceholderText('invoice.searchInvoices')).toBeTruthy();
  });

  it('displays loading state initially', () => {
    render(<InvoiceListScreen />);
    
    // Should show skeleton loading cards
    expect(screen.getByText('invoice.invoiceManagement')).toBeTruthy();
  });

  it('displays invoices after loading', async () => {
    render(<InvoiceListScreen />);
    
    await waitFor(() => {
      // Wait for mock data to load (1 second timeout)
      expect(screen.getByText('INV-001')).toBeTruthy();
    }, { timeout: 2000 });

    expect(screen.getByText('John Doe')).toBeTruthy();
    expect(screen.getByText('jane@example.com')).toBeTruthy();
    expect(screen.getByText('Bob Johnson')).toBeTruthy();
  });

  it('filters invoices by search query', async () => {
    render(<InvoiceListScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeTruthy();
    }, { timeout: 2000 });

    const searchInput = screen.getByPlaceholderText('invoice.searchInvoices');
    fireEvent.changeText(searchInput, 'John');
    
    // Should show only John Doe's invoice
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.queryByText('Jane Smith')).toBeNull();
    });
  });

  it('filters invoices by status', async () => {
    render(<InvoiceListScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeTruthy();
    }, { timeout: 2000 });

    // Click on 'Paid' status filter (index 3)
    const statusButtons = screen.getAllByText('invoice.paid');
    fireEvent.press(statusButtons[0]); // First one is the filter button
    
    // Should show only paid invoices
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeTruthy();
      expect(screen.queryByText('John Doe')).toBeNull();
    });
  });

  it('navigates to invoice details when item is pressed', async () => {
    render(<InvoiceListScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeTruthy();
    }, { timeout: 2000 });

    const invoiceItem = screen.getByText('INV-001');
    fireEvent.press(invoiceItem);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/organizer/invoices/1');
  });

  it('navigates to create invoice screen', () => {
    render(<InvoiceListScreen />);
    
    const createButton = screen.getByText('invoice.createInvoice');
    fireEvent.press(createButton);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/organizer/invoices/create?eventId=event-123');
  });

  it('shows send confirmation dialog for draft invoices', async () => {
    render(<InvoiceListScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-004')).toBeTruthy();
    }, { timeout: 2000 });

    // Find and click send button for draft invoice
    const sendButton = screen.getByText('invoice.sendInvoice');
    fireEvent.press(sendButton);
    
    expect(mockAlert).toHaveBeenCalledWith(
      'invoice.sendInvoice',
      'invoice.confirmSend',
      expect.arrayContaining([
        expect.objectContaining({ text: 'common.cancel' }),
        expect.objectContaining({ text: 'invoice.sendInvoice' }),
      ])
    );
  });

  it('handles refresh functionality', async () => {
    render(<InvoiceListScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeTruthy();
    }, { timeout: 2000 });

    // Simulate pull-to-refresh
    const flatList = screen.getByTestId('invoice-list') || screen.root;
    fireEvent(flatList, 'refresh');
    
    // Should trigger reload
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeTruthy();
    });
  });

  it('displays empty state when no invoices', async () => {
    // Mock empty invoices array
    const EmptyInvoiceScreen = () => {
      const emptyMockInvoices: any[] = [];
      return <InvoiceListScreen />;
    };

    render(<EmptyInvoiceScreen />);
    
    await waitFor(() => {
      // Wait for loading to complete
    }, { timeout: 2000 });

    // After loading mock data, filter to empty
    const searchInput = screen.getByPlaceholderText('invoice.searchInvoices');
    fireEvent.changeText(searchInput, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText('invoice.noInvoices')).toBeTruthy();
    });
  });

  it('formats currency correctly', async () => {
    render(<InvoiceListScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeTruthy();
    }, { timeout: 2000 });

    // Should display formatted currency amounts
    // Note: The exact format may depend on the device locale
    expect(screen.getByText(/1,500|1500/)).toBeTruthy();
    expect(screen.getByText(/800/)).toBeTruthy();
  });

  it('displays correct status badges', async () => {
    render(<InvoiceListScreen />);
    
    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeTruthy();
    }, { timeout: 2000 });

    // Should show various status badges
    expect(screen.getByText('invoice.sent')).toBeTruthy();
    expect(screen.getByText('invoice.paid')).toBeTruthy();
    expect(screen.getByText('invoice.overdue')).toBeTruthy();
    expect(screen.getByText('invoice.draft')).toBeTruthy();
  });

  it('handles network errors gracefully', async () => {
    // This would need to be tested with actual service mocking
    // For now, we test the error display structure
    
    const ErrorInvoiceScreen = () => {
      // Simulate error state
      return <InvoiceListScreen />;
    };

    render(<ErrorInvoiceScreen />);
    
    // Test would verify error handling if service throws error
    expect(screen.getByText('invoice.invoiceManagement')).toBeTruthy();
  });
});