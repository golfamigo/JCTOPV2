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
  HStack,
  Text,
  Icon,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';

interface CheckInSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: {
    name: string;
    email: string;
    ticketType: string;
  };
}

export const CheckInSuccessModal: React.FC<CheckInSuccessModalProps> = ({
  isOpen,
  onClose,
  attendee,
}) => {
  const bgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('success.200', 'success.700');
  const successBg = useColorModeValue('success.50', 'success.900');
  const successColor = useColorModeValue('success.600', 'success.300');

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
              bg={successBg}
              color={successColor}
            >
              <Icon as={CheckCircleIcon} boxSize={12} />
            </Box>
            <Text fontSize="2xl" fontWeight="bold" color={successColor}>
              Check-in Successful!
            </Text>
          </VStack>
        </ModalHeader>

        <ModalBody pb={6}>
          <VStack
            spacing={4}
            p={6}
            borderRadius="12px"
            border="2px solid"
            borderColor={borderColor}
            bg={useColorModeValue('success.50', 'success.900')}
          >
            <VStack spacing={2} width="100%">
              <Text fontSize="sm" color="neutral.600" fontWeight="medium">
                ATTENDEE NAME
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {attendee.name}
              </Text>
            </VStack>

            <VStack spacing={2} width="100%">
              <Text fontSize="sm" color="neutral.600" fontWeight="medium">
                EMAIL
              </Text>
              <Text fontSize="md">
                {attendee.email}
              </Text>
            </VStack>

            <VStack spacing={2} width="100%">
              <Text fontSize="sm" color="neutral.600" fontWeight="medium">
                TICKET TYPE
              </Text>
              <Text fontSize="md" fontWeight="semibold">
                {attendee.ticketType}
              </Text>
            </VStack>
          </VStack>

          <Box mt={4} textAlign="center">
            <Text fontSize="sm" color="neutral.600">
              Check-in time: {new Date().toLocaleTimeString()}
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="success"
            width="100%"
            size="lg"
            onClick={onClose}
            borderRadius="8px"
          >
            Continue Scanning
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};