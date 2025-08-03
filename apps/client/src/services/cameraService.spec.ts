import { CameraService } from './cameraService';
import { ensureCameraPermissions } from '../utils/permissions';
import { CameraType } from 'expo-camera';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  CameraType: {
    back: 'back',
    front: 'front',
  },
}));

// Mock permissions utility
jest.mock('../utils/permissions', () => ({
  ensureCameraPermissions: jest.fn(),
}));

const mockEnsureCameraPermissions = ensureCameraPermissions as jest.MockedFunction<typeof ensureCameraPermissions>;

describe('CameraService', () => {
  let cameraService: CameraService;

  beforeEach(() => {
    cameraService = CameraService.getInstance();
    cameraService.reset();
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CameraService.getInstance();
      const instance2 = CameraService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully with granted permissions', async () => {
      mockEnsureCameraPermissions.mockResolvedValue({
        granted: true,
        canAskAgain: true,
        status: 'granted',
      });

      const result = await cameraService.initialize();

      expect(result.success).toBe(true);
      expect(result.data?.granted).toBe(true);
      expect(cameraService.isReady()).toBe(false); // Camera ref not set yet
    });

    it('should fail initialization with denied permissions', async () => {
      mockEnsureCameraPermissions.mockResolvedValue({
        granted: false,
        canAskAgain: false,
        status: 'denied',
      });

      const result = await cameraService.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Camera permissions are required');
      expect(result.data?.granted).toBe(false);
    });

    it('should handle initialization errors', async () => {
      mockEnsureCameraPermissions.mockRejectedValue(new Error('Permission error'));

      const result = await cameraService.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to initialize camera');
    });
  });

  describe('Camera Configuration', () => {
    it('should return default configuration', () => {
      const config = cameraService.getDefaultConfiguration();

      expect(config).toEqual({
        type: CameraType.back,
        autoFocus: true,
        flashMode: 'auto',
      });
    });

    it('should switch camera type correctly', () => {
      expect(cameraService.switchCameraType(CameraType.back)).toBe(CameraType.front);
      expect(cameraService.switchCameraType(CameraType.front)).toBe(CameraType.back);
    });

    it('should toggle flash mode correctly', () => {
      expect(cameraService.toggleFlashMode('off')).toBe('auto');
      expect(cameraService.toggleFlashMode('auto')).toBe('on');
      expect(cameraService.toggleFlashMode('on')).toBe('off');
    });
  });

  describe('QR Code Validation', () => {
    it('should validate correct QR code format', () => {
      const validQRData = JSON.stringify({
        type: 'registration',
        data: { registrationId: '123', eventId: '456' },
        timestamp: Date.now(),
      });

      const result = cameraService.validateQRCodeData(validQRData);

      expect(result.success).toBe(true);
      expect(result.data.type).toBe('registration');
    });

    it('should reject invalid QR code type', () => {
      const invalidQRData = JSON.stringify({
        type: 'invalid',
        data: { registrationId: '123' },
        timestamp: Date.now(),
      });

      const result = cameraService.validateQRCodeData(invalidQRData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not a registration ticket');
    });

    it('should reject QR code with missing data', () => {
      const invalidQRData = JSON.stringify({
        type: 'registration',
        timestamp: Date.now(),
      });

      const result = cameraService.validateQRCodeData(invalidQRData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required data');
    });

    it('should reject malformed JSON', () => {
      const invalidQRData = 'invalid json';

      const result = cameraService.validateQRCodeData(invalidQRData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid QR code format');
    });
  });

  describe('QR Code Processing', () => {
    it('should process valid QR code successfully', async () => {
      const validQRData = JSON.stringify({
        type: 'registration',
        data: { registrationId: '123', eventId: '456' },
        timestamp: Date.now(),
      });

      const result = await cameraService.processScannedQR(validQRData);

      expect(result.success).toBe(true);
      expect(result.data.type).toBe('registration');
    });

    it('should fail processing invalid QR code', async () => {
      const invalidQRData = 'invalid json';

      const result = await cameraService.processScannedQR(invalidQRData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid QR code format');
    });
  });

  describe('Camera Reference Management', () => {
    it('should set camera reference', () => {
      const mockRef = { current: {} } as any;
      cameraService.setCameraRef(mockRef);

      // Can't directly test the ref, but we can test that isReady changes
      // when the service is initialized and ref is set
      expect(cameraService.isReady()).toBe(false); // Not initialized yet
    });

    it('should reset service state', () => {
      cameraService.reset();
      expect(cameraService.isReady()).toBe(false);
    });
  });
});