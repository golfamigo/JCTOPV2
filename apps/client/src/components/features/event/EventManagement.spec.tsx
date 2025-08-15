import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventManagement from './EventManagement';
import eventService from '../../../services/eventService';
import { Event } from '@jctop-event/shared-types';

// Mock the event service
jest.mock('../../../services/eventService');
const mockedEventService = eventService as jest.Mocked<typeof eventService>;

// Mock the child components
jest.mock('./DiscountCodeList', () => {
  return function MockDiscountCodeList({ eventId }: { eventId: string }) {
    return <div data-testid="discount-code-list">Discount Code List for {eventId}</div>;
  };
});

jest.mock('./TicketConfiguration', () => {
  return function MockTicketConfiguration() {
    return <div data-testid="ticket-configuration">Ticket Configuration</div>;
  };
});

jest.mock('./SeatingConfiguration', () => {
  return function MockSeatingConfiguration() {
    return <div data-testid="seating-configuration">Seating Configuration</div>;
  };
});

jest.mock('./EventStatusManager', () => {
  return function MockEventStatusManager({ 
    eventId, 
    currentStatus, 
    onStatusChanged 
  }: { 
    eventId: string; 
    currentStatus: string;
    onStatusChanged: (status: string) => void;
  }) {
    return (
      <div data-testid="event-status-manager">
        <div>Event Status Manager for {eventId}</div>
        <div>Current Status: {currentStatus}</div>
        <button onClick={() => onStatusChanged('published')}>
          Change Status
        </button>
      </div>
    );
  };
});

const renderComponent = (props: any = {}) => {
  const defaultProps = {
    eventId: 'test-event-id',
    onNavigateBack: jest.fn(),
  };

  return render(
    <ChakraProvider>
      <EventManagement {...defaultProps} {...props} />
    </ChakraProvider>
  );
};

const mockEvent: Event = {
  id: 'test-event-id',
  organizerId: 'organizer-1',
  categoryId: 'category-1',
  venueId: 'venue-1',
  title: 'Test Event',
  description: 'This is a test event description',
  startDate: new Date('2025-12-25T10:00:00Z'),
  endDate: new Date('2025-12-25T18:00:00Z'),
  location: 'Test Venue, Test City',
  status: 'draft',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
};

describe('EventManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner while fetching event', () => {
      mockedEventService.getEventForUser.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderComponent();

      expect(screen.getByText('Loading event details...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
    });
  });

  describe('Error State', () => {
    it('should show error message when event loading fails', async () => {
      const errorMessage = 'Failed to load event';
      mockedEventService.getEventForUser.mockRejectedValue(new Error(errorMessage));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show not found message when event is null', async () => {
      mockedEventService.getEventForUser.mockResolvedValue(null as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Event not found')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockedEventService.getEventForUser.mockResolvedValue(mockEvent);
    });

    it('should display event details correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      expect(screen.getByText('This is a test event description')).toBeInTheDocument();
      expect(screen.getByText('Test Venue, Test City')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should format dates correctly', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Check that dates are formatted
      expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
    });

    it('should show correct status badge color', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('draft')).toBeInTheDocument();
      });

      const statusBadge = screen.getByText('draft');
      expect(statusBadge).toHaveClass('chakra-badge');
    });

    it('should display published status correctly', async () => {
      const publishedEvent = { ...mockEvent, status: 'published' as const };
      mockedEventService.getEventForUser.mockResolvedValue(publishedEvent);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('published')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      mockedEventService.getEventForUser.mockResolvedValue(mockEvent);
    });

    it('should call onNavigateBack when breadcrumb is clicked', async () => {
      const onNavigateBack = jest.fn();
      renderComponent({ onNavigateBack });

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      const backLink = screen.getByText('My Events');
      fireEvent.click(backLink);

      expect(onNavigateBack).toHaveBeenCalled();
    });
  });

  describe('Tabs Navigation', () => {
    beforeEach(() => {
      mockedEventService.getEventForUser.mockResolvedValue(mockEvent);
    });

    it('should show Event Status tab by default', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByTestId('event-status-manager')).toBeInTheDocument();
      });

      expect(screen.getByText('Event Status Manager for test-event-id')).toBeInTheDocument();
      expect(screen.getByText('Current Status: draft')).toBeInTheDocument();
    });

    it('should switch to Discount Codes tab', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      const discountCodesTab = screen.getByText('Discount Codes');
      fireEvent.click(discountCodesTab);

      await waitFor(() => {
        expect(screen.getByTestId('discount-code-list')).toBeInTheDocument();
      });

      expect(screen.getByText('Discount Code List for test-event-id')).toBeInTheDocument();
    });

    it('should switch to Tickets tab', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      const ticketsTab = screen.getByText('Tickets');
      fireEvent.click(ticketsTab);

      await waitFor(() => {
        expect(screen.getByTestId('ticket-configuration')).toBeInTheDocument();
      });

      expect(screen.getByText('Ticket Configuration')).toBeInTheDocument();
      expect(screen.getByText('Configure ticket types and pricing for your event.')).toBeInTheDocument();
    });

    it('should switch to Seating tab', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      const seatingTab = screen.getByText('Seating');
      fireEvent.click(seatingTab);

      await waitFor(() => {
        expect(screen.getByTestId('seating-configuration')).toBeInTheDocument();
      });

      expect(screen.getByText('Seating Configuration')).toBeInTheDocument();
      expect(screen.getByText('Configure seating zones and capacity for your event.')).toBeInTheDocument();
    });
  });

  describe('Status Change Integration', () => {
    beforeEach(() => {
      mockedEventService.getEventForUser.mockResolvedValue(mockEvent);
    });

    it('should update event status when status changes', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('Current Status: draft')).toBeInTheDocument();
      });

      // Trigger status change
      const changeStatusButton = screen.getByText('Change Status');
      fireEvent.click(changeStatusButton);

      await waitFor(() => {
        expect(screen.getByText('Current Status: published')).toBeInTheDocument();
      });

      // The status badge should also update
      expect(screen.getByText('published')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should call getEventForUser with correct eventId', async () => {
      mockedEventService.getEventForUser.mockResolvedValue(mockEvent);

      renderComponent({ eventId: 'specific-event-id' });

      await waitFor(() => {
        expect(mockedEventService.getEventForUser).toHaveBeenCalledWith('specific-event-id');
      });
    });

    it('should reload event when eventId changes', async () => {
      mockedEventService.getEventForUser.mockResolvedValue(mockEvent);

      const { rerender } = renderComponent({ eventId: 'event-1' });

      await waitFor(() => {
        expect(mockedEventService.getEventForUser).toHaveBeenCalledWith('event-1');
      });

      // Change eventId
      rerender(
        <ChakraProvider>
          <EventManagement eventId="event-2" />
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(mockedEventService.getEventForUser).toHaveBeenCalledWith('event-2');
      });
    });
  });
});