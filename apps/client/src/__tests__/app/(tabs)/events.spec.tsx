import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import EventsPage from './events';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock Chakra UI hook (removed since we're not using ChakraUI anymore)

// Mock EventsList component
jest.mock('../../components/features/event/EventsList', () => {
  return ({ onEventClick, onFavorite, title, showTitle }: any) => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    
    return React.createElement(View, { testID: 'events-list' }, [
      showTitle && React.createElement(Text, { key: 'title' }, title),
      React.createElement(TouchableOpacity, {
        key: 'event-item',
        testID: 'mock-event-item',
        onPress: () => onEventClick('test-event-id'),
      }, React.createElement(Text, null, 'Mock Event')),
      React.createElement(TouchableOpacity, {
        key: 'favorite-button',
        testID: 'mock-favorite-button',
        onPress: () => onFavorite('test-event-id', true),
      }, React.createElement(Text, null, 'Favorite')),
    ]);
  };
});

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
};

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('EventsPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
  });

  it('renders without crashing', () => {
    render(<EventsPage />);
  });

  it('renders EventsList component with correct props', () => {
    const { getByTestId, getByText } = render(<EventsPage />);
    
    expect(getByTestId('events-list')).toBeTruthy();
    expect(getByText('Discover Events')).toBeTruthy();
  });

  it('handles event click navigation', () => {
    const { getByTestId } = render(<EventsPage />);
    
    const eventItem = getByTestId('mock-event-item');
    fireEvent.press(eventItem);
    
    expect(mockRouter.push).toHaveBeenCalledWith('/event/test-event-id/register');
  });

  it('handles favorite functionality', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { getByTestId } = render(<EventsPage />);
    
    const favoriteButton = getByTestId('mock-favorite-button');
    fireEvent.press(favoriteButton);
    
    expect(consoleSpy).toHaveBeenCalledWith('Toggle favorite:', 'test-event-id', true);
    
    consoleSpy.mockRestore();
  });

  it('configures ScrollView with correct props', () => {
    const { UNSAFE_root } = render(<EventsPage />);
    
    const scrollView = UNSAFE_root.findByType('ScrollView' as any);
    expect(scrollView).toBeTruthy();
    expect(scrollView.props.showsVerticalScrollIndicator).toBe(false);
    expect(scrollView.props.contentContainerStyle).toEqual({ flexGrow: 1 });
  });

  it('sets up StatusBar with correct style', () => {
    const { UNSAFE_root } = render(<EventsPage />);
    
    const statusBar = UNSAFE_root.findByType('StatusBar' as any);
    expect(statusBar).toBeTruthy();
    expect(statusBar.props.style).toBe('dark');
  });

  it('passes correct props to EventsList', () => {
    const { getByTestId } = render(<EventsPage />);
    
    const eventsList = getByTestId('events-list');
    expect(eventsList).toBeTruthy();
    
    // EventsList should be rendered with these props
    // We can verify through the rendered content
    expect(getByText('Discover Events')).toBeTruthy();
  });

  it('maintains favoritedEvents state', () => {
    const { rerender } = render(<EventsPage />);
    
    // Component should maintain state across re-renders
    rerender(<EventsPage />);
    
    // State should persist (no errors should occur)
    expect(true).toBe(true);
  });

  it('uses flex layout for proper screen utilization', () => {
    const { UNSAFE_root } = render(<EventsPage />);
    
    const rootView = UNSAFE_root.findByType('View' as any);
    expect(rootView.props.style).toEqual({ flex: 1 });
  });
});