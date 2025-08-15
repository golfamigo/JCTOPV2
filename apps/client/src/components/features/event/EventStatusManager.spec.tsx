import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventStatusManager from './EventStatusManager';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('EventStatusManager', () => {
  const mockOnStatusChange = jest.fn();

  beforeEach(() => {
    mockOnStatusChange.mockClear();
  });

  it('displays current status correctly', () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="draft"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Current Status')).toBeInTheDocument();
  });

  it('shows available status transitions for draft status', () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="draft"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.queryByText('Paused')).not.toBeInTheDocument();
    expect(screen.queryByText('Ended')).not.toBeInTheDocument();
  });

  it('shows multiple status transitions for published status', () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="published"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('Unpublished')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('shows no transitions for ended status', () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="ended"
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('No further status changes available')).toBeInTheDocument();
    expect(screen.queryByText('Change Status')).not.toBeInTheDocument();
  });

  it('opens confirmation dialog when status button is clicked', async () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="draft"
        onStatusChange={mockOnStatusChange}
      />
    );

    const publishButton = screen.getByText('Published');
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Status Change')).toBeInTheDocument();
    });
  });

  it('calls onStatusChange when confirmed', async () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="draft"
        onStatusChange={mockOnStatusChange}
      />
    );

    const publishButton = screen.getByText('Published');
    fireEvent.click(publishButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Status Change')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Change');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalledWith('published');
    });
  });

  it('allows adding a reason for status change', async () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="published"
        onStatusChange={mockOnStatusChange}
      />
    );

    const pauseButton = screen.getByText('Paused');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText('Confirm Status Change')).toBeInTheDocument();
    });

    const reasonTextarea = screen.getByPlaceholderText('Enter reason for status change...');
    fireEvent.change(reasonTextarea, { target: { value: 'Technical maintenance' } });

    expect(reasonTextarea).toHaveValue('Technical maintenance');
  });

  it('displays correct status descriptions in confirmation dialog', async () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="published"
        onStatusChange={mockOnStatusChange}
      />
    );

    const pauseButton = screen.getByText('Paused');
    fireEvent.click(pauseButton);

    await waitFor(() => {
      expect(screen.getByText('Event is visible but registration is closed')).toBeInTheDocument();
    });
  });

  it('shows loading state when isLoading is true', () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="draft"
        onStatusChange={mockOnStatusChange}
        isLoading={true}
      />
    );

    const publishButton = screen.getByText('Published');
    expect(publishButton).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    renderWithChakra(
      <EventStatusManager
        eventId="test-event-id"
        currentStatus="draft"
        onStatusChange={mockOnStatusChange}
      />
    );

    const publishButton = screen.getByText('Published');
    expect(publishButton).toHaveAttribute('aria-label', 'Change status to Published');
  });
});