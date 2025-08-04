import React from 'react';
import { render } from '@testing-library/react-native';
import TabLayout from './_layout';

// Mock expo-router
jest.mock('expo-router', () => ({
  Tabs: ({ children, screenOptions }: any) => {
    return React.createElement('Tabs', { screenOptions }, children);
  },
}));

describe('TabLayout Component', () => {
  it('renders without crashing', () => {
    render(<TabLayout />);
  });

  it('configures Tabs with correct screen options', () => {
    const { UNSAFE_root } = render(<TabLayout />);
    
    const tabs = UNSAFE_root.findByType('Tabs' as any);
    expect(tabs).toBeTruthy();
    expect(tabs.props.screenOptions).toEqual({
      tabBarActiveTintColor: '#2563EB',
      tabBarInactiveTintColor: '#64748B', 
      headerShown: false,
    });
  });

  it('includes events tab configuration', () => {
    const { UNSAFE_root } = render(<TabLayout />);
    
    const tabsScreen = UNSAFE_root.findByType('Tabs.Screen' as any);
    expect(tabsScreen).toBeTruthy();
    expect(tabsScreen.props.name).toBe('events');
    expect(tabsScreen.props.options).toEqual({
      title: 'Events',
      tabBarLabel: 'Discover',
    });
  });

  it('uses branded colors for tab styling', () => {
    const { UNSAFE_root } = render(<TabLayout />);
    
    const tabs = UNSAFE_root.findByType('Tabs' as any);
    const screenOptions = tabs.props.screenOptions;
    
    // Verify brand colors are used
    expect(screenOptions.tabBarActiveTintColor).toBe('#2563EB'); // Primary brand color
    expect(screenOptions.tabBarInactiveTintColor).toBe('#64748B'); // Muted brand color
  });

  it('disables headers for individual tabs', () => {
    const { UNSAFE_root } = render(<TabLayout />);
    
    const tabs = UNSAFE_root.findByType('Tabs' as any);
    expect(tabs.props.screenOptions.headerShown).toBe(false);
  });
});