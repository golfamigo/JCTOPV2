import { Camera } from 'expo-camera';
import * as ExpoCamera from 'expo-camera';
import { ensureCameraPermissions, CameraPermissionResult } from '../utils/permissions';

export interface CameraServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CameraConfiguration {
  type: 'back' | 'front';
  autoFocus: boolean;
  flashMode: 'on' | 'off' | 'auto';
}

export class CameraService {
  private static instance: CameraService;
  private cameraRef: React.RefObject<any> | null = null;
  private isInitialized = false;

  static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Initialize camera service with permissions check
   */
  async initialize(): Promise<CameraServiceResult<CameraPermissionResult>> {
    try {
      const permissionResult = await ensureCameraPermissions();
      
      if (!permissionResult.granted) {
        return {
          success: false,
          error: 'Camera permissions are required for check-in mode',
          data: permissionResult
        };
      }

      this.isInitialized = true;
      return {
        success: true,
        data: permissionResult
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to initialize camera: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Set camera reference for operations
   */
  setCameraRef(ref: React.RefObject<any>): void {
    this.cameraRef = ref;
  }

  /**
   * Check if camera service is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.cameraRef?.current !== null;
  }

  /**
   * Get default camera configuration
   */
  getDefaultConfiguration(): CameraConfiguration {
    return {
      type: 'back',
      autoFocus: true,
      flashMode: 'auto'
    };
  }

  /**
   * Switch between front and back camera
   */
  switchCameraType(currentType: 'back' | 'front'): 'back' | 'front' {
    return currentType === 'back' ? 'front' : 'back';
  }

  /**
   * Toggle flash mode
   */
  toggleFlashMode(currentMode: 'on' | 'off' | 'auto'): 'on' | 'off' | 'auto' {
    switch (currentMode) {
      case 'off':
        return 'auto';
      case 'auto':
        return 'on';
      case 'on':
      default:
        return 'off';
    }
  }

  /**
   * Validate QR code data format
   */
  validateQRCodeData(data: string): CameraServiceResult<any> {
    // Basic string validation
    if (!data || typeof data !== 'string' || data.trim().length === 0) {
      return {
        success: false,
        error: 'Invalid QR code: Empty or invalid data'
      };
    }

    try {
      const parsedData = JSON.parse(data);
      
      // Validate required structure
      if (!parsedData || typeof parsedData !== 'object') {
        return {
          success: false,
          error: 'Invalid QR code: Invalid data structure'
        };
      }

      if (parsedData.type !== 'registration') {
        return {
          success: false,
          error: 'Invalid QR code: Not a registration ticket'
        };
      }

      if (!parsedData.data || !parsedData.timestamp) {
        return {
          success: false,
          error: 'Invalid QR code: Missing required data'
        };
      }

      // Validate timestamp (not too old)
      const qrTimestamp = new Date(parsedData.timestamp);
      const now = new Date();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (isNaN(qrTimestamp.getTime()) || (now.getTime() - qrTimestamp.getTime()) > maxAge) {
        return {
          success: false,
          error: 'Invalid QR code: Expired or invalid timestamp'
        };
      }

      return {
        success: true,
        data: parsedData
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid QR code: Malformed JSON data'
      };
    }
  }

  /**
   * Process scanned QR code
   */
  async processScannedQR(data: string): Promise<CameraServiceResult<any>> {
    const validationResult = this.validateQRCodeData(data);
    
    if (!validationResult.success) {
      return validationResult;
    }

    try {
      // Additional processing can be added here
      return {
        success: true,
        data: validationResult.data
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Reset camera service state
   */
  reset(): void {
    this.cameraRef = null;
    this.isInitialized = false;
  }
}