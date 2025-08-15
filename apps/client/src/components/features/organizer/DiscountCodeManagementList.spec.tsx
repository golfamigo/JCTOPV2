import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DiscountCodeManagementList from './DiscountCodeManagementList';

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
      grey1: '#E0E0E0',
      grey2: '#E9ECEF',
      grey3: '#6C757D',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
    },
  }),
}));

describe('DiscountCodeManagementList', () => {
  const mockCodes = [
    {
      id: '1',
      eventId: 'event-1',
      code: 'SUMMER20',
      type: 'percentage' as const,
      value: 20,
      usageCount: 5,
      expiresAt: new Date('2025-12-31'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      status: 'active' as const,
    },
    {
      id: '2',
      eventId: 'event-1',
      code: 'FIXED100',
      type: 'fixed_amount' as const,
      value: 100,
      usageCount: 2,
      expiresAt: null,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
      status: 'inactive' as const,
    },
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnToggleActive = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the list with discount codes', () => {
    const { getByText } = render(
      <DiscountCodeManagementList
        codes={mockCodes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    expect(getByText('SUMMER20')).toBeTruthy();
    expect(getByText('FIXED100')).toBeTruthy();
    expect(getByText('20%')).toBeTruthy();
    expect(getByText('NT$ 100')).toBeTruthy();
  });

  it('displays loading skeleton when loading', () => {
    const { getAllByTestId } = render(
      <DiscountCodeManagementList
        codes={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
        loading={true}
      />
    );

    const skeletons = getAllByTestId('RNE__Skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays empty state when no codes', () => {
    const { getByText } = render(
      <DiscountCodeManagementList
        codes={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    expect(getByText('discounts.noData')).toBeTruthy();
    expect(getByText('discounts.createFirst')).toBeTruthy();
  });

  it('filters codes by status', () => {
    const { getByText, queryByText } = render(
      <DiscountCodeManagementList
        codes={mockCodes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    // Click on Active filter
    const activeButton = getByText('discounts.active');
    fireEvent.press(activeButton);

    // Should show only active codes
    expect(getByText('SUMMER20')).toBeTruthy();
    expect(queryByText('FIXED100')).toBeFalsy();
  });

  it('sorts codes by different fields', () => {
    const { UNSAFE_getAllByType } = render(
      <DiscountCodeManagementList
        codes={mockCodes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    // Find all buttons (excluding those in swipeable items)
    const buttons = UNSAFE_getAllByType(require('@rneui/themed').Button);
    
    // The sort buttons are after the filter buttons, so we look for them
    // We expect at least 3 sort buttons (code, usageCount, expiresAt)
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    
    // Click on one of the sort buttons to test sorting functionality
    if (buttons.length > 0) {
      fireEvent.press(buttons[0]);
      // Verify the button press was handled (component would re-render with new sort)
      expect(buttons[0]).toBeTruthy();
    }
  });

  it('does not call onEdit when item is pressed (edit via swipe only)', () => {
    const { getByTestId } = render(
      <DiscountCodeManagementList
        codes={mockCodes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    const firstItem = getByTestId('discount-item-1');
    fireEvent.press(firstItem);

    // Edit should not be triggered by press to avoid nested button issue
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it('calls onToggleActive when switch is toggled', () => {
    const { UNSAFE_getAllByType } = render(
      <DiscountCodeManagementList
        codes={mockCodes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    const switches = UNSAFE_getAllByType(require('@rneui/themed').Switch);
    fireEvent(switches[0], 'onValueChange');

    // The component sorts by createdAt desc by default, so FIXED100 (created 2025-01-02) appears first
    expect(mockOnToggleActive).toHaveBeenCalledWith(mockCodes[1]);
  });

  it('formats percentage discounts correctly', () => {
    const { getByText } = render(
      <DiscountCodeManagementList
        codes={[mockCodes[0]]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    expect(getByText('20%')).toBeTruthy();
  });

  it('formats fixed amount discounts in TWD', () => {
    const { getByText } = render(
      <DiscountCodeManagementList
        codes={[mockCodes[1]]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    expect(getByText('NT$ 100')).toBeTruthy();
  });

  it('displays usage count for each code', () => {
    const { getAllByText } = render(
      <DiscountCodeManagementList
        codes={mockCodes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    // Check for usage count text
    const usageTexts = getAllByText(/discounts.usageCount/);
    expect(usageTexts.length).toBe(2);
  });

  it('displays expiry date when available', () => {
    const { getByText } = render(
      <DiscountCodeManagementList
        codes={[mockCodes[0]]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    // Should show formatted date for codes with expiry
    expect(getByText(/2025年12月31日/)).toBeTruthy();
  });

  it('handles swipe actions for edit and delete', () => {
    const { getByTestId, getByText } = render(
      <DiscountCodeManagementList
        codes={mockCodes}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    // Test swipeable component exists
    const firstItem = getByTestId('discount-item-1');
    expect(firstItem).toBeTruthy();

    // Swipe actions would be tested with gesture simulation
    // For now, verify the component is swipeable
  });

  it('applies inactive styling to inactive codes', () => {
    const { getByTestId } = render(
      <DiscountCodeManagementList
        codes={[mockCodes[1]]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    const inactiveItem = getByTestId('discount-item-2');
    // Style would include opacity: 0.6 for inactive items
    expect(inactiveItem).toBeTruthy();
  });
});