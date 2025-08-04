import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from './_layout';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: ({ children, screenOptions }: any) => {
    return React.createElement('Stack', { screenOptions }, children);
  },
}));

// Mock Chakra UI
jest.mock('@chakra-ui/react', () => ({
  ChakraProvider: ({ children, theme }: any) => {
    return React.createElement('ChakraProvider', { theme }, children);
  },
}));

// Mock theme
jest.mock('../theme', () => ({
  __esModule: true,
  default: { colors: { primary: '#2563EB' } },
}));

describe('RootLayout Component', () => {
  it('renders without crashing', () => {
    render(<RootLayout />);
  });

  it('wraps children with ChakraProvider', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    
    // Find ChakraProvider in the rendered component tree
    const chakraProvider = UNSAFE_root.findByType('ChakraProvider' as any);
    expect(chakraProvider).toBeTruthy();
  });

  it('configures Stack with correct screen options', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    
    // Find Stack in the rendered component tree
    const stack = UNSAFE_root.findByType('Stack' as any);
    expect(stack).toBeTruthy();
    expect(stack.props.screenOptions).toEqual({
      headerShown: false,
    });
  });

  it('includes (tabs) screen configuration', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    
    // Check that Stack.Screen is configured for (tabs)
    const stackScreen = UNSAFE_root.findByType('Stack.Screen' as any);
    expect(stackScreen).toBeTruthy();
    expect(stackScreen.props.name).toBe('(tabs)');
    expect(stackScreen.props.options).toEqual({ headerShown: false });
  });

  it('passes theme to ChakraProvider', () => {
    const { UNSAFE_root } = render(<RootLayout />);
    
    const chakraProvider = UNSAFE_root.findByType('ChakraProvider' as any);
    expect(chakraProvider.props.theme).toBeDefined();
  });
});