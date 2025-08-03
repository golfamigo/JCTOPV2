import React, { useState } from 'react';
import {
  Box,
  Button,
  Select,
  HStack,
  VStack,
  Text,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Textarea,
} from '@chakra-ui/react';
import { UpdateEventStatusDto } from '@jctop-event/shared-types';

type EventStatus = 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';

interface EventStatusManagerProps {
  eventId: string;
  currentStatus: EventStatus;
  onStatusChange: (newStatus: EventStatus) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_COLORS = {
  draft: 'gray',
  published: 'green',
  unpublished: 'orange',
  paused: 'yellow',
  ended: 'red',
} as const;

const STATUS_LABELS = {
  draft: 'Draft',
  published: 'Published',
  unpublished: 'Unpublished',
  paused: 'Paused',
  ended: 'Ended',
} as const;

const STATUS_DESCRIPTIONS = {
  draft: 'Event is in draft mode and not visible to the public',
  published: 'Event is live and accepting registrations',
  unpublished: 'Event is hidden from public but data is preserved',
  paused: 'Event is visible but registration is closed',
  ended: 'Event has concluded and registration is closed',
} as const;

const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  draft: ['published'],
  published: ['unpublished', 'paused', 'ended'],
  unpublished: ['published', 'ended'],
  paused: ['published', 'ended'],
  ended: [],
};

const EventStatusManager: React.FC<EventStatusManagerProps> = ({
  eventId,
  currentStatus,
  onStatusChange,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<EventStatus>(currentStatus);
  const [reason, setReason] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const availableStatuses = VALID_TRANSITIONS[currentStatus] || [];

  const handleStatusSelection = (newStatus: EventStatus) => {
    setSelectedStatus(newStatus);
    setReason('');
    onOpen();
  };

  const handleConfirmStatusChange = async () => {
    try {
      await onStatusChange(selectedStatus);
      onClose();
      toast({
        title: 'Status Updated',
        description: `Event status changed to ${STATUS_LABELS[selectedStatus]}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update event status',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getButtonColor = (status: EventStatus) => {
    switch (status) {
      case 'published':
        return '#2563EB'; // Primary blue
      case 'paused':
        return '#FBBF24'; // Warning yellow
      case 'unpublished':
      case 'ended':
        return '#EF4444'; // Error red
      default:
        return '#475569'; // Secondary gray
    }
  };

  if (availableStatuses.length === 0) {
    return (
      <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
        <VStack align="start" spacing={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            Event Status
          </Text>
          <Badge colorScheme={STATUS_COLORS[currentStatus]} variant="solid" px={3} py={1}>
            {STATUS_LABELS[currentStatus]}
          </Badge>
          <Text fontSize="xs" color="gray.500">
            {STATUS_DESCRIPTIONS[currentStatus]}
          </Text>
          {currentStatus === 'ended' && (
            <Text fontSize="xs" color="gray.400">
              No further status changes available
            </Text>
          )}
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <Box p={4} borderWidth={1} borderRadius="md">
        <VStack align="start" spacing={4}>
          <Box>
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
              Current Status
            </Text>
            <Badge colorScheme={STATUS_COLORS[currentStatus]} variant="solid" px={3} py={1}>
              {STATUS_LABELS[currentStatus]}
            </Badge>
          </Box>

          <Box w="full">
            <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={3}>
              Change Status
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              {availableStatuses.map((status) => (
                <Button
                  key={status}
                  size="sm"
                  bg={getButtonColor(status)}
                  color="white"
                  _hover={{ opacity: 0.8 }}
                  _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                  isDisabled={isLoading}
                  onClick={() => handleStatusSelection(status)}
                  aria-label={`Change status to ${STATUS_LABELS[status]}`}
                >
                  {STATUS_LABELS[status]}
                </Button>
              ))}
            </HStack>
          </Box>
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Status Change
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack align="start" spacing={4}>
                <Text>
                  Are you sure you want to change the event status from{' '}
                  <Badge colorScheme={STATUS_COLORS[currentStatus]} mx={1}>
                    {STATUS_LABELS[currentStatus]}
                  </Badge>
                  to
                  <Badge colorScheme={STATUS_COLORS[selectedStatus]} mx={1}>
                    {STATUS_LABELS[selectedStatus]}
                  </Badge>
                  ?
                </Text>

                <Text fontSize="sm" color="gray.600">
                  {STATUS_DESCRIPTIONS[selectedStatus]}
                </Text>

                <FormControl>
                  <FormLabel fontSize="sm">Reason (optional)</FormLabel>
                  <Textarea
                    size="sm"
                    placeholder="Enter reason for status change..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    resize="vertical"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button
                bg={getButtonColor(selectedStatus)}
                color="white"
                _hover={{ opacity: 0.8 }}
                onClick={handleConfirmStatusChange}
                ml={3}
                size="sm"
                isLoading={isLoading}
                loadingText="Updating..."
              >
                Confirm Change
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default EventStatusManager;