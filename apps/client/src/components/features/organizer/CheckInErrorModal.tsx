import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Icon,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { WarningIcon, NotAllowedIcon, InfoIcon } from '@chakra-ui/icons';

interface CheckInErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: string;
  errorCode?: 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE';
}

export const CheckInErrorModal: React.FC<CheckInErrorModalProps> = ({
  isOpen,
  onClose,
  error,
  errorCode,
}) => {
  const bgColor = useColorModeValue('white', 'neutral.800');
  
  const getErrorConfig = () => {
    switch (errorCode) {
      case 'ALREADY_CHECKED_IN':
        return {
          icon: InfoIcon,
          title: 'Already Checked In',
          bgColor: useColorModeValue('warning.50', 'warning.900'),
          color: useColorModeValue('warning.600', 'warning.300'),
          borderColor: useColorModeValue('warning.200', 'warning.700'),
          buttonScheme: 'warning',
        };
      case 'TICKET_NOT_FOUND':
        return {
          icon: NotAllowedIcon,
          title: 'Ticket Not Found',
          bgColor: useColorModeValue('error.50', 'error.900'),
          color: useColorModeValue('error.600', 'error.300'),
          borderColor: useColorModeValue('error.200', 'error.700'),
          buttonScheme: 'red',
        };
      case 'INVALID_QR_CODE':
      default:
        return {
          icon: WarningIcon,
          title: 'Invalid QR Code',
          bgColor: useColorModeValue('error.50', 'error.900'),
          color: useColorModeValue('error.600', 'error.300'),
          borderColor: useColorModeValue('error.200', 'error.700'),
          buttonScheme: 'red',
        };
    }
  };

  const config = getErrorConfig();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="slideInBottom"
      size="md"
    >
      <ModalOverlay />
      <ModalContent bg={bgColor} borderRadius="16px">
        <ModalHeader textAlign="center" pt={8}>
          <VStack spacing={4}>
            <Box
              p={4}
              borderRadius="full"
              bg={config.bgColor}
              color={config.color}
            >
              <Icon as={config.icon} boxSize={12} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold" color={config.color}>
              {config.title}
            </Text>
          </VStack>
        </ModalHeader>

        <ModalBody pb={6}>
          <VStack spacing={4}>
            <Box
              p={6}
              borderRadius="12px"
              border="2px solid"
              borderColor={config.borderColor}
              bg={config.bgColor}
              width="100%"
              textAlign="center"
            >
              <Text fontSize="lg" fontWeight="medium">
                {error}
              </Text>
            </Box>

            {errorCode === 'ALREADY_CHECKED_IN' && (
              <Box
                p={4}
                borderRadius="8px"
                bg={useColorModeValue('neutral.100', 'neutral.700')}
                width="100%"
              >
                <Text fontSize="sm" color="neutral.600" textAlign="center">
                  This ticket has already been scanned and the attendee has entered the venue.
                </Text>
              </Box>
            )}

            {errorCode === 'TICKET_NOT_FOUND' && (
              <Box
                p={4}
                borderRadius="8px"
                bg={useColorModeValue('neutral.100', 'neutral.700')}
                width="100%"
              >
                <Text fontSize="sm" color="neutral.600" textAlign="center">
                  This QR code is not associated with a valid registration for this event.
                </Text>
              </Box>
            )}

            {errorCode === 'INVALID_QR_CODE' && (
              <Box
                p={4}
                borderRadius="8px"
                bg={useColorModeValue('neutral.100', 'neutral.700')}
                width="100%"
              >
                <Text fontSize="sm" color="neutral.600" textAlign="center">
                  The scanned QR code is malformed or does not contain valid ticket data.
                </Text>
              </Box>
            )}
          </VStack>

          <Box mt={4} textAlign="center">
            <Text fontSize="sm" color="neutral.600">
              Scan time: {new Date().toLocaleTimeString()}
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme={config.buttonScheme}
            width="100%"
            size="lg"
            onClick={onClose}
            borderRadius="8px"
          >
            Try Another Code
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};