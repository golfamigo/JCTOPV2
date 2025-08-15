import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AttendeeManagementPage from './AttendeeManagementPage';
import attendeeService from '../../../services/attendeeService';
import eventService from '../../../services/eventService';

// Mock services
jest.mock('../../../services/attendeeService');
jest.mock('../../../services/eventService');

const mockAttendeeService = attendeeService as jest.Mocked<typeof attendeeService>;
const mockEventService = eventService as jest.Mocked<typeof eventService>;

// Mock toast
const mockToast = jest.fn();
// Removed ChakraUI mock

const mockEvent = {
  id: 'event-1',
  title: 'Tech Conference 2023',
  description: 'Annual tech conference',
  startDate: new Date('2023-06-01T09:00:00Z'),
  endDate: new Date('2023-06-01T18:00:00Z'),
  location: 'Convention Center',
  status: 'published',
  organizerId: 'organizer-1',
  categoryId: 'category-1',
  venueId: 'venue-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAttendeeResponse = {
  attendees: [
    {
      id: 'reg-1',
      userId: 'user-1',
      eventId: 'event-1',
      status: 'paid' as const,
      paymentStatus: 'completed' as const,
      totalAmount: 100,
      discountAmount: 10,
      finalAmount: 90,
      customFieldValues: { company: 'Tech Corp' },
      ticketSelections: [{ ticketTypeId: 'ticket-1', quantity: 1, price: 100 }],
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2023-01-01T11:00:00Z',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      userPhone: '+1234567890',
      qrCode: 'qr-code-data',
    },
    {
      id: 'reg-2',
      userId: 'user-2',
      eventId: 'event-1',
      status: 'pending' as const,
      paymentStatus: 'pending' as const,
      totalAmount: 150,
      discountAmount: 0,
      finalAmount: 150,
      customFieldValues: {},
      ticketSelections: [{ ticketTypeId: 'ticket-2', quantity: 1, price: 150 }],
      createdAt: '2023-01-02T10:00:00Z',
      updatedAt: '2023-01-02T11:00:00Z',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      qrCode: 'qr-code-data-2',
    },
  ],
  total: 2,
  page: 1,
  limit: 20,
  totalPages: 1,
};

const renderComponent = (props = {}) => {
  const defaultProps = {
    eventId: 'event-1',
    onNavigateBack: jest.fn(),
    ...props,
  };

  return render(
    <ChakraProvider>
      <AttendeeManagementPage {...defaultProps} />
    </ChakraProvider>
  );
};

