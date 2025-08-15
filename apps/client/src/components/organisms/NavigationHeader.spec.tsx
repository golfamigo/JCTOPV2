import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NavigationHeader from './NavigationHeader';

// Mock expo-router
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: {
    back: mockBack,
  },
}));

// Mock theme hook
jest.mock('@/theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      white: '#FFFFFF',
    },
    spacing: {
      sm: 8,
    },
  }),
}));

// Mock @rneui/themed components
jest.mock('@rneui/themed', () => {
  const React = require('react');
  return {
    Header: ({ leftComponent, centerComponent, rightComponent, ...props }: any) => {
      return React.createElement('Header', props, [
        leftComponent && React.createElement('View', { key: 'left' }, leftComponent),
        centerComponent && React.createElement('Text', { key: 'center' }, 
          typeof centerComponent === 'object' ? centerComponent.text : centerComponent
        ),
        rightComponent && React.createElement('View', { key: 'right' }, rightComponent),
      ]);
    },
    Icon: ({ onPress, ...props }: any) => 
      React.createElement('Icon', { onPress, ...props }),
  };
});

describe('NavigationHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with title', () => {
    const { getByText } = render(
      <NavigationHeader title="Test Title" />
    );
    
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('renders back button when showBackButton is true', () => {
    const { UNSAFE_root } = render(
      <NavigationHeader title="Test" showBackButton />
    );
    
    const backIcon = UNSAFE_root.findByProps({ name: 'arrow-left', testID: 'back-button' });
    expect(backIcon).toBeTruthy();
  });

  it('renders menu button when showMenuButton is true', () => {
    const mockOnMenuPress = jest.fn();
    const { UNSAFE_root } = render(
      <NavigationHeader 
        title="Test" 
        showMenuButton 
        onMenuPress={mockOnMenuPress} 
      />
    );
    
    const menuIcon = UNSAFE_root.findByProps({ name: 'menu', testID: 'menu-button' });
    expect(menuIcon).toBeTruthy();
  });

  it.skip('calls router.back when back button is pressed', () => {
    const { UNSAFE_root } = render(
      <NavigationHeader title="Test" showBackButton />
    );
    
    const backIcon = UNSAFE_root.findByProps({ testID: 'back-button' });
    fireEvent.press(backIcon);
    
    expect(mockBack).toHaveBeenCalled();
  });

  it('calls onMenuPress when menu button is pressed', () => {
    const mockOnMenuPress = jest.fn();
    const { UNSAFE_root } = render(
      <NavigationHeader 
        title="Test" 
        showMenuButton 
        onMenuPress={mockOnMenuPress} 
      />
    );
    
    const menuIcon = UNSAFE_root.findByProps({ testID: 'menu-button' });
    fireEvent.press(menuIcon);
    
    expect(mockOnMenuPress).toHaveBeenCalled();
  });

  it('renders right component when provided', () => {
    const rightComponent = React.createElement('Text', { testID: 'right-component' }, 'Right');
    const { getByTestId } = render(
      <NavigationHeader title="Test" rightComponent={rightComponent} />
    );
    
    expect(getByTestId('right-component')).toBeTruthy();
  });

  it('applies correct theme styling', () => {
    const { UNSAFE_root } = render(
      <NavigationHeader title="Test" />
    );
    
    const header = UNSAFE_root.findByType('Header');
    expect(header.props.backgroundColor).toBe('#007BFF');
  });

  it('does not render any button when neither showBackButton nor showMenuButton is true', () => {
    const { UNSAFE_root } = render(
      <NavigationHeader title="Test" />
    );
    
    const icons = UNSAFE_root.findAllByType('Icon');
    expect(icons).toHaveLength(0);
  });
});