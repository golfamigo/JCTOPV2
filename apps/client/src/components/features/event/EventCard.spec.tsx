import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { I18nextProvider } from 'react-i18next';
import EventCard from './EventCard';
import { EventWithRelations } from '@jctop-event/shared-types';
import { theme } from '@/theme';
import i18n from '../../../localization';

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'events.free': '免費',
        'events.from': '起價',
        'events.register': '報名',
        'events.viewDetails': '查看詳情',
        'events.registerForEvent': '報名活動',
        'events.addToFavorites': '加入收藏',
        'events.removeFromFavorites': '移除收藏',
        'events.events': '活動',
        'events.eventName': '活動名稱',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock event data
const mockEvent: EventWithRelations = {
  id: 'event-1',
  organizerId: 'user-1',
  categoryId: 'category-1',
  venueId: 'venue-1',
  title: 'Test Concert Event',
  description: 'A great concert event',
  startDate: new Date('2024-12-15T19:00:00Z'),
  endDate: new Date('2024-12-15T22:00:00Z'),
  location: 'Test Venue',
  status: 'published',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  category: {
    id: 'category-1',
    name: 'Music',
    description: 'Music events',
    color: '#2563EB',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  venue: {
    id: 'venue-1',
    name: 'Concert Hall',
    address: '123 Music St',
    city: 'Music City',
    capacity: 500,
    description: 'A great concert hall',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  ticketTypes: [
    {
      id: 'ticket-1',
      eventId: 'event-1',
      name: 'General Admission',
      price: 25.00,
      quantity: 100,
    },
    {
      id: 'ticket-2',
      eventId: 'event-1',
      name: 'VIP',
      price: 50.00,
      quantity: 20,
    },
  ],
};

const mockEventFree: EventWithRelations = {
  ...mockEvent,
  id: 'event-2',
  title: 'Free Community Event',
  ticketTypes: [
    {
      id: 'ticket-3',
      eventId: 'event-2',
      name: 'Free Admission',
      price: 0,
      quantity: 200,
    },
  ],
};

// Helper function to render with ThemeProvider
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('EventCard', () => {
  it('should render event information correctly', () => {
    renderWithProviders(<EventCard event={mockEvent} />);

    expect(screen.getByText('Test Concert Event')).toBeTruthy();
    expect(screen.getByText('Music')).toBeTruthy();
    expect(screen.getByText('Concert Hall')).toBeTruthy();
    expect(screen.getByText('起價 NT$25')).toBeTruthy();
  });

  it('should format date and time correctly', () => {
    renderWithProviders(<EventCard event={mockEvent} />);

    // Check for Traditional Chinese date format (YYYY年MM月DD日)
    expect(screen.getByText(/2024年12月15日/)).toBeTruthy();
    expect(screen.getByText(/19:00/)).toBeTruthy(); // 24-hour format
  });

  it('should display "免費" for free events', () => {
    renderWithProviders(<EventCard event={mockEventFree} />);

    expect(screen.getByText('起價 免費')).toBeTruthy();
  });

  it('should display "免費" when no ticket types are available', () => {
    const eventNoTickets = { ...mockEvent, ticketTypes: [] };
    renderWithProviders(<EventCard event={eventNoTickets} />);

    expect(screen.getByText('起價 免費')).toBeTruthy();
  });

  it('should call onEventClick when card is pressed', () => {
    const mockOnEventClick = jest.fn();
    renderWithProviders(
      <EventCard event={mockEvent} onEventClick={mockOnEventClick} />
    );

    const card = screen.getByTestId('event-card-event-1');
    fireEvent.press(card);
    expect(mockOnEventClick).toHaveBeenCalledWith('event-1');
  });

  it('should render favorite button when onFavorite prop is provided', () => {
    const mockOnFavorite = jest.fn();
    renderWithProviders(
      <EventCard event={mockEvent} onFavorite={mockOnFavorite} />
    );

    expect(screen.getByTestId('favorite-button-event-1')).toBeTruthy();
  });

  it('should call onFavorite when favorite button is pressed', () => {
    const mockOnFavorite = jest.fn();
    renderWithProviders(
      <EventCard event={mockEvent} onFavorite={mockOnFavorite} />
    );

    const favoriteButton = screen.getByTestId('favorite-button-event-1');
    fireEvent.press(favoriteButton);
    expect(mockOnFavorite).toHaveBeenCalledWith('event-1', true);
  });

  it('should call onFavorite with false when removing from favorites', () => {
    const mockOnFavorite = jest.fn();
    renderWithProviders(
      <EventCard event={mockEvent} onFavorite={mockOnFavorite} isFavorited={true} />
    );

    const favoriteButton = screen.getByTestId('favorite-button-event-1');
    fireEvent.press(favoriteButton);
    expect(mockOnFavorite).toHaveBeenCalledWith('event-1', false);
  });

  it('should not render favorite button when onFavorite prop is not provided', () => {
    renderWithProviders(<EventCard event={mockEvent} />);

    expect(screen.queryByTestId('favorite-button-event-1')).toBeNull();
  });

  it('should render View Details button', () => {
    renderWithProviders(<EventCard event={mockEvent} />);

    expect(screen.getByTestId('view-details-button-event-1')).toBeTruthy();
  });

  it('should call onEventClick when View Details button is pressed', () => {
    const mockOnEventClick = jest.fn();
    renderWithProviders(
      <EventCard event={mockEvent} onEventClick={mockOnEventClick} />
    );

    const viewDetailsButton = screen.getByTestId('view-details-button-event-1');
    fireEvent.press(viewDetailsButton);
    expect(mockOnEventClick).toHaveBeenCalledWith('event-1');
  });

  it('should display loading skeleton when isLoading is true', () => {
    renderWithProviders(<EventCard event={mockEvent} isLoading={true} />);

    // Check for loading skeleton structure
    const loadingView = screen.getByTestId('loading-skeleton');
    expect(loadingView).toBeTruthy();
  });

  it('should use location when venue name is not available', () => {
    const eventNoVenue = { ...mockEvent, venue: undefined };
    renderWithProviders(<EventCard event={eventNoVenue} />);

    expect(screen.getByText('Test Venue')).toBeTruthy();
  });

  it('should calculate minimum price correctly', () => {
    renderWithProviders(<EventCard event={mockEvent} />);

    // Should show NT$25 (minimum of NT$25 and NT$50)
    expect(screen.getByText('起價 NT$25')).toBeTruthy();
  });

  it('should be accessible with proper accessibility labels', () => {
    renderWithProviders(<EventCard event={mockEvent} />);

    const card = screen.getByTestId('event-card-event-1');
    expect(card.props.accessibilityLabel).toBe('活動: Test Concert Event');
    expect(card.props.accessibilityRole).toBe('button');
  });

  it('should render register button for published events when onRegister is provided', () => {
    const mockOnRegister = jest.fn();
    renderWithProviders(
      <EventCard 
        event={mockEvent} 
        onRegister={mockOnRegister}
      />
    );

    expect(screen.getByTestId('register-button-event-1')).toBeTruthy();
  });

  it('should call onRegister when register button is pressed', () => {
    const mockOnRegister = jest.fn();
    renderWithProviders(
      <EventCard 
        event={mockEvent} 
        onRegister={mockOnRegister}
      />
    );

    const registerButton = screen.getByTestId('register-button-event-1');
    fireEvent.press(registerButton);
    expect(mockOnRegister).toHaveBeenCalledWith('event-1');
  });

  it('should render Traditional Chinese text content', () => {
    renderWithProviders(<EventCard event={mockEvent} />);

    expect(screen.getByText('查看詳情')).toBeTruthy();
    expect(screen.getByText('起價')).toBeTruthy();
  });
});