describe('AttendeeManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEventService.getEventForUser.mockResolvedValue(mockEvent);
    mockAttendeeService.getEventAttendees.mockResolvedValue(mockAttendeeResponse);
  });

  describe('Initial Loading', () => {
    it('should render loading state initially', async () => {
      renderComponent();
      
      expect(screen.getByText('Loading attendees...')).toBeInTheDocument();
    });

    it('should load event details and attendees', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockEventService.getEventForUser).toHaveBeenCalledWith('event-1');
        expect(mockAttendeeService.getEventAttendees).toHaveBeenCalledWith(
          'event-1',
          expect.objectContaining({
            page: 1,
            limit: 20,
          })
        );
      });
    });

    it('should display event title in header', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Tech Conference 2023')).toBeInTheDocument();
      });
    });
  });

  describe('Attendee List Display', () => {
    it('should display attendee information', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      });
    });

    it('should display status badges', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('paid')).toBeInTheDocument();
        expect(screen.getByText('pending')).toBeInTheDocument();
        expect(screen.getByText('completed')).toBeInTheDocument();
      });
    });

    it('should display attendee statistics', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total attendees
        expect(screen.getByText('1 of 1')).toBeInTheDocument(); // Current page
      });
    });
  });

  describe('Search and Filtering', () => {
    it('should handle search input', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search by name or email...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search by name or email...');
      fireEvent.change(searchInput, { target: { value: 'john' } });

      await waitFor(() => {
        expect(mockAttendeeService.getEventAttendees).toHaveBeenCalledWith(
          'event-1',
          expect.objectContaining({
            search: 'john',
          })
        );
      });
    });

    it('should handle status filter', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('')).toBeInTheDocument(); // Status select
      });

      const statusSelect = screen.getByDisplayValue('');
      fireEvent.change(statusSelect, { target: { value: 'paid' } });

      await waitFor(() => {
        expect(mockAttendeeService.getEventAttendees).toHaveBeenCalledWith(
          'event-1',
          expect.objectContaining({
            status: 'paid',
          })
        );
      });
    });

    it('should handle sorting', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText(/Date/)).toBeInTheDocument();
      });

      const dateButton = screen.getByText(/Date/);
      fireEvent.click(dateButton);

      await waitFor(() => {
        expect(mockAttendeeService.getEventAttendees).toHaveBeenCalledWith(
          'event-1',
          expect.objectContaining({
            sortBy: 'createdAt',
            sortOrder: 'ASC', // Should toggle from DESC to ASC
          })
        );
      });
    });
  });

  describe('Export Functionality', () => {
    it('should show export menu', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      expect(screen.getByText('Export as CSV')).toBeInTheDocument();
      expect(screen.getByText('Export as Excel')).toBeInTheDocument();
    });

    it('should handle CSV export', async () => {
      mockAttendeeService.exportEventAttendees.mockResolvedValue();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      const csvExportButton = screen.getByText('Export as CSV');
      fireEvent.click(csvExportButton);

      await waitFor(() => {
        expect(mockAttendeeService.exportEventAttendees).toHaveBeenCalledWith(
          'event-1',
          {
            format: 'csv',
            status: undefined,
            search: undefined,
          }
        );
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Export successful',
        description: 'Attendee list exported as CSV',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    });

    it('should handle Excel export', async () => {
      mockAttendeeService.exportEventAttendees.mockResolvedValue();
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      const excelExportButton = screen.getByText('Export as Excel');
      fireEvent.click(excelExportButton);

      await waitFor(() => {
        expect(mockAttendeeService.exportEventAttendees).toHaveBeenCalledWith(
          'event-1',
          {
            format: 'excel',
            status: undefined,
            search: undefined,
          }
        );
      });
    });

    it('should handle export errors', async () => {
      mockAttendeeService.exportEventAttendees.mockRejectedValue(new Error('Export failed'));
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Export')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      const csvExportButton = screen.getByText('Export as CSV');
      fireEvent.click(csvExportButton);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Export failed',
          description: 'Export failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when event loading fails', async () => {
      mockEventService.getEventForUser.mockRejectedValue(new Error('Event not found'));
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Event not found')).toBeInTheDocument();
      });
    });

    it('should display error message when attendee loading fails', async () => {
      mockAttendeeService.getEventAttendees.mockRejectedValue(new Error('Failed to load attendees'));
      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('Failed to load attendees')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no attendees exist', async () => {
      mockAttendeeService.getEventAttendees.mockResolvedValue({
        attendees: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      renderComponent();
      
      await waitFor(() => {
        expect(screen.getByText('No attendees found')).toBeInTheDocument();
        expect(screen.getByText('No one has registered for this event yet')).toBeInTheDocument();
      });
    });

    it('should display filtered empty state', async () => {
      mockAttendeeService.getEventAttendees.mockResolvedValue({
        attendees: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      renderComponent();
      
      // Set a filter
      await waitFor(() => {
        expect(screen.getByDisplayValue('')).toBeInTheDocument();
      });

      const statusSelect = screen.getByDisplayValue('');
      fireEvent.change(statusSelect, { target: { value: 'paid' } });

      await waitFor(() => {
        expect(screen.getByText('No attendees found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onNavigateBack when breadcrumb is clicked', async () => {
      const mockNavigateBack = jest.fn();
      renderComponent({ onNavigateBack: mockNavigateBack });
      
      await waitFor(() => {
        expect(screen.getByText('Event Management')).toBeInTheDocument();
      });

      const breadcrumbLink = screen.getByText('Event Management');
      fireEvent.click(breadcrumbLink);

      expect(mockNavigateBack).toHaveBeenCalled();
    });
  });
});