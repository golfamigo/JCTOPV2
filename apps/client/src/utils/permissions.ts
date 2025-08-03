import { Camera } from 'expo-camera';

export interface CameraPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface CameraPermissionError {
  code: 'PERMISSION_DENIED' | 'CAMERA_UNAVAILABLE' | 'UNKNOWN_ERROR';
  message: string;
}

/**
 * Request camera permissions for QR code scanning
 * @returns Promise<CameraPermissionResult> - Permission status result
 */
export const requestCameraPermissions = async (): Promise<CameraPermissionResult> => {
  try {
    const { status, canAskAgain } = await Camera.requestCameraPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as 'granted' | 'denied' | 'undetermined'
    };
  } catch (error) {
    console.error('Error requesting camera permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied'
    };
  }
};

/**
 * Check current camera permission status without requesting
 * @returns Promise<CameraPermissionResult> - Current permission status
 */
export const getCameraPermissionStatus = async (): Promise<CameraPermissionResult> => {
  try {
    const { status, canAskAgain } = await Camera.getCameraPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain,
      status: status as 'granted' | 'denied' | 'undetermined'
    };
  } catch (error) {
    console.error('Error getting camera permission status:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied'
    };
  }
};

/**
 * Ensure camera permissions are granted, requesting if necessary
 * @returns Promise<CameraPermissionResult> - Final permission status
 */
export const ensureCameraPermissions = async (): Promise<CameraPermissionResult> => {
  try {
    const currentStatus = await getCameraPermissionStatus();
    
    if (currentStatus.granted) {
      return currentStatus;
    }
    
    if (!currentStatus.canAskAgain) {
      return currentStatus;
    }
    
    return await requestCameraPermissions();
  } catch (error) {
    console.error('Error ensuring camera permissions:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: 'denied'
    };
  }
};

/**
 * Get user-friendly error message for camera permission issues
 * @param status - Permission status
 * @returns string - User-friendly error message
 */
export const getCameraPermissionErrorMessage = (status: CameraPermissionResult): string => {
  if (status.granted) {
    return '';
  }
  
  if (!status.canAskAgain) {
    return 'Camera access has been permanently denied. Please enable camera permissions in your device settings to use check-in mode.';
  }
  
  return 'Camera access is required to scan QR codes for event check-in. Please allow camera access when prompted.';
};