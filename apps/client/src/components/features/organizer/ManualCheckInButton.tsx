import React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Text,
  VStack,
  HStack,
  useDisclosure,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon } from '@chakra-ui/icons';
import { AttendeeSearchResult } from './AttendeeSearchResults';

interface ManualCheckInButtonProps {
  attendee: AttendeeSearchResult;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ManualCheckInButton: React.FC<ManualCheckInButtonProps> = ({
  attendee,
  onConfirm,
  isLoading,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <Button
        colorScheme="primary"
        size="sm"
        leftIcon={<CheckIcon />}
        onClick={onOpen}
        isDisabled={attendee.status !== 'paid'}
      >
        Check In
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Manual Check-In</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning" borderRadius="md">
                <AlertIcon as={WarningIcon} />
                <Text fontSize="sm">
                  Please verify the attendee's identity before checking them in manually.
                </Text>
              </Alert>
              
              <VStack align="start" spacing={2}>
                <Text fontWeight="semibold">Attendee Details:</Text>
                <VStack align="start" spacing={1} pl={4}>
                  <Text fontSize="sm">Name: {attendee.name}</Text>
                  <Text fontSize="sm">Email: {attendee.email}</Text>
                  <Text fontSize="sm">Registration ID: {attendee.registrationId}</Text>
                  {attendee.ticketType && (
                    <Text fontSize="sm">Ticket Type: {attendee.ticketType}</Text>
                  )}
                </VStack>
              </VStack>
              
              <Text fontSize="sm" color="neutral.600">
                Are you sure you want to manually check in this attendee?
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose} isDisabled={isLoading}>
                Cancel
              </Button>
              <Button
                colorScheme="primary"
                leftIcon={<CheckIcon />}
                onClick={handleConfirm}
                isLoading={isLoading}
                loadingText="Checking in..."
              >
                Confirm Check-In
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};