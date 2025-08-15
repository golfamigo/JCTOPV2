import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { TransactionList } from './TransactionList';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      success: '#28A745',
      error: '#DC3545',
      warning: '#FFC107',
      white: '#FFFFFF',
      dark: '#212529',
      grey2: '#E0E0E0',
      grey3: '#6C757D',
      grey5: '#424242',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }),
}));

jest.spyOn(Alert, 'alert');

describe('TransactionList', () => {
  const mockTransactions = [
    {
      id: '1',
      date: '2025-01-10T10:00:00Z',
      type: 'revenue' as const,
      description: 'Ticket Sale',
      amount: 500,
      paymentMethod: 'Credit Card',
      attendeeName: 'John Doe',
      ticketType: 'General',
      status: 'completed' as const,
    },
    {
      id: '2',
      date: '2025-01-10T11:00:00Z',
      type: 'expense' as const,
      description: 'Venue Rental',
      amount: 2000,
      status: 'completed' as const,
    },
    {
      id: '3',
      date: '2025-01-10T12:00:00Z',
      type: 'refund' as const,
      description: 'Ticket Refund',
      amount: 300,
      paymentMethod: 'Credit Card',
      attendeeName: 'Jane Smith',
      ticketType: 'VIP',
      status: 'pending' as const,
    },
  ];

  const mockOnTransactionPress = jest.fn();
  const mockOnLoadMore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders transactions correctly', () => {
    const { getByText } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    expect(getByText('Ticket Sale')).toBeTruthy();
    expect(getByText('Venue Rental')).toBeTruthy();
    expect(getByText('Ticket Refund')).toBeTruthy();
  });

  it('displays transaction amounts with correct formatting', () => {
    const { getByText } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    expect(getByText('+NT$ 500')).toBeTruthy();
    expect(getByText('-NT$ 2,000')).toBeTruthy();
    expect(getByText('+NT$ 300')).toBeTruthy();
  });

  it('shows correct icons for transaction types', () => {
    const { getAllByTestId } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    const avatars = getAllByTestId('RNE__Avatar__Container');
    expect(avatars.length).toBe(3);
  });

  it('displays status badges correctly', () => {
    const { getByText } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    expect(getByText('完成')).toBeTruthy();
    expect(getByText('待處理')).toBeTruthy();
  });

  it('formats dates in zh-TW locale', () => {
    const { getByText } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    // Should format dates as "MM月dd日 HH:mm"
    expect(getByText(/月.*日/)).toBeTruthy();
  });

  it('handles transaction press', () => {
    const { getByText } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    const transaction = getByText('Ticket Sale');
    fireEvent.press(transaction);

    expect(mockOnTransactionPress).toHaveBeenCalledWith(mockTransactions[0]);
  });

  it('shows payment method when available', () => {
    const { getByText } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    expect(getByText(/Credit Card/)).toBeTruthy();
  });

  it('shows attendee name and ticket type when available', () => {
    const { getByText } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    expect(getByText('John Doe - General')).toBeTruthy();
    expect(getByText('Jane Smith - VIP')).toBeTruthy();
  });

  it('renders empty state when no transactions', () => {
    const { getByText } = render(
      <TransactionList
        transactions={[]}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    expect(getByText('organizer.reports.noData')).toBeTruthy();
  });

  it('renders custom empty component when provided', () => {
    const CustomEmpty = () => <></>;
    const { queryByText } = render(
      <TransactionList
        transactions={[]}
        onTransactionPress={mockOnTransactionPress}
        ListEmptyComponent={<CustomEmpty />}
      />
    );

    expect(queryByText('organizer.reports.noData')).toBeFalsy();
  });

  it('renders header component when provided', () => {
    const HeaderComponent = () => <></>;
    const { UNSAFE_getByType } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
        ListHeaderComponent={<HeaderComponent />}
      />
    );

    expect(UNSAFE_getByType(HeaderComponent)).toBeTruthy();
  });

  it('calls onLoadMore when scrolled to end', () => {
    const { getByTestId } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
        onLoadMore={mockOnLoadMore}
      />
    );

    const flatList = getByTestId('flat-list');
    fireEvent.scroll(flatList, {
      nativeEvent: {
        contentOffset: { y: 1000 },
        contentSize: { height: 1000 },
        layoutMeasurement: { height: 600 },
      },
    });

    expect(mockOnLoadMore).toHaveBeenCalled();
  });

  it('shows loading state correctly', () => {
    const { getByTestId } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
        loading={true}
      />
    );

    const flatList = getByTestId('flat-list');
    expect(flatList.props.refreshing).toBe(true);
  });

  it('handles swipe action correctly', () => {
    const { getByText, getAllByTestId } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    // Swipeable items should be rendered
    const swipeables = getAllByTestId('RNE__ListItem__Swipeable');
    expect(swipeables.length).toBe(3);
  });

  it('displays correct colors for transaction types', () => {
    const { getAllByText } = render(
      <TransactionList
        transactions={mockTransactions}
        onTransactionPress={mockOnTransactionPress}
      />
    );

    // Revenue should be green
    const revenueAmount = getAllByText('+NT$ 500')[0];
    expect(revenueAmount.props.style).toContainEqual(
      expect.objectContaining({ color: '#28A745' })
    );

    // Expense should be red
    const expenseAmount = getAllByText('-NT$ 2,000')[0];
    expect(expenseAmount.props.style).toContainEqual(
      expect.objectContaining({ color: '#DC3545' })
    );

    // Refund should be warning color
    const refundAmount = getAllByText('+NT$ 300')[0];
    expect(refundAmount.props.style).toContainEqual(
      expect.objectContaining({ color: '#FFC107' })
    );
  });
});