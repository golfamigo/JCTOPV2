import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventsList from './EventsList';
import eventService from '../../../services/eventService';
import { PaginatedEventsResponse, EventWithRelations } from '@jctop-event/shared-types';

// Mock the eventService
jest.mock('../../../services/eventService');
const mockEventService = eventService as jest.Mocked<typeof eventService>;

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Helper function to render with ChakraProvider
const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

// Mock event data
const mockEvent: EventWithRelations = {
  id: 'event-1',
  organizerId: 'user-1',
  categoryId: 'category-1',
  venueId: 'venue-1',
  title: 'Test Event',
  description: 'Test event description',
  startDate: new Date('2024-12-15T19:00:00Z'),
  endDate: new Date('2024-12-15T22:00:00Z'),
  location: 'Test Location',
  status: 'published',
  createdAt: new Date(),
  updatedAt: new Date(),
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
    name: 'Test Venue',
    address: '123 Test St',
    city: 'Test City',
    capacity: 100,
    description: 'Test venue',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  ticketTypes: [
    {
      id: 'ticket-1',
      eventId: 'event-1',
      name: 'General',
      price: 25,
      quantity: 100,
    },
  ],
};

const mockPaginatedResponse: PaginatedEventsResponse = {
  data: [mockEvent],
  pagination: {
    page: 1,
    limit: 12,
    total: 1,
    totalPages: 1,
  },
};

describe('EventsList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render events list with title by default', async () => {
    mockEventService.getPublicEvents.mockResolvedValue(mockPaginatedResponse);

    renderWithChakra(<EventsList />);

    expect(screen.getByText('Discover Events')).toBeInTheDocument();
    expect(screen.getByText(/Find and discover amazing events/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
  });

  it('should not render title when showTitle is false', async () => {
    mockEventService.getPublicEvents.mockResolvedValue(mockPaginatedResponse);

    renderWithChakra(<EventsList showTitle={false} />);

    expect(screen.queryByText('Discover Events')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
  });

  it('should render custom title', async () => {
    mockEventService.getPublicEvents.mockResolvedValue(mockPaginatedResponse);

    renderWithChakra(<EventsList title="Custom Title" />);

    expect(screen.getByText('Custom Title')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
  });

  it('should display loading skeletons while fetching events', () => {
    mockEventService.getPublicEvents.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderWithChakra(<EventsList />);

    expect(screen.getAllByLabelText('Event card loading')).toHaveLength(12);
  });

  it('should display error state when API call fails', async () => {
    mockEventService.getPublicEvents.mockRejectedValue(new Error('Network error'));

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Events')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    });
  });

  it('should display empty state when no events are returned', async () => {
    mockEventService.getPublicEvents.mockResolvedValue({
      data: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      },
    });

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('No Events Found')).toBeInTheDocument();
      expect(screen.getByText(/There are no published events available/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Refresh Events' })).toBeInTheDocument();
    });
  });

  it('should retry fetching events when Try Again button is clicked', async () => {
    mockEventService.getPublicEvents
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockPaginatedResponse);

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Events')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    expect(mockEventService.getPublicEvents).toHaveBeenCalledTimes(2);
  });

  it('should refresh events when Refresh Events button is clicked in empty state', async () => {
    mockEventService.getPublicEvents
      .mockResolvedValueOnce({
        data: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
      })
      .mockResolvedValueOnce(mockPaginatedResponse);

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('No Events Found')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Refresh Events' }));

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    expect(mockEventService.getPublicEvents).toHaveBeenCalledTimes(2);
  });

  it('should call onEventClick when event card is clicked', async () => {
    mockEventService.getPublicEvents.mockResolvedValue(mockPaginatedResponse);
    const mockOnEventClick = jest.fn();

    renderWithChakra(<EventsList onEventClick={mockOnEventClick} />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('article'));
    expect(mockOnEventClick).toHaveBeenCalledWith('event-1');
  });

  it('should call onFavorite when favorite button is clicked', async () => {
    mockEventService.getPublicEvents.mockResolvedValue(mockPaginatedResponse);
    const mockOnFavorite = jest.fn();

    renderWithChakra(<EventsList onFavorite={mockOnFavorite} />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /add to favorites/i }));
    expect(mockOnFavorite).toHaveBeenCalledWith('event-1', true);
  });

  it('should show favorited state for events in favoritedEvents set', async () => {
    mockEventService.getPublicEvents.mockResolvedValue(mockPaginatedResponse);
    const favoritedEvents = new Set(['event-1']);

    renderWithChakra(
      <EventsList 
        onFavorite={jest.fn()} 
        favoritedEvents={favoritedEvents} 
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /remove from favorites/i })).toBeInTheDocument();
    });
  });

  it('should render pagination when there are multiple pages', async () => {
    const multiPageResponse: PaginatedEventsResponse = {
      data: [mockEvent],
      pagination: {
        page: 1,
        limit: 12,
        total: 25,
        totalPages: 3,
      },
    };

    mockEventService.getPublicEvents.mockResolvedValue(multiPageResponse);

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
      expect(screen.getByText('Showing 1 to 12 of 25 results')).toBeInTheDocument();
    });
  });

  it('should not render pagination when there is only one page', async () => {
    mockEventService.getPublicEvents.mockResolvedValue(mockPaginatedResponse);

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
    });
  });

  it('should handle page change', async () => {
    const multiPageResponse: PaginatedEventsResponse = {
      data: [mockEvent],
      pagination: {
        page: 1,
        limit: 12,
        total: 25,
        totalPages: 3,
      },
    };

    mockEventService.getPublicEvents.mockResolvedValue(multiPageResponse);

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(mockEventService.getPublicEvents).toHaveBeenCalledWith(2, 12);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('should handle items per page change', async () => {
    const multiPageResponse: PaginatedEventsResponse = {
      data: [mockEvent],
      pagination: {
        page: 1,
        limit: 12,
        total: 25,
        totalPages: 3,
      },
    };

    mockEventService.getPublicEvents.mockResolvedValue(multiPageResponse);

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    const select = screen.getByDisplayValue('12');
    fireEvent.change(select, { target: { value: '24' } });

    expect(mockEventService.getPublicEvents).toHaveBeenCalledWith(1, 24);
  });

  it('should use custom itemsPerPage prop', async () => {
    mockEventService.getPublicEvents.mockResolvedValue(mockPaginatedResponse);

    renderWithChakra(<EventsList itemsPerPage={6} />);

    expect(mockEventService.getPublicEvents).toHaveBeenCalledWith(1, 6);
  });

  it('should render events in responsive grid layout', async () => {
    const multiEventResponse: PaginatedEventsResponse = {
      data: [mockEvent, { ...mockEvent, id: 'event-2', title: 'Event 2' }],
      pagination: {
        page: 1,
        limit: 12,
        total: 2,
        totalPages: 1,
      },
    };

    mockEventService.getPublicEvents.mockResolvedValue(multiEventResponse);

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    // Check that events are rendered in a grid
    const events = screen.getAllByRole('article');
    expect(events).toHaveLength(2);
  });

  it('should handle service errors gracefully', async () => {
    mockEventService.getPublicEvents.mockRejectedValue('Unknown error');

    renderWithChakra(<EventsList />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Events')).toBeInTheDocument();
      expect(screen.getByText('Failed to load events')).toBeInTheDocument();
    });
  });
});