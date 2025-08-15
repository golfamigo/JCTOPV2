import React from 'react';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '../theme';

/**
 * Test wrapper component to provide theme context for testing
 * Replaces ChakraProvider with RNE ThemeProvider
 */
export const TestThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

/**
 * Helper function to wrap components with theme provider for testing
 */
export const withTheme = (component: React.ReactElement) => {
  return <TestThemeProvider>{component}</TestThemeProvider>;
};