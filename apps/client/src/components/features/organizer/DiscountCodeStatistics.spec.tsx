import React from 'react';
import { render } from '@testing-library/react-native';
import DiscountCodeStatistics from './DiscountCodeStatistics';

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
      warning: '#FFC107',
      error: '#DC3545',
      white: '#FFFFFF',
      dark: '#212529',
      grey3: '#6C757D',
    },
    spacing: {
      sm: 8,
      md: 16,
    },
    borderRadius: {
      lg: 12,
    },
  }),
}));

describe('DiscountCodeStatistics', () => {
  const mockCodes = [
    {
      id: '1',
      eventId: 'event-1',
      code: 'SUMMER20',
      type: 'percentage' as const,
      value: 20,
      usageCount: 10,
      expiresAt: new Date('2025-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active' as const,
    },
    {
      id: '2',
      eventId: 'event-1',
      code: 'FIXED100',
      type: 'fixed_amount' as const,
      value: 100,
      usageCount: 5,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active' as const,
    },
    {
      id: '3',
      eventId: 'event-1',
      code: 'INACTIVE50',
      type: 'fixed_amount' as const,
      value: 50,
      usageCount: 0,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'inactive' as const,
    },
  ];

  it('renders all statistics cards', () => {
    const { getByText } = render(
      <DiscountCodeStatistics codes={mockCodes} />
    );

    expect(getByText('discounts.statistics.totalCodes')).toBeTruthy();
    expect(getByText('discounts.statistics.activeCodes')).toBeTruthy();
    expect(getByText('discounts.statistics.totalUsage')).toBeTruthy();
    expect(getByText('discounts.statistics.revenueImpact')).toBeTruthy();
  });

  it('calculates total codes correctly', () => {
    const { getByText } = render(
      <DiscountCodeStatistics codes={mockCodes} />
    );

    // Total codes should be 3
    expect(getByText('3')).toBeTruthy();
  });

  it('calculates active codes correctly', () => {
    const { getByText } = render(
      <DiscountCodeStatistics codes={mockCodes} />
    );

    // Active codes should be 2
    expect(getByText('2')).toBeTruthy();
  });

  it('calculates total usage correctly', () => {
    const { getByText } = render(
      <DiscountCodeStatistics codes={mockCodes} />
    );

    // Total usage should be 10 + 5 + 0 = 15
    expect(getByText('15')).toBeTruthy();
  });

  it('calculates revenue impact correctly', () => {
    const { getByText } = render(
      <DiscountCodeStatistics codes={mockCodes} />
    );

    // Revenue impact calculation:
    // SUMMER20: 20% * 10 uses * 1000 (assumed avg) = 2000
    // FIXED100: 100 * 5 uses = 500
    // INACTIVE50: 50 * 0 uses = 0
    // Total: 2500
    expect(getByText('NT$ 2,500')).toBeTruthy();
  });

  it('handles empty codes array', () => {
    const { getByText } = render(
      <DiscountCodeStatistics codes={[]} />
    );

    // All statistics should be 0
    expect(getByText('0')).toBeTruthy();
    expect(getByText('NT$ 0')).toBeTruthy();
  });

  it('formats currency in TWD correctly', () => {
    const singleCode = [{
      id: '1',
      eventId: 'event-1',
      code: 'BIG',
      type: 'fixed_amount' as const,
      value: 10000,
      usageCount: 100,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active' as const,
    }];

    const { getByText } = render(
      <DiscountCodeStatistics codes={singleCode} />
    );

    // Should format large numbers with commas
    expect(getByText('NT$ 1,000,000')).toBeTruthy();
  });

  it('displays correct icons for each statistic', () => {
    const { UNSAFE_getAllByType } = render(
      <DiscountCodeStatistics codes={mockCodes} />
    );

    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').MaterialCommunityIcons);
    
    // Should have 4 icons for 4 statistics
    expect(icons.length).toBe(4);
    
    // Check icon names
    const iconNames = icons.map(icon => icon.props.name);
    expect(iconNames).toContain('tag-multiple');
    expect(iconNames).toContain('tag-check');
    expect(iconNames).toContain('account-group');
    expect(iconNames).toContain('cash');
  });

  it('applies correct colors to statistics', () => {
    const { UNSAFE_getAllByType } = render(
      <DiscountCodeStatistics codes={mockCodes} />
    );

    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').MaterialCommunityIcons);
    
    // Check icon colors
    expect(icons[0].props.color).toBe('#007BFF'); // primary
    expect(icons[1].props.color).toBe('#28A745'); // success
    expect(icons[2].props.color).toBe('#FFC107'); // warning
    expect(icons[3].props.color).toBe('#DC3545'); // error
  });

  it('renders as horizontal scroll view', () => {
    const { UNSAFE_getByType } = render(
      <DiscountCodeStatistics codes={mockCodes} />
    );

    const scrollView = UNSAFE_getByType(require('react-native').ScrollView);
    
    // Should be horizontal
    expect(scrollView.props.horizontal).toBe(true);
    expect(scrollView.props.showsHorizontalScrollIndicator).toBe(false);
  });
});