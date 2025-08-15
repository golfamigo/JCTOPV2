import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CameraScanner } from './CameraScanner';
import { CameraService } from '../../../services/cameraService';
import theme from '@/theme';

// Mock expo-camera
const mockCamera = {
  current: null,
};

jest.mock('expo-camera', () => {
  const MockedReact = require('react');
  return {
    Camera: MockedReact.forwardRef((props: any, ref: any) => {
      MockedReact.useImperativeHandle(ref, () => mockCamera.current);
      return MockedReact.createElement('div', { 'data-testid': 'camera-view', ...props });
    }),
    CameraType: {
      back: 'back',
      front: 'front',
    },
  };
});

// Mock camera service
jest.mock('../../../services/cameraService', () => ({
  CameraService: {
    getInstance: jest.fn(),
  },
}));

const mockCameraService = {
  initialize: jest.fn(),
  setCameraRef: jest.fn(),
  reset: jest.fn(),
  switchCameraType: jest.fn(),
  toggleFlashMode: jest.fn(),
  validateQRCodeData: jest.fn(),
  processScannedQR: jest.fn(),
};

const MockedCameraService = CameraService as jest.Mocked<typeof CameraService>;
MockedCameraService.getInstance.mockReturnValue(mockCameraService as any);

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ChakraProvider theme={theme}>
      {component}
    </ChakraProvider>
  );
};

describe('CameraScanner', () => {
  const mockOnQRCodeScanned = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockCameraService.initialize.mockResolvedValue({ success: true, data: { granted: true } });
    mockCameraService.switchCameraType.mockReturnValue('front');
    mockCameraService.toggleFlashMode.mockReturnValue('on');
  });

  const defaultProps = {
    onQRCodeScanned: mockOnQRCodeScanned,
    onError: mockOnError,
    isScanning: false,
  };

  it('should render loading state initially', () => {
    renderWithTheme(<CameraScanner {...defaultProps} />);
    
    expect(screen.getByText('Initializing camera...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner
  });

  it('should render camera view after successful initialization', async () => {
    renderWithTheme(<CameraScanner {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Toggle flash')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch camera')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
  });

  it('should show error state when camera initialization fails', async () => {
    mockCameraService.initialize.mockResolvedValue({
      success: false,
      error: 'Camera permission denied',
      data: { granted: false, canAskAgain: false, status: 'denied' },
    });

    renderWithTheme(<CameraScanner {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Camera access has been permanently denied/)).toBeInTheDocument();
    });

    expect(mockOnError).toHaveBeenCalledWith(
      expect.stringContaining('permanently denied')
    );
  });

  it('should show scanning status when isScanning is true', async () => {
    renderWithTheme(<CameraScanner {...defaultProps} isScanning={true} />);

    await waitFor(() => {
      expect(screen.getByText('Scanning...')).toBeInTheDocument();
    });
  });

  it('should handle camera type switching', async () => {
    renderWithTheme(<CameraScanner {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });

    const switchButton = screen.getByLabelText('Switch camera');
    fireEvent.click(switchButton);

    expect(mockCameraService.switchCameraType).toHaveBeenCalledWith('back');
  });

  it('should handle flash mode toggling', async () => {
    renderWithTheme(<CameraScanner {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });

    const flashButton = screen.getByLabelText('Toggle flash');
    fireEvent.click(flashButton);

    expect(mockCameraService.toggleFlashMode).toHaveBeenCalledWith('auto');
  });

  it('should handle QR code scanning', async () => {
    renderWithTheme(<CameraScanner {...defaultProps} isScanning={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });

    // Simulate camera ready
    const cameraView = screen.getByTestId('camera-view');
    fireEvent(cameraView, new CustomEvent('cameraReady'));

    // Simulate QR code scan
    const qrData = 'test-qr-data';
    fireEvent(cameraView, new CustomEvent('barCodeScanned', {
      detail: { data: qrData },
    }));

    expect(mockOnQRCodeScanned).toHaveBeenCalledWith(qrData);
  });

  it('should prevent duplicate scans during cooldown', async () => {
    renderWithTheme(<CameraScanner {...defaultProps} isScanning={true} />);

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });

    const cameraView = screen.getByTestId('camera-view');
    fireEvent(cameraView, new CustomEvent('cameraReady'));

    const qrData = 'test-qr-data';
    
    // First scan
    fireEvent(cameraView, new CustomEvent('barCodeScanned', {
      detail: { data: qrData },
    }));

    // Second scan with same data (should be ignored)
    fireEvent(cameraView, new CustomEvent('barCodeScanned', {
      detail: { data: qrData },
    }));

    expect(mockOnQRCodeScanned).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should not scan when isScanning is false', async () => {
    renderWithTheme(<CameraScanner {...defaultProps} isScanning={false} />);

    await waitFor(() => {
      expect(screen.getByTestId('camera-view')).toBeInTheDocument();
    });

    const cameraView = screen.getByTestId('camera-view');
    fireEvent(cameraView, new CustomEvent('cameraReady'));
    fireEvent(cameraView, new CustomEvent('barCodeScanned', {
      detail: { data: 'test-data' },
    }));

    expect(mockOnQRCodeScanned).not.toHaveBeenCalled();
  });

  it('should apply scanning border when active', async () => {
    renderWithTheme(<CameraScanner {...defaultProps} isScanning={true} />);

    await waitFor(() => {
      const container = screen.getByTestId('camera-view').parentElement;
      expect(container).toHaveStyle('border-color: var(--chakra-colors-success-400)');
    });
  });

  it('should handle custom dimensions', () => {
    renderWithTheme(
      <CameraScanner {...defaultProps} width={300} height={250} />
    );

    const container = screen.getByTestId('camera-view').parentElement;
    expect(container).toHaveStyle('width: 300px');
    expect(container).toHaveStyle('height: 250px');
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderWithTheme(<CameraScanner {...defaultProps} />);
    
    unmount();
    
    expect(mockCameraService.reset).toHaveBeenCalled();
  });
});