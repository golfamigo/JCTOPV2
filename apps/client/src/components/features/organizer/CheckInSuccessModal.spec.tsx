import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckInSuccessModal } from './CheckInSuccessModal';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('CheckInSuccessModal', () => {
  const mockOnClose = jest.fn();
  const mockAttendee = {
    name: 'John Doe',
    email: 'john@example.com',
    ticketType: 'VIP Pass',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    renderWithChakra(
      <CheckInSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        attendee={mockAttendee}
      />
    );

    expect(screen.getByText('Check-in Successful!')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('VIP Pass')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const { container } = renderWithChakra(
      <CheckInSuccessModal
        isOpen={false}
        onClose={mockOnClose}
        attendee={mockAttendee}
      />
    );

    expect(container.querySelector('.chakra-modal__content')).not.toBeInTheDocument();
  });

  it('should display attendee information correctly', () => {
    renderWithChakra(
      <CheckInSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        attendee={mockAttendee}
      />
    );

    expect(screen.getByText('ATTENDEE NAME')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('EMAIL')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('TICKET TYPE')).toBeInTheDocument();
    expect(screen.getByText('VIP Pass')).toBeInTheDocument();
  });

  it('should display check-in time', () => {
    renderWithChakra(
      <CheckInSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        attendee={mockAttendee}
      />
    );

    expect(screen.getByText(/Check-in time:/)).toBeInTheDocument();
  });

  it('should call onClose when Continue Scanning button is clicked', () => {
    renderWithChakra(
      <CheckInSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        attendee={mockAttendee}
      />
    );

    const continueButton = screen.getByText('Continue Scanning');
    fireEvent.click(continueButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have correct styling for success state', () => {
    renderWithChakra(
      <CheckInSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        attendee={mockAttendee}
      />
    );

    const successButton = screen.getByText('Continue Scanning');
    expect(successButton).toHaveClass('chakra-button');
    expect(successButton).toHaveAttribute('data-colorscheme', 'success');
  });

  it('should be accessible with proper ARIA attributes', () => {
    renderWithChakra(
      <CheckInSuccessModal
        isOpen={true}
        onClose={mockOnClose}
        attendee={mockAttendee}
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });
});