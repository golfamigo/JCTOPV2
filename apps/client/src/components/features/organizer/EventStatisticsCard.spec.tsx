import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { EventStatisticsCard } from './EventStatisticsCard';
import { Event } from '@jctop-event/shared-types';
import statisticsService from '../../../services/statisticsService';

// Mock the statistics service
jest.mock('../../../services/statisticsService');
const mockStatisticsService = statisticsService as jest.Mocked<typeof statisticsService>;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock theme
const MockTheme = () => ({
  colors: {
    primary: { 500: '#2563EB', 600: '#1D4ED8' },
    success: { 600: '#059669' },
    warning: { 600: '#D97706' },
    error: { 600: '#DC2626' },
    neutral: { 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 800: '#1F2937' },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={MockTheme() as any}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('EventStatisticsCard', () => {
  const mockEvent: Event = {
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

  const mockStatistics = {
    eventId: 'test-event-id',
    totalRegistrations: 100,
    checkedInCount: 75,
    attendanceRate: 75.0,
    lastUpdated: '2024-01-01T12:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReset();
  });

  describe('loading state', () => {
    it('should show loading spinner initially', async () => {
      mockStatisticsService.getEventStatistics.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('successful statistics loading', () => {
    beforeEach(() => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: true,
        data: mockStatistics,
      });
      mockStatisticsService.refreshEventStatistics.mockResolvedValue({
        success: true,
        data: mockStatistics,
      });
    });

    it('should display event information and statistics', async () => {
      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeInTheDocument();
      });

      expect(screen.getByText('published')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument(); // Total
      expect(screen.getByText('75')).toBeInTheDocument(); // Checked In
      expect(screen.getByText('75.0%')).toBeInTheDocument(); // Rate
    });

    it('should display progress bar with correct value', async () => {
      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('should show correct attendance status text', async () => {
      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('Excellent')).toBeInTheDocument();
      });
    });

    it('should format event date correctly', async () => {
      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('6/1/2024')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should display error message when statistics loading fails', async () => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: false,
        error: 'Failed to load statistics',
      });

      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('refresh functionality', () => {
    beforeEach(() => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: true,
        data: mockStatistics,
      });
    });

    it('should call refresh when refresh button is clicked', async () => {
      mockStatisticsService.refreshEventStatistics.mockResolvedValue({
        success: true,
        data: { ...mockStatistics, checkedInCount: 80, attendanceRate: 80.0 },
      });

      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('75')).toBeInTheDocument();
      });

      const refreshButton = screen.getByLabelText('Refresh statistics');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockStatisticsService.refreshEventStatistics).toHaveBeenCalledWith('test-event-id');
      });
    });

    it('should show loading state on refresh button when refreshing', async () => {
      mockStatisticsService.refreshEventStatistics.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('75')).toBeInTheDocument();
      });

      const refreshButton = screen.getByLabelText('Refresh statistics');
      fireEvent.click(refreshButton);

      expect(refreshButton).toHaveAttribute('data-loading', 'true');
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: true,
        data: mockStatistics,
      });
    });

    it('should navigate to check-in page when check-in button is clicked', async () => {
      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('Check-in')).toBeInTheDocument();
      });

      const checkInButton = screen.getByText('Check-in');
      fireEvent.click(checkInButton);

      expect(mockNavigate).toHaveBeenCalledWith('/organizer/events/test-event-id/checkin');
    });

    it('should navigate to attendees page when attendees button is clicked', async () => {
      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('Attendees')).toBeInTheDocument();
      });

      const attendeesButton = screen.getByText('Attendees');
      fireEvent.click(attendeesButton);

      expect(mockNavigate).toHaveBeenCalledWith('/organizer/events/test-event-id/attendees');
    });
  });

  describe('attendance rate colors and labels', () => {
    it('should show "Excellent" for high attendance rate (≥70%)', async () => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: true,
        data: { ...mockStatistics, attendanceRate: 85.0 },
      });

      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('Excellent')).toBeInTheDocument();
      });
    });

    it('should show "Good" for medium attendance rate (40-70%)', async () => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: true,
        data: { ...mockStatistics, attendanceRate: 55.0 },
      });

      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('Good')).toBeInTheDocument();
      });
    });

    it('should show "Needs Attention" for low attendance rate (<40%)', async () => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: true,
        data: { ...mockStatistics, attendanceRate: 25.0 },
      });

      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('Needs Attention')).toBeInTheDocument();
      });
    });
  });

  describe('event status badge', () => {
    it('should show green badge for published events', async () => {
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: true,
        data: mockStatistics,
      });

      renderWithProviders(<EventStatisticsCard event={mockEvent} />);

      await waitFor(() => {
        expect(screen.getByText('published')).toBeInTheDocument();
      });
    });

    it('should show gray badge for draft events', async () => {
      const draftEvent = { ...mockEvent, status: 'draft' as const };
      mockStatisticsService.getEventStatistics.mockResolvedValue({
        success: true,
        data: mockStatistics,
      });

      renderWithProviders(<EventStatisticsCard event={draftEvent} />);

      await waitFor(() => {
        expect(screen.getByText('draft')).toBeInTheDocument();
      });
    });
  });
});