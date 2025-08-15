import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReportFiltersComponent from './ReportFilters';

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
      white: '#FFFFFF',
      background: '#F8F9FA',
      dark: '#212529',
      grey3: '#6C757D',
      grey5: '#424242',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
    },
    borderRadius: {
      md: 8,
    },
  }),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => ({
  __esModule: true,
  default: jest.fn(({ value, onChange }) => null),
}));

describe('ReportFiltersComponent', () => {
  const mockOnApply = jest.fn();
  const mockOnClear = jest.fn();

  const defaultFilters = {
    dateRange: {
      start: new Date('2025-01-01'),
      end: new Date('2025-01-31'),
    },
    transactionTypes: [] as ('revenue' | 'expense' | 'refund')[],
    paymentMethods: [] as string[],
    eventIds: [] as string[],
  };

  const mockEvents = [
    { id: 'event-1', title: 'Event 1' },
    { id: 'event-2', title: 'Event 2' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders date range section', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    expect(getByText('organizer.reports.dateRange')).toBeTruthy();
    expect(getByText('2025年01月01日')).toBeTruthy();
    expect(getByText('2025年01月31日')).toBeTruthy();
  });

  it('shows date pickers when date buttons pressed', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const startDateButton = getByText('2025年01月01日');
    fireEvent.press(startDateButton);

    // DateTimePicker should be rendered
    const DateTimePicker = require('@react-native-community/datetimepicker').default;
    expect(DateTimePicker).toHaveBeenCalled();
  });

  it('renders event selection when events provided', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
        events={mockEvents}
      />
    );

    expect(getByText('organizer.reports.selectEvent')).toBeTruthy();
    expect(getByText('organizer.reports.allEvents')).toBeTruthy();
    expect(getByText('Event 1')).toBeTruthy();
    expect(getByText('Event 2')).toBeTruthy();
  });

  it('renders transaction type filters', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    expect(getByText('organizer.reports.transactionType')).toBeTruthy();
    expect(getByText('organizer.reports.revenue')).toBeTruthy();
    expect(getByText('organizer.reports.expenses')).toBeTruthy();
    expect(getByText('organizer.reports.refunds')).toBeTruthy();
  });

  it('renders payment method filters', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    expect(getByText('organizer.reports.paymentMethod')).toBeTruthy();
    expect(getByText('信用卡')).toBeTruthy();
    expect(getByText('銀行轉帳')).toBeTruthy();
    expect(getByText('現金')).toBeTruthy();
    expect(getByText('ECPay')).toBeTruthy();
  });

  it('toggles transaction type selection', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const revenueCheckbox = getByText('organizer.reports.revenue');
    fireEvent.press(revenueCheckbox);

    const applyButton = getByText('organizer.reports.applyFilters');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionTypes: ['revenue'],
      })
    );
  });

  it('toggles payment method selection', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const creditCardCheckbox = getByText('信用卡');
    fireEvent.press(creditCardCheckbox);

    const applyButton = getByText('organizer.reports.applyFilters');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethods: ['credit_card'],
      })
    );
  });

  it('toggles event selection', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
        events={mockEvents}
      />
    );

    const event1Checkbox = getByText('Event 1');
    fireEvent.press(event1Checkbox);

    const applyButton = getByText('organizer.reports.applyFilters');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        eventIds: ['event-1'],
      })
    );
  });

  it('clears all filters when clear button pressed', () => {
    const filtersWithSelections = {
      ...defaultFilters,
      transactionTypes: ['revenue', 'expense'] as ('revenue' | 'expense')[],
      paymentMethods: ['credit_card'],
      eventIds: ['event-1'],
    };

    const { getByText } = render(
      <ReportFiltersComponent
        filters={filtersWithSelections}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const clearButton = getByText('organizer.reports.clearFilters');
    fireEvent.press(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });

  it('applies filters when apply button pressed', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    const applyButton = getByText('organizer.reports.applyFilters');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(defaultFilters);
  });

  it('handles multiple filter selections', () => {
    const { getByText } = render(
      <ReportFiltersComponent
        filters={defaultFilters}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    // Select multiple transaction types
    fireEvent.press(getByText('organizer.reports.revenue'));
    fireEvent.press(getByText('organizer.reports.expenses'));

    // Select multiple payment methods
    fireEvent.press(getByText('信用卡'));
    fireEvent.press(getByText('銀行轉帳'));

    const applyButton = getByText('organizer.reports.applyFilters');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionTypes: ['revenue', 'expense'],
        paymentMethods: ['credit_card', 'bank_transfer'],
      })
    );
  });

  it('deselects filters when pressed again', () => {
    const filtersWithRevenue = {
      ...defaultFilters,
      transactionTypes: ['revenue'] as ('revenue')[],
    };

    const { getByText } = render(
      <ReportFiltersComponent
        filters={filtersWithRevenue}
        onApply={mockOnApply}
        onClear={mockOnClear}
      />
    );

    // Deselect revenue
    const revenueCheckbox = getByText('organizer.reports.revenue');
    fireEvent.press(revenueCheckbox);

    const applyButton = getByText('organizer.reports.applyFilters');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        transactionTypes: [],
      })
    );
  });

  it('handles all events selection', () => {
    const filtersWithEvents = {
      ...defaultFilters,
      eventIds: ['event-1'],
    };

    const { getByText } = render(
      <ReportFiltersComponent
        filters={filtersWithEvents}
        onApply={mockOnApply}
        onClear={mockOnClear}
        events={mockEvents}
      />
    );

    // Select "All Events"
    const allEventsCheckbox = getByText('organizer.reports.allEvents');
    fireEvent.press(allEventsCheckbox);

    const applyButton = getByText('organizer.reports.applyFilters');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        eventIds: [],
      })
    );
  });
});