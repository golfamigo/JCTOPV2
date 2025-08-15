import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import SystemHealthIndicator from './SystemHealthIndicator';
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
    textSecondary: '#6C757D',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
};

describe('SystemHealthIndicator', () => {
  beforeEach(() => {
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render healthy status with green badge', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="API Status"
          status="healthy"
          details="Response time: 120ms"
        />
      </ThemeProvider>
    );

    expect(getByText('API Status')).toBeTruthy();
    expect(getByText('Response time: 120ms')).toBeTruthy();
    
    const badge = getByTestId('health-badge');
    expect(badge.props.status).toBe('success');
  });

  it('should render warning status with yellow badge', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="CPU Usage"
          status="warning"
          details="75% utilization"
        />
      </ThemeProvider>
    );

    const badge = getByTestId('health-badge');
    expect(badge.props.status).toBe('warning');
  });

  it('should render critical status with red badge', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="Database"
          status="critical"
          details="Connection pool exhausted"
        />
      </ThemeProvider>
    );

    const badge = getByTestId('health-badge');
    expect(badge.props.status).toBe('error');
  });

  it('should display progress bar when value provided', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="Memory Usage"
          status="warning"
          details="6.5GB / 8GB"
          progressValue={0.81}
        />
      </ThemeProvider>
    );

    const progressBar = getByTestId('health-progress');
    expect(progressBar.props.value).toBe(0.81);
    expect(progressBar.props.color).toBe(mockTheme.colors.warning);
  });

  it('should use correct color for progress based on status', () => {
    const { getByTestId, rerender } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="Disk Space"
          status="healthy"
          progressValue={0.3}
        />
      </ThemeProvider>
    );

    let progressBar = getByTestId('health-progress');
    expect(progressBar.props.color).toBe(mockTheme.colors.success);

    rerender(
      <ThemeProvider>
        <SystemHealthIndicator
          title="Disk Space"
          status="critical"
          progressValue={0.95}
        />
      </ThemeProvider>
    );

    progressBar = getByTestId('health-progress');
    expect(progressBar.props.color).toBe(mockTheme.colors.danger);
  });

  it('should render icon when provided', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="Network"
          status="healthy"
          icon="wifi"
        />
      </ThemeProvider>
    );

    const icon = getByTestId('health-icon');
    expect(icon.props.name).toBe('wifi');
  });

  it('should display subtitle when provided', () => {
    const { getByText } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="API Gateway"
          status="healthy"
          subtitle="us-west-2"
          details="All endpoints operational"
        />
      </ThemeProvider>
    );

    expect(getByText('us-west-2')).toBeTruthy();
  });

  it('should handle missing details gracefully', () => {
    const { queryByText } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="Service"
          status="healthy"
        />
      </ThemeProvider>
    );

    expect(queryByText('Service')).toBeTruthy();
    // Should not crash without details
  });

  it('should display metrics when provided', () => {
    const { getByText } = render(
      <ThemeProvider>
        <SystemHealthIndicator
          title="Performance"
          status="healthy"
          metrics={[
            { label: 'Latency', value: '45ms' },
            { label: 'Throughput', value: '1.2k/s' },
          ]}
        />
      </ThemeProvider>
    );

    expect(getByText('Latency')).toBeTruthy();
    expect(getByText('45ms')).toBeTruthy();
    expect(getByText('Throughput')).toBeTruthy();
    expect(getByText('1.2k/s')).toBeTruthy();
  });
});