import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckInErrorModal } from './CheckInErrorModal';

const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('CheckInErrorModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render when open', () => {
    renderWithChakra(
      <CheckInErrorModal
        isOpen={true}
        onClose={mockOnClose}
        error="Invalid QR code"
        errorCode="INVALID_QR_CODE"
      />
    );

    expect(screen.getByText('Invalid QR Code')).toBeInTheDocument();
    expect(screen.getByText('Invalid QR code')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const { container } = renderWithChakra(
      <CheckInErrorModal
        isOpen={false}
        onClose={mockOnClose}
        error="Invalid QR code"
        errorCode="INVALID_QR_CODE"
      />
    );

    expect(container.querySelector('.chakra-modal__content')).not.toBeInTheDocument();
  });

  describe('error code specific rendering', () => {
    it('should render correct content for ALREADY_CHECKED_IN', () => {
      renderWithChakra(
        <CheckInErrorModal
          isOpen={true}
          onClose={mockOnClose}
          error="This ticket has already been checked in"
          errorCode="ALREADY_CHECKED_IN"
        />
      );

      expect(screen.getByText('Already Checked In')).toBeInTheDocument();
      expect(screen.getByText('This ticket has already been checked in')).toBeInTheDocument();
      expect(screen.getByText(/This ticket has already been scanned/)).toBeInTheDocument();
    });

    it('should render correct content for TICKET_NOT_FOUND', () => {
      renderWithChakra(
        <CheckInErrorModal
          isOpen={true}
          onClose={mockOnClose}
          error="Ticket not found"
          errorCode="TICKET_NOT_FOUND"
        />
      );

      expect(screen.getByText('Ticket Not Found')).toBeInTheDocument();
      expect(screen.getByText('Ticket not found')).toBeInTheDocument();
      expect(screen.getByText(/This QR code is not associated/)).toBeInTheDocument();
    });

    it('should render correct content for INVALID_QR_CODE', () => {
      renderWithChakra(
        <CheckInErrorModal
          isOpen={true}
          onClose={mockOnClose}
          error="Invalid QR code format"
          errorCode="INVALID_QR_CODE"
        />
      );

      expect(screen.getByText('Invalid QR Code')).toBeInTheDocument();
      expect(screen.getByText('Invalid QR code format')).toBeInTheDocument();
      expect(screen.getByText(/The scanned QR code is malformed/)).toBeInTheDocument();
    });

    it('should render default content when no error code provided', () => {
      renderWithChakra(
        <CheckInErrorModal
          isOpen={true}
          onClose={mockOnClose}
          error="Something went wrong"
        />
      );

      expect(screen.getByText('Invalid QR Code')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  it('should display scan time', () => {
    renderWithChakra(
      <CheckInErrorModal
        isOpen={true}
        onClose={mockOnClose}
        error="Invalid QR code"
        errorCode="INVALID_QR_CODE"
      />
    );

    expect(screen.getByText(/Scan time:/)).toBeInTheDocument();
  });

  it('should call onClose when Try Another Code button is clicked', () => {
    renderWithChakra(
      <CheckInErrorModal
        isOpen={true}
        onClose={mockOnClose}
        error="Invalid QR code"
        errorCode="INVALID_QR_CODE"
      />
    );

    const button = screen.getByText('Try Another Code');
    fireEvent.click(button);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should have correct styling for error states', () => {
    renderWithChakra(
      <CheckInErrorModal
        isOpen={true}
        onClose={mockOnClose}
        error="Invalid QR code"
        errorCode="INVALID_QR_CODE"
      />
    );

    const button = screen.getByText('Try Another Code');
    expect(button).toHaveClass('chakra-button');
    expect(button).toHaveAttribute('data-colorscheme', 'red');
  });

  it('should have correct styling for warning state (ALREADY_CHECKED_IN)', () => {
    renderWithChakra(
      <CheckInErrorModal
        isOpen={true}
        onClose={mockOnClose}
        error="Already checked in"
        errorCode="ALREADY_CHECKED_IN"
      />
    );

    const button = screen.getByText('Try Another Code');
    expect(button).toHaveAttribute('data-colorscheme', 'warning');
  });

  it('should be accessible with proper ARIA attributes', () => {
    renderWithChakra(
      <CheckInErrorModal
        isOpen={true}
        onClose={mockOnClose}
        error="Invalid QR code"
        errorCode="INVALID_QR_CODE"
      />
    );

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });
});