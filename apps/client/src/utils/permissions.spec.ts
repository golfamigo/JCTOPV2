import { Camera } from 'expo-camera';
import {
  requestCameraPermissions,
  getCameraPermissionStatus,
  ensureCameraPermissions,
  getCameraPermissionErrorMessage,
} from './permissions';

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
    getCameraPermissionsAsync: jest.fn(),
  },
}));

const mockCamera = Camera as jest.Mocked<typeof Camera>;

describe('Camera Permissions Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestCameraPermissions', () => {
    it('should return granted permissions', async () => {
      mockCamera.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

      const result = await requestCameraPermissions();

      expect(result.granted).toBe(true);
      expect(result.canAskAgain).toBe(true);
      expect(result.status).toBe('granted');
    });

    it('should return denied permissions', async () => {
      mockCamera.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        granted: false,
        expires: 'never',
      });

      const result = await requestCameraPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
      expect(result.status).toBe('denied');
    });

    it('should handle request errors gracefully', async () => {
      mockCamera.requestCameraPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      const result = await requestCameraPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
      expect(result.status).toBe('denied');
    });
  });

  describe('getCameraPermissionStatus', () => {
    it('should return current permission status', async () => {
      mockCamera.getCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

      const result = await getCameraPermissionStatus();

      expect(result.granted).toBe(true);
      expect(result.canAskAgain).toBe(true);
      expect(result.status).toBe('granted');
    });

    it('should handle status check errors gracefully', async () => {
      mockCamera.getCameraPermissionsAsync.mockRejectedValue(new Error('Status error'));

      const result = await getCameraPermissionStatus();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
      expect(result.status).toBe('denied');
    });
  });

  describe('ensureCameraPermissions', () => {
    it('should return existing granted permissions without requesting', async () => {
      mockCamera.getCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

      const result = await ensureCameraPermissions();

      expect(result.granted).toBe(true);
      expect(mockCamera.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permissions when not granted but can ask again', async () => {
      mockCamera.getCameraPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        canAskAgain: true,
        granted: false,
        expires: 'never',
      });

      mockCamera.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        canAskAgain: true,
        granted: true,
        expires: 'never',
      });

      const result = await ensureCameraPermissions();

      expect(result.granted).toBe(true);
      expect(mockCamera.requestCameraPermissionsAsync).toHaveBeenCalled();
    });

    it('should not request permissions when cannot ask again', async () => {
      mockCamera.getCameraPermissionsAsync.mockResolvedValue({
        status: 'denied',
        canAskAgain: false,
        granted: false,
        expires: 'never',
      });

      const result = await ensureCameraPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
      expect(mockCamera.requestCameraPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockCamera.getCameraPermissionsAsync.mockRejectedValue(new Error('Permission error'));

      const result = await ensureCameraPermissions();

      expect(result.granted).toBe(false);
      expect(result.canAskAgain).toBe(false);
      expect(result.status).toBe('denied');
    });
  });

  describe('getCameraPermissionErrorMessage', () => {
    it('should return empty string for granted permissions', () => {
      const status = {
        granted: true,
        canAskAgain: true,
        status: 'granted' as const,
      };

      const message = getCameraPermissionErrorMessage(status);

      expect(message).toBe('');
    });

    it('should return permanent denial message when cannot ask again', () => {
      const status = {
        granted: false,
        canAskAgain: false,
        status: 'denied' as const,
      };

      const message = getCameraPermissionErrorMessage(status);

      expect(message).toContain('permanently denied');
      expect(message).toContain('device settings');
    });

    it('should return request message when can ask again', () => {
      const status = {
        granted: false,
        canAskAgain: true,
        status: 'undetermined' as const,
      };

      const message = getCameraPermissionErrorMessage(status);

      expect(message).toContain('allow camera access');
      expect(message).toContain('when prompted');
    });
  });
});