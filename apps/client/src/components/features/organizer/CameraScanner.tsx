import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Icon,
  Badge,
} from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { CameraService } from '../../../services/cameraService';
import { getCameraPermissionErrorMessage } from '../../../utils/permissions';
import { useAppTheme } from '@/theme';

interface CameraScannerProps {
  onQRCodeScanned: (data: string) => void;
  onError?: (error: string) => void;
  isScanning: boolean;
  width?: string | number;
  height?: string | number;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  onQRCodeScanned,
  onError,
  isScanning,
  width = '100%',
  height = 400,
}) => {
  const cameraRef = useRef<any>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('auto');
  const [permissionError, setPermissionError] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [scanCooldown, setScanCooldown] = useState(false);
  
  const [permission, requestPermission] = useCameraPermissions();
  const cameraService = CameraService.getInstance();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (isScanning || scanCooldown || data === lastScanned) {
      return;
    }

    setScanCooldown(true);
    setLastScanned(data);
    onQRCodeScanned(data);

    // Reset cooldown after 2 seconds
    setTimeout(() => {
      setScanCooldown(false);
      setLastScanned('');
    }, 2000);
  };

  const toggleCameraType = () => {
    setCameraType(current => current === 'back' ? 'front' : 'back');
  };

  const toggleFlashMode = () => {
    setFlashMode(current => {
      switch (current) {
        case 'off':
          return 'on';
        case 'on':
          return 'auto';
        case 'auto':
        default:
          return 'off';
      }
    });
  };

  const getFlashIcon = () => {
    switch (flashMode) {
      case 'on':
        return 'flash-on';
      case 'off':
        return 'flash-off';
      case 'auto':
      default:
        return 'flash-auto';
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, { height }] as any}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { height }] as any}>
        <View style={styles.errorContainer}>
          <Icon
            name="camera-off"
            type="material"
            color={colors.error}
            size={48}
          />
          <Text style={styles.errorTitle}>Camera Access Required</Text>
          <Text style={styles.errorMessage}>
            {permissionError || 'Camera permission was denied'}
          </Text>
          <Button
            title="Grant Permission"
            onPress={requestPermission}
            buttonStyle={[styles.permissionButton, { backgroundColor: colors.primary }]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: height as any }]}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={cameraType}
        flash={flashMode}
        onCameraReady={() => setCameraReady(true)}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <View style={styles.controlsRow}>
              <Button
                icon={
                  <Icon
                    name={getFlashIcon()}
                    type="material"
                    color={colors.white}
                    size={24}
                  />
                }
                onPress={toggleFlashMode}
                type="clear"
              />
              <Badge
                value={isScanning ? 'Scanning...' : 'Ready'}
                badgeStyle={[
                  styles.statusBadge,
                  { backgroundColor: isScanning ? colors.warning : colors.success }
                ]}
              />
              <Button
                icon={
                  <Icon
                    name="flip-camera-ios"
                    type="material"
                    color={colors.white}
                    size={24}
                  />
                }
                onPress={toggleCameraType}
                type="clear"
              />
            </View>
          </View>

          {/* Scan Frame */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            {isScanning && (
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.scanningIndicator}
              />
            )}
          </View>

          {/* Bottom Instructions */}
          <View style={styles.bottomInstructions}>
            <Text style={styles.instructionText}>
              Position QR code within the frame
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  permissionButton: {
    marginTop: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 12,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanningIndicator: {
    position: 'absolute',
  },
  bottomInstructions: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});

export default CameraScanner;