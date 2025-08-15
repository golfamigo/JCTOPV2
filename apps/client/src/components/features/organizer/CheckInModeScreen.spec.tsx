import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NavigationContainer } from '@react-navigation/native';
import { CheckInModeScreen } from './CheckInModeScreen';
import eventService from '../../../services/eventService';
import { CheckInService } from '../../../services/checkinService';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: () => ({ params: { eventId: 'test-event-id' } }),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

jest.mock('../../../services/eventService');
jest.mock('../../../services/checkinService');
jest.mock('../../../services/cameraService');

const mockEvent = {
  id: 'test-event-id',
  title: 'Test Event',
  description: 'Test Description',
  startDate: new Date(),
  endDate: new Date(),
  location: 'Test Location',
  organizerId: 'org-id',
  status: 'published' as const,
};

const renderComponent = () => {
  return render(
    <NavigationContainer>
      <CheckInModeScreen />
    </NavigationContainer>
  );
};

describe('CheckInModeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (eventService.getEventById as jest.Mock).mockResolvedValue(mockEvent);
  });

  it('renders the check-in mode screen with tabs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Check-in Mode: Test Event')).toBeInTheDocument();
    });

    expect(screen.getByText('QR Scanner')).toBeInTheDocument();
    expect(screen.getByText('Manual Search')).toBeInTheDocument();
  });

  it('switches between QR scanner and manual search tabs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Check-in Mode: Test Event')).toBeInTheDocument();
    });

    // QR Scanner tab should be active by default
    expect(screen.getByText('QR Code Scanner')).toBeInTheDocument();

    // Click on Manual Search tab
    const manualSearchTab = screen.getByText('Manual Search');
    fireEvent.click(manualSearchTab);

    // Manual search form should be visible
    expect(screen.getByText('Manual Attendee Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter name or registration number')).toBeInTheDocument();
  });

  it('performs manual search when search form is submitted', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Check-in Mode: Test Event')).toBeInTheDocument();
    });

    // Switch to manual search tab
    const manualSearchTab = screen.getByText('Manual Search');
    fireEvent.click(manualSearchTab);

    // Enter search query
    const searchInput = screen.getByPlaceholderText('Enter name or registration number');
    fireEvent.change(searchInput, { target: { value: 'John Doe' } });

    // Submit search
    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    // Wait for mock results to appear
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('shows search results with appropriate status badges', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Check-in Mode: Test Event')).toBeInTheDocument();
    });

    // Switch to manual search and perform search
    const manualSearchTab = screen.getByText('Manual Search');
    fireEvent.click(manualSearchTab);

    const searchInput = screen.getByPlaceholderText('Enter name or registration number');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      // Check for different status badges
      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('Checked In')).toBeInTheDocument();
    });
  });

  it('allows manual check-in for eligible attendees', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Check-in Mode: Test Event')).toBeInTheDocument();
    });

    // Switch to manual search and perform search
    const manualSearchTab = screen.getByText('Manual Search');
    fireEvent.click(manualSearchTab);

    const searchInput = screen.getByPlaceholderText('Enter name or registration number');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click check-in button
    const checkInButton = screen.getAllByRole('button', { name: /check in/i })[0];
    fireEvent.click(checkInButton);

    // Success modal should appear (mocked)
    await waitFor(() => {
      expect(screen.getByText('Recent Check-ins')).toBeInTheDocument();
    });
  });

  it('clears search results when clear button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Check-in Mode: Test Event')).toBeInTheDocument();
    });

    // Switch to manual search and perform search
    const manualSearchTab = screen.getByText('Manual Search');
    fireEvent.click(manualSearchTab);

    const searchInput = screen.getByPlaceholderText('Enter name or registration number');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const searchButton = screen.getByRole('button', { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Clear search
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    // Search input should be cleared
    expect(searchInput).toHaveValue('');
  });

  it('displays check-in statistics correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Check-in Mode: Test Event')).toBeInTheDocument();
    });

    // Check statistics are displayed
    expect(screen.getByText('Total Registrations')).toBeInTheDocument();
    expect(screen.getByText('Checked In')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});