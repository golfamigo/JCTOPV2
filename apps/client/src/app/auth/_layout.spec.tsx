import React from 'react';
import { render } from '@testing-library/react-native';
import AuthLayout from './_layout';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: ({ children, screenOptions }: any) => {
    return React.createElement('Stack', { screenOptions }, children);
  },
}));

describe('AuthLayout Component', () => {
  it('renders without crashing', () => {
    render(<AuthLayout />);
  });

  it('configures Stack with correct screen options', () => {
    const { UNSAFE_root } = render(<AuthLayout />);
    
    const stack = UNSAFE_root.findByType('Stack' as any);
    expect(stack).toBeTruthy();
    expect(stack.props.screenOptions).toEqual({
      headerShown: false,
      presentation: 'modal',
      gestureEnabled: true,
      animation: 'slide_from_right',
    });
  });

  it('includes login screen configuration', () => {
    const { UNSAFE_root } = render(<AuthLayout />);
    
    const stackScreens = UNSAFE_root.findAllByType('Stack.Screen' as any);
    const loginScreen = stackScreens.find(screen => screen.props.name === 'login');
    
    expect(loginScreen).toBeTruthy();
    expect(loginScreen.props.options).toEqual({
      title: '登入',
      headerShown: false,
    });
  });

  it('includes register screen configuration', () => {
    const { UNSAFE_root } = render(<AuthLayout />);
    
    const stackScreens = UNSAFE_root.findAllByType('Stack.Screen' as any);
    const registerScreen = stackScreens.find(screen => screen.props.name === 'register');
    
    expect(registerScreen).toBeTruthy();
    expect(registerScreen.props.options).toEqual({
      title: '註冊',
      headerShown: false,
    });
  });

  it('uses modal presentation for auth flow', () => {
    const { UNSAFE_root } = render(<AuthLayout />);
    
    const stack = UNSAFE_root.findByType('Stack' as any);
    expect(stack.props.screenOptions.presentation).toBe('modal');
  });

  it('enables gestures for navigation', () => {
    const { UNSAFE_root } = render(<AuthLayout />);
    
    const stack = UNSAFE_root.findByType('Stack' as any);
    expect(stack.props.screenOptions.gestureEnabled).toBe(true);
  });

  it('configures slide animation', () => {
    const { UNSAFE_root } = render(<AuthLayout />);
    
    const stack = UNSAFE_root.findByType('Stack' as any);
    expect(stack.props.screenOptions.animation).toBe('slide_from_right');
  });

  it('hides headers for all auth screens', () => {
    const { UNSAFE_root } = render(<AuthLayout />);
    
    const stack = UNSAFE_root.findByType('Stack' as any);
    expect(stack.props.screenOptions.headerShown).toBe(false);
    
    const stackScreens = UNSAFE_root.findAllByType('Stack.Screen' as any);
    stackScreens.forEach(screen => {
      expect(screen.props.options.headerShown).toBe(false);
    });
  });
});