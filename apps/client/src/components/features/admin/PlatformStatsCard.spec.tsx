import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import PlatformStatsCard from './PlatformStatsCard';
import { useAppTheme } from '@/theme';

jest.mock('@/theme', () => ({
  useAppTheme: jest.fn(),
}));

const mockTheme = {
  colors: {
    primary: '#007BFF',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    text: '#212529',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
};

describe('PlatformStatsCard', () => {
  beforeEach(() => {
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render card with title and value', () => {
    const { getByText } = render(
      <ThemeProvider>
        <PlatformStatsCard
          title="Total Users"
          value="1,250"
          icon="account-group"
        />
      </ThemeProvider>
    );

    expect(getByText('Total Users')).toBeTruthy();
    expect(getByText('1,250')).toBeTruthy();
  });

  it('should render icon with custom color', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <PlatformStatsCard
          title="Revenue"
          value="$10,000"
          icon="cash"
          iconColor="#28A745"
        />
      </ThemeProvider>
    );

    const icon = getByTestId('stats-card-icon');
    expect(icon.props.color).toBe('#28A745');
  });

  it('should display positive trend indicator', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <PlatformStatsCard
          title="Active Events"
          value="42"
          icon="calendar"
          trend={{ value: 15, isPositive: true }}
        />
      </ThemeProvider>
    );

    expect(getByText('+15%')).toBeTruthy();
    const trendIcon = getByTestId('trend-icon');
    expect(trendIcon.props.name).toBe('trending-up');
    expect(trendIcon.props.color).toBe(mockTheme.colors.success);
  });

  it('should display negative trend indicator', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <PlatformStatsCard
          title="Registrations"
          value="500"
          icon="ticket"
          trend={{ value: 5, isPositive: false }}
        />
      </ThemeProvider>
    );

    expect(getByText('-5%')).toBeTruthy();
    const trendIcon = getByTestId('trend-icon');
    expect(trendIcon.props.name).toBe('trending-down');
    expect(trendIcon.props.color).toBe(mockTheme.colors.danger);
  });

  it('should render subtitle when provided', () => {
    const { getByText } = render(
      <ThemeProvider>
        <PlatformStatsCard
          title="Total Revenue"
          value="NT$ 458,000"
          icon="cash-multiple"
          subtitle="Last 30 days"
        />
      </ThemeProvider>
    );

    expect(getByText('Last 30 days')).toBeTruthy();
  });

  it('should handle numeric values', () => {
    const { getByText } = render(
      <ThemeProvider>
        <PlatformStatsCard
          title="Count"
          value={999}
          icon="counter"
        />
      </ThemeProvider>
    );

    expect(getByText('999')).toBeTruthy();
  });

  it('should apply default icon color when not specified', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <PlatformStatsCard
          title="Default Color"
          value="100"
          icon="information"
        />
      </ThemeProvider>
    );

    const icon = getByTestId('stats-card-icon');
    expect(icon.props.color).toBe(mockTheme.colors.primary);
  });
});