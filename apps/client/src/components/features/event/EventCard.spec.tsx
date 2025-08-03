import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import EventCard from './EventCard';
import { EventWithRelations } from '@jctop-event/shared-types';

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

// Helper function to render with ChakraProvider
const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('EventCard', () => {
  it('should render event information correctly', () => {
    renderWithChakra(<EventCard event={mockEvent} />);

    expect(screen.getByText('Test Concert Event')).toBeInTheDocument();
    expect(screen.getByText('Music')).toBeInTheDocument();
    expect(screen.getByText('Concert Hall')).toBeInTheDocument();
    expect(screen.getByText('From $25.00')).toBeInTheDocument();
    expect(screen.getByText('published')).toBeInTheDocument();
  });

  it('should format date and time correctly', () => {
    renderWithChakra(<EventCard event={mockEvent} />);

    // Check for date format - should contain date and time in expected format
    expect(screen.getByText(/Dec \d{1,2}, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/\d{1,2}:\d{2} (AM|PM)/)).toBeInTheDocument();
  });

  it('should display "Free" for free events', () => {
    renderWithChakra(<EventCard event={mockEventFree} />);

    expect(screen.getByText('From Free')).toBeInTheDocument();
  });

  it('should display "Free" when no ticket types are available', () => {
    const eventNoTickets = { ...mockEvent, ticketTypes: [] };
    renderWithChakra(<EventCard event={eventNoTickets} />);

    expect(screen.getByText('From Free')).toBeInTheDocument();
  });

  it('should call onEventClick when card is clicked', () => {
    const mockOnEventClick = jest.fn();
    renderWithChakra(
      <EventCard event={mockEvent} onEventClick={mockOnEventClick} />
    );

    fireEvent.click(screen.getByRole('article'));
    expect(mockOnEventClick).toHaveBeenCalledWith('event-1');
  });

  it('should call onEventClick when Enter key is pressed', () => {
    const mockOnEventClick = jest.fn();
    renderWithChakra(
      <EventCard event={mockEvent} onEventClick={mockOnEventClick} />
    );

    const card = screen.getByRole('article');
    fireEvent.keyDown(card, { key: 'Enter', code: 'Enter' });
    expect(mockOnEventClick).toHaveBeenCalledWith('event-1');
  });

  it('should call onEventClick when Space key is pressed', () => {
    const mockOnEventClick = jest.fn();
    renderWithChakra(
      <EventCard event={mockEvent} onEventClick={mockOnEventClick} />
    );

    const card = screen.getByRole('article');
    fireEvent.keyDown(card, { key: ' ', code: 'Space' });
    expect(mockOnEventClick).toHaveBeenCalledWith('event-1');
  });

  it('should render favorite button when onFavorite prop is provided', () => {
    const mockOnFavorite = jest.fn();
    renderWithChakra(
      <EventCard event={mockEvent} onFavorite={mockOnFavorite} />
    );

    expect(screen.getByRole('button', { name: /add to favorites/i })).toBeInTheDocument();
  });

  it('should call onFavorite when favorite button is clicked', () => {
    const mockOnFavorite = jest.fn();
    renderWithChakra(
      <EventCard event={mockEvent} onFavorite={mockOnFavorite} />
    );

    fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));
    expect(mockOnFavorite).toHaveBeenCalledWith('event-1', true);
  });

  it('should show correct favorite state when isFavorited is true', () => {
    const mockOnFavorite = jest.fn();
    renderWithChakra(
      <EventCard event={mockEvent} onFavorite={mockOnFavorite} isFavorited={true} />
    );

    expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
  });

  it('should call onFavorite with false when removing from favorites', () => {
    const mockOnFavorite = jest.fn();
    renderWithChakra(
      <EventCard event={mockEvent} onFavorite={mockOnFavorite} isFavorited={true} />
    );

    fireEvent.click(screen.getByRole('button', { name: /remove from favorites/i }));
    expect(mockOnFavorite).toHaveBeenCalledWith('event-1', false);
  });

  it('should not render favorite button when onFavorite prop is not provided', () => {
    renderWithChakra(<EventCard event={mockEvent} />);

    expect(screen.queryByRole('button', { name: /add to favorites/i })).not.toBeInTheDocument();
  });

  it('should render View Details button', () => {
    renderWithChakra(<EventCard event={mockEvent} />);

    expect(screen.getByRole('button', { name: /view details for test concert event/i })).toBeInTheDocument();
  });

  it('should call onEventClick when View Details button is clicked', () => {
    const mockOnEventClick = jest.fn();
    renderWithChakra(
      <EventCard event={mockEvent} onEventClick={mockOnEventClick} />
    );

    fireEvent.click(screen.getByRole('button', { name: /view details for test concert event/i }));
    expect(mockOnEventClick).toHaveBeenCalledWith('event-1');
  });

  it('should display loading skeleton when isLoading is true', () => {
    renderWithChakra(<EventCard event={mockEvent} isLoading={true} />);

    expect(screen.getByLabelText('Event card loading')).toBeInTheDocument();
  });

  it('should not call handlers when loading', () => {
    const mockOnEventClick = jest.fn();
    const mockOnFavorite = jest.fn();
    
    renderWithChakra(
      <EventCard 
        event={mockEvent} 
        onEventClick={mockOnEventClick}
        onFavorite={mockOnFavorite}
        isLoading={true} 
      />
    );

    fireEvent.click(screen.getByRole('article', { name: 'Event card loading' }));
    expect(mockOnEventClick).not.toHaveBeenCalled();
  });

  it('should use location when venue name is not available', () => {
    const eventNoVenue = { ...mockEvent, venue: undefined };
    renderWithChakra(<EventCard event={eventNoVenue} />);

    expect(screen.getByText('Test Venue')).toBeInTheDocument();
  });

  it('should calculate minimum price correctly', () => {
    renderWithChakra(<EventCard event={mockEvent} />);

    // Should show $25.00 (minimum of $25.00 and $50.00)
    expect(screen.getByText('From $25.00')).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    renderWithChakra(<EventCard event={mockEvent} />);

    const card = screen.getByRole('article');
    expect(card).toHaveAttribute('aria-label', 'Event: Test Concert Event');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('should have proper focus management', () => {
    renderWithChakra(<EventCard event={mockEvent} />);

    const card = screen.getByRole('article');
    card.focus();
    expect(card).toHaveFocus();
  });

  it('should prevent event propagation when favorite button is clicked', () => {
    const mockOnEventClick = jest.fn();
    const mockOnFavorite = jest.fn();
    
    renderWithChakra(
      <EventCard 
        event={mockEvent} 
        onEventClick={mockOnEventClick}
        onFavorite={mockOnFavorite}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));
    
    expect(mockOnFavorite).toHaveBeenCalledWith('event-1', true);
    expect(mockOnEventClick).not.toHaveBeenCalled();
  });

  it('should prevent event propagation when View Details button is clicked', () => {
    const mockOnEventClick = jest.fn();
    
    renderWithChakra(
      <EventCard 
        event={mockEvent} 
        onEventClick={mockOnEventClick}
      />
    );

    // Click the view details button
    fireEvent.click(screen.getByRole('button', { name: /view details for test concert event/i }));
    
    // Should call onEventClick once (from the button click, not from card click)
    expect(mockOnEventClick).toHaveBeenCalledTimes(1);
    expect(mockOnEventClick).toHaveBeenCalledWith('event-1');
  });
});