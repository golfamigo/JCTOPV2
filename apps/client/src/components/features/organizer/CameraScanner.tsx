import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { 
  ViewIcon, 
  RepeatIcon,
  SunIcon,
  MoonIcon,
} from '@chakra-ui/icons';
import { Camera, CameraType } from 'expo-camera';
import { CameraService } from '../../../services/cameraService';
import { getCameraPermissionErrorMessage } from '../../../utils/permissions';

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
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [flashMode, setFlashMode] = useState<'on' | 'off' | 'auto'>('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState<string>('');
  const [cameraReady, setCameraReady] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>('');
  const [scanCooldown, setScanCooldown] = useState(false);

  const cameraService = CameraService.getInstance();
  
  const bgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');
  const overlayColor = useColorModeValue('rgba(0,0,0,0.5)', 'rgba(0,0,0,0.7)');

  useEffect(() => {
    initializeCamera();
    return () => {
      cameraService.reset();
    };
  }, []);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      const result = await cameraService.initialize();
      
      if (!result.success) {
        const errorMessage = getCameraPermissionErrorMessage(result.data || {
          granted: false,
          canAskAgain: false,
          status: 'denied'
        });
        setPermissionError(errorMessage);
        onError?.(errorMessage);
        return;
      }

      cameraService.setCameraRef(cameraRef);
      setPermissionError('');
    } catch (error) {
      const errorMessage = `Failed to initialize camera: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setPermissionError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onCameraReady = () => {
    setCameraReady(true);
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (!isScanning || scanCooldown || data === lastScanned) {
      return;
    }

    setLastScanned(data);
    setScanCooldown(true);
    onQRCodeScanned(data);

    // Reset cooldown after 2 seconds to prevent duplicate scans
    setTimeout(() => {
      setScanCooldown(false);
      setLastScanned('');
    }, 2000);
  };

  const toggleCameraType = () => {
    const newType = cameraService.switchCameraType(cameraType);
    setCameraType(newType);
  };

  const toggleFlashMode = () => {
    const newMode = cameraService.toggleFlashMode(flashMode);
    setFlashMode(newMode);
  };

  const getFlashIcon = () => {
    return flashMode === 'off' ? MoonIcon : SunIcon;
  };

  if (permissionError) {
    return (
      <Box
        width={width}
        height={height}
        bg={bgColor}
        border="2px solid"
        borderColor="error.300"
        borderRadius="12px"
        p={6}
      >
        <Alert status="error">
          <AlertIcon />
          <Text fontSize="md">{permissionError}</Text>
        </Alert>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        width={width}
        height={height}
        bg={bgColor}
        border="2px solid"
        borderColor={borderColor}
        borderRadius="12px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" color="primary.500" thickness="4px" />
            <Text fontSize="lg" color="neutral.600">
              Initializing camera...
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box
      width={width}
      height={height}
      position="relative"
      borderRadius="12px"
      overflow="hidden"
      border="2px solid"
      borderColor={isScanning ? 'success.400' : borderColor}
      boxShadow={isScanning ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'}
    >
      <Camera
        ref={cameraRef}
        style={{ flex: 1 }}
        facing={cameraType}
        flash={flashMode}
        onCameraReady={onCameraReady}
        onBarcodeScanned={cameraReady ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      {/* Scanning overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
      >
        {/* Top overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="25%"
          bg={overlayColor}
        />
        
        {/* Bottom overlay */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          height="25%"
          bg={overlayColor}
        />
        
        {/* Left overlay */}
        <Box
          position="absolute"
          top="25%"
          left={0}
          width="15%"
          height="50%"
          bg={overlayColor}
        />
        
        {/* Right overlay */}
        <Box
          position="absolute"
          top="25%"
          right={0}
          width="15%"
          height="50%"
          bg={overlayColor}
        />
        
        {/* Scanning frame */}
        <Box
          position="absolute"
          top="25%"
          left="15%"
          width="70%"
          height="50%"
          border="3px solid"
          borderColor={isScanning ? 'success.400' : 'primary.400'}
          borderRadius="12px"
          _before={{
            content: '""',
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            border: '1px solid',
            borderColor: 'white',
            borderRadius: '15px',
          }}
        />
      </Box>

      {/* Camera controls */}
      <Box
        position="absolute"
        top={4}
        right={4}
      >
        <VStack spacing={2}>
          <IconButton
            aria-label="Toggle flash"
            icon={React.createElement(getFlashIcon())}
            size="md"
            colorScheme="whiteAlpha"
            bg="rgba(0,0,0,0.6)"
            color="white"
            _hover={{ bg: 'rgba(0,0,0,0.8)' }}
            onClick={toggleFlashMode}
          />
          <IconButton
            aria-label="Switch camera"
            icon={<RepeatIcon />}
            size="md"
            colorScheme="whiteAlpha"
            bg="rgba(0,0,0,0.6)"
            color="white"
            _hover={{ bg: 'rgba(0,0,0,0.8)' }}
            onClick={toggleCameraType}
          />
        </VStack>
      </Box>

      {/* Status indicators */}
      <Box
        position="absolute"
        bottom={4}
        left={4}
        right={4}
      >
        <HStack justify="space-between" align="center">
          <Badge
            colorScheme={isScanning ? 'green' : 'gray'}
            variant="solid"
            px={3}
            py={1}
            borderRadius="full"
          >
            {isScanning ? 'Scanning...' : 'Ready'}
          </Badge>
          
          {scanCooldown && (
            <Badge
              colorScheme="blue"
              variant="solid"
              px={3}
              py={1}
              borderRadius="full"
            >
              Processing...
            </Badge>
          )}
        </HStack>
      </Box>
    </Box>
  );
};