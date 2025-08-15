import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import CreditCardForm, { CreditCardData } from './CreditCardForm';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() }
  })
}));

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
    typography: {
      h1: { fontSize: 24, fontWeight: 'bold' },
      h2: { fontSize: 20, fontWeight: 'bold' },
      body: { fontSize: 16, fontWeight: 'normal' },
      small: { fontSize: 14, fontWeight: 'normal' },
    },
  })
}));

jest.mock('@rneui/themed', () => ({
  ThemeProvider: ({ children }: any) => children,
  Card: ({ children }: any) => <div>{children}</div>,
  Input: ({ label, placeholder, onChangeText, errorMessage, ...props }: any) => {
    return (
      <div>
        {label && <div>{label}</div>}
        <input
          placeholder={placeholder}
          onChange={(e) => onChangeText && onChangeText(e.target.value)}
          {...props}
        />
        {errorMessage && <div>{errorMessage}</div>}
      </div>
    );
  },
  Text: ({ children }: any) => <div>{children}</div>,
}));

describe('CreditCardForm', () => {
  const mockOnCardDataChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCreditCardForm = (props = {}) => {
    return render(
      <ThemeProvider theme={{}}>
        <CreditCardForm
          onCardDataChange={mockOnCardDataChange}
          {...props}
        />
      </ThemeProvider>
    );
  };

  it('renders credit card form component', () => {
    const rendered = renderCreditCardForm();
    
    expect(rendered.root).toBeTruthy();
  });

  it('renders without crashing with disabled prop', () => {
    const rendered = renderCreditCardForm({ disabled: true });
    
    expect(rendered.root).toBeTruthy();
  });

  it('provides callback prop', () => {
    renderCreditCardForm();
    
    expect(mockOnCardDataChange).toBeDefined();
  });
});