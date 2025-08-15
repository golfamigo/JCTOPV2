import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SharedButton } from './SharedButton';
import { ThemeProvider } from '@rneui/themed';

const theme = {
  colors: {
    primary: '#007BFF',
    white: '#FFFFFF',
    midGrey: '#6C757D',
    danger: '#DC3545',
    disabled: '#CED4DA',
    textSecondary: '#6C757D'
  },
  typography: {
    body: { fontSize: 16 }
  }
};

describe('SharedButton', () => {
  const renderWithTheme = (component: React.ReactElement) => {
    return render(
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    );
  };

  it('renders with default props', () => {
    const { getByText } = renderWithTheme(
      <SharedButton title="Test Button" />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <SharedButton title="Click Me" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Click Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders different variants correctly', () => {
    const variants = ['primary', 'secondary', 'outline', 'text', 'danger'] as const;
    
    variants.forEach(variant => {
      const { getByText } = renderWithTheme(
        <SharedButton title={`${variant} Button`} variant={variant} />
      );
      expect(getByText(`${variant} Button`)).toBeTruthy();
    });
  });

  it('renders different sizes correctly', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    
    sizes.forEach(size => {
      const { getByText } = renderWithTheme(
        <SharedButton title={`${size} Button`} size={size} />
      );
      expect(getByText(`${size} Button`)).toBeTruthy();
    });
  });

  it('disables button when disabled prop is true', () => {
    const onPress = jest.fn();
    const { getByText } = renderWithTheme(
      <SharedButton title="Disabled" disabled onPress={onPress} />
    );
    
    fireEvent.press(getByText('Disabled'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loading state', () => {
    const { getByTestId } = renderWithTheme(
      <SharedButton title="Loading" loading testID="loading-button" />
    );
    
    const button = getByTestId('loading-button');
    expect(button).toBeTruthy();
  });

  it('renders full width when prop is set', () => {
    const { getByText } = renderWithTheme(
      <SharedButton title="Full Width" fullWidth />
    );
    expect(getByText('Full Width')).toBeTruthy();
  });
});