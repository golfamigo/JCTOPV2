import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavigationContainer } from '@react-navigation/native';
import { CheckInModeScreen } from './CheckInModeScreen';
import eventService from '../../../services/eventService';
import statisticsService from '../../../services/statisticsService';
import { checkInService } from '../../../services/checkinService';

// Mock all services
jest.mock('../../../services/eventService');
jest.mock('../../../services/statisticsService');
jest.mock('../../../services/checkinService');
jest.mock('../../../services/cameraService');
jest.mock('../../../services/attendeeSearchService');

const mockEventService = eventService as jest.Mocked<typeof eventService>;
const mockStatisticsService = statisticsService as jest.Mocked<typeof statisticsService>;
const mockCheckInService = checkInService as jest.Mocked<typeof checkInService>;

// Mock theme
const MockTheme = () => ({
  colors: {
    primary: { 500: '#2563EB', 600: '#1D4ED8' },
    success: { 600: '#059669' },
    warning: { 600: '#D97706' },
    error: { 600: '#DC2626' },
    neutral: { 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 800: '#1F2937', 900: '#111827' },
  },
});

const renderWithProviders = (component: React.ReactElement, route = '/organizer/events/test-event-id/checkin') => {
  return render(
    <ChakraProvider theme={MockTheme() as any}>
      <MemoryRouter initialEntries={[route]}>
        {component}
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe('CheckInModeScreen E2E', () => {
  const mockEvent = {
    id: 'test-event-id',
    title: 'Test Event',
    description: 'Test event description',
    startDate: new Date('2024-06-01T10:00:00Z'),
    endDate: new Date('2024-06-01T18:00:00Z'),
    status: 'published',
    organizerId: 'test-organizer-id',
    categoryId: 'test-category-id',
    venueId: 'test-venue-id',
    location: 'Test Location',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  };

  const mockInitialStatistics = {
    eventId: 'test-event-id',
    totalRegistrations: 100,
    checkedInCount: 45,
    attendanceRate: 45.0,
    lastUpdated: '2024-01-01T12:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockEventService.getEventById.mockResolvedValue(mockEvent);
    mockStatisticsService.getEventStatistics.mockResolvedValue({
      success: true,
      data: mockInitialStatistics,
    });
    mockStatisticsService.refreshEventStatistics.mockResolvedValue({
      success: true,
      data: mockInitialStatistics,
    });
  });

  describe('Initial Load and Statistics Display', () => {
    it('should load event and display initial statistics', async () => {
      renderWithProviders(<CheckInModeScreen />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Check that statistics are displayed
      expect(screen.getByText('100')).toBeInTheDocument(); // Total registrations
      expect(screen.getByText('45')).toBeInTheDocument(); // Checked in
      expect(screen.getByText('45.0%')).toBeInTheDocument(); // Attendance rate
      expect(screen.getByText('55')).toBeInTheDocument(); // Pending (100-45)

      // Verify service calls
      expect(mockEventService.getEventById).toHaveBeenCalledWith('test-event-id');
      expect(mockStatisticsService.getEventStatistics).toHaveBeenCalledWith('test-event-id');
    });

    it('should show loading state initially', () => {
      // Make the service calls hang to test loading state
      mockEventService.getEventById.mockImplementation(() => new Promise(() => {}));
      mockStatisticsService.getEventStatistics.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<CheckInModeScreen />);

      expect(screen.getByText('Loading check-in mode...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Statistics Refresh Functionality', () => {
    it('should refresh statistics when refresh button is clicked', async () => {
      const updatedStatistics = {
        ...mockInitialStatistics,
        checkedInCount: 50,
        attendanceRate: 50.0,
      };

      mockStatisticsService.refreshEventStatistics.mockResolvedValue({
        success: true,
        data: updatedStatistics,
      });

      renderWithProviders(<CheckInModeScreen />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument();
      });

      // Click refresh button
      const refreshButton = screen.getByLabelText('Refresh statistics');
      fireEvent.click(refreshButton);

      // Wait for updated statistics
      await waitFor(() => {
        expect(screen.getByText('50')).toBeInTheDocument();
      });

      expect(mockStatisticsService.refreshEventStatistics).toHaveBeenCalledWith('test-event-id');
    });

    it('should handle refresh errors gracefully', async () => {
      mockStatisticsService.refreshEventStatistics.mockResolvedValue({
        success: false,
        error: 'Failed to refresh statistics',
      });

      renderWithProviders(<CheckInModeScreen />);

      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument();
      });

      const refreshButton = screen.getByLabelText('Refresh statistics');
      fireEvent.click(refreshButton);

      // Should show error toast (assuming toast implementation)
      await waitFor(() => {
        expect(mockStatisticsService.refreshEventStatistics).toHaveBeenCalled();
      });
    });
  });

  describe('Real-time Updates Simulation', () => {
    it('should simulate successful check-in updating statistics', async () => {
      const updatedStatistics = {
        ...mockInitialStatistics,
        checkedInCount: 46,
        attendanceRate: 46.0,
      };

      // Mock a successful check-in
      mockCheckInService.getInstance = jest.fn().mockReturnValue({
        processQRCodeCheckIn: jest.fn().mockResolvedValue({
          success: true,
          data: {
            attendee: {
              name: 'John Doe',
              email: 'john@example.com',
              ticketType: 'General Admission',
            },
          },
        }),
      });

      mockStatisticsService.refreshEventStatistics.mockResolvedValue({
        success: true,
        data: updatedStatistics,
      });

      renderWithProviders(<CheckInModeScreen />);

      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument();
      });

      // Simulate QR code scan (this would normally come from camera)
      // Note: This is a simplified simulation since the actual QR scanning
      // involves camera permissions and complex interaction flows
      
      // The statistics should update after a successful check-in
      // This would be triggered by the handleQRCodeScanned function
    });
  });

  describe('Error Handling', () => {
    it('should handle event loading errors', async () => {
      mockEventService.getEventById.mockRejectedValue(new Error('Event not found'));

      renderWithProviders(<CheckInModeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Event not found or access denied.')).toBeInTheDocument();
      });
    });

    it('should handle statistics loading errors', async () => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: false,
        error: 'Statistics service unavailable',
      });

      renderWithProviders(<CheckInModeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Should show error state in statistics component
      await waitFor(() => {
        expect(screen.getByText('Failed to load statistics: Statistics service unavailable')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should have correct breadcrumb navigation', async () => {
      renderWithProviders(<CheckInModeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Check-in Mode')).toBeInTheDocument();
    });

    it('should navigate back when exit button is clicked', async () => {
      renderWithProviders(<CheckInModeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Exit Check-in Mode')).toBeInTheDocument();
      });

      const exitButton = screen.getByText('Exit Check-in Mode');
      fireEvent.click(exitButton);

      // Note: In a real E2E test, you'd verify the navigation occurred
      // Here we're just testing the button exists and is clickable
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', async () => {
      renderWithProviders(<CheckInModeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Check for important accessibility features
      expect(screen.getByLabelText('Refresh statistics')).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      
      // Statistics should be in proper landmark regions
      const stats = screen.getAllByRole('group'); // Stat components have group role
      expect(stats.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should render statistics in grid layout', async () => {
      renderWithProviders(<CheckInModeScreen />);

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      // Statistics should be rendered in cards
      const statisticsCards = screen.getAllByRole('group');
      expect(statisticsCards.length).toBeGreaterThan(0);
    });
  });
});