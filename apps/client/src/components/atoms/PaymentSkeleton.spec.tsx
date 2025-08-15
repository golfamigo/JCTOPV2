import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import PaymentSkeleton from './PaymentSkeleton';

// Mock dependencies
jest.mock('../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      success: '#28A745',
      warning: '#FFC107',
      danger: '#DC3545',
      white: '#FFFFFF',
      lightGrey: '#F8F9FA',
      midGrey: '#6C757D',
      text: '#212529',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  })
}));

jest.mock('@rneui/themed', () => ({
  ThemeProvider: ({ children }: any) => children,
  Skeleton: ({ animation, width, height, style, ...props }: any) => {
    return (
      <mockSkeleton
        animation={animation}
        width={width}
        height={height}
        style={style}
        {...props}
      />
    );
  },
}));

describe('PaymentSkeleton', () => {
  const renderPaymentSkeleton = (variant?: string) => {
    return render(
      <ThemeProvider theme={{}}>
        <PaymentSkeleton variant={variant as any} />
      </ThemeProvider>
    );
  };

  it('renders form skeleton by default', () => {
    const rendered = renderPaymentSkeleton();
    expect(rendered.root).toBeTruthy();
  });

  it('renders form skeleton variant', () => {
    const rendered = renderPaymentSkeleton('form');
    expect(rendered.root).toBeTruthy();
  });

  it('renders summary skeleton variant', () => {
    const rendered = renderPaymentSkeleton('summary');
    expect(rendered.root).toBeTruthy();
  });

  it('renders methods skeleton variant', () => {
    const rendered = renderPaymentSkeleton('methods');
    expect(rendered.root).toBeTruthy();
  });

  it('renders status skeleton variant', () => {
    const rendered = renderPaymentSkeleton('status');
    expect(rendered.root).toBeTruthy();
  });
});