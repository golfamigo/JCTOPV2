import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@/theme';
import { ExportProgressBar } from './ExportProgressBar';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ExportProgressBar', () => {
  it('renders with progress value', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressBar progress={50} />
    );
    
    expect(getByText('50%')).toBeTruthy();
  });

  it('renders without percentage when showPercentage is false', () => {
    const { queryByText } = renderWithTheme(
      <ExportProgressBar progress={50} showPercentage={false} />
    );
    
    expect(queryByText('50%')).toBeNull();
  });

  it('renders indeterminate progress', () => {
    const { queryByText, root } = renderWithTheme(
      <ExportProgressBar progress={0} indeterminate={true} />
    );
    
    // Should not show percentage when indeterminate
    expect(queryByText('0%')).toBeNull();
    expect(root).toBeTruthy();
  });

  it('rounds progress percentage correctly', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressBar progress={75.7} />
    );
    
    expect(getByText('76%')).toBeTruthy();
  });

  it('applies custom colors', () => {
    const { root } = renderWithTheme(
      <ExportProgressBar 
        progress={60} 
        color="#ff0000"
        trackColor="#00ff00"
      />
    );
    
    expect(root).toBeTruthy();
  });

  it('applies custom height', () => {
    const { root } = renderWithTheme(
      <ExportProgressBar 
        progress={40} 
        height={16}
      />
    );
    
    expect(root).toBeTruthy();
  });

  it('handles 0% progress', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressBar progress={0} />
    );
    
    expect(getByText('0%')).toBeTruthy();
  });

  it('handles 100% progress', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressBar progress={100} />
    );
    
    expect(getByText('100%')).toBeTruthy();
  });
});