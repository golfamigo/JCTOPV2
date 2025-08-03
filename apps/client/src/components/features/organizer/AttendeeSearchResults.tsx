import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useColorModeValue,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon } from '@chakra-ui/icons';

export interface AttendeeSearchResult {
  id: string;
  name: string;
  email: string;
  registrationId: string;
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';
  checkedInAt?: string;
  ticketType?: string;
}

interface AttendeeSearchResultsProps {
  results: AttendeeSearchResult[];
  isLoading: boolean;
  error?: string;
  onCheckIn: (attendee: AttendeeSearchResult) => void;
  isCheckingIn: boolean;
  checkingInId?: string;
}

export const AttendeeSearchResults: React.FC<AttendeeSearchResultsProps> = ({
  results,
  isLoading,
  error,
  onCheckIn,
  isCheckingIn,
  checkingInId,
}) => {
  const bgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');
  const hoverBgColor = useColorModeValue('neutral.50', 'neutral.700');

  const getStatusBadge = (status: AttendeeSearchResult['status']) => {
    switch (status) {
      case 'checkedIn':
        return { colorScheme: 'green', label: 'Checked In' };
      case 'paid':
        return { colorScheme: 'blue', label: 'Paid' };
      case 'pending':
        return { colorScheme: 'yellow', label: 'Pending' };
      case 'cancelled':
        return { colorScheme: 'red', label: 'Cancelled' };
      default:
        return { colorScheme: 'gray', label: 'Unknown' };
    }
  };

  if (isLoading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.500" thickness="4px" />
          <Text color="neutral.600">Searching for attendees...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  if (results.length === 0) {
    return (
      <Box
        p={8}
        textAlign="center"
        border="1px dashed"
        borderColor={borderColor}
        borderRadius="md"
        bg={bgColor}
      >
        <Text color="neutral.500" fontSize="lg">
          No attendees found
        </Text>
        <Text color="neutral.400" fontSize="sm" mt={2}>
          Try searching with a different name or registration number
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      <Text color="neutral.600" fontSize="sm" fontWeight="medium">
        Found {results.length} attendee{results.length !== 1 ? 's' : ''}
      </Text>
      
      {results.map((attendee) => {
        const statusBadge = getStatusBadge(attendee.status);
        const isCheckedIn = attendee.status === 'checkedIn';
        const canCheckIn = attendee.status === 'paid';
        
        return (
          <Box
            key={attendee.id}
            p={4}
            border="1px solid"
            borderColor={borderColor}
            borderRadius="md"
            bg={bgColor}
            _hover={{
              bg: hoverBgColor,
              borderColor: 'primary.200',
              transition: 'all 0.2s',
            }}
          >
            <HStack justify="space-between" align="start" spacing={4}>
              <VStack align="start" spacing={2} flex={1}>
                <HStack spacing={3}>
                  <Text fontWeight="semibold" fontSize="md">
                    {attendee.name}
                  </Text>
                  <Badge
                    colorScheme={statusBadge.colorScheme}
                    variant="subtle"
                    px={2}
                  >
                    {statusBadge.label}
                  </Badge>
                </HStack>
                
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="neutral.600">
                    {attendee.email}
                  </Text>
                  <HStack spacing={4}>
                    <Text fontSize="xs" color="neutral.500">
                      ID: {attendee.registrationId}
                    </Text>
                    {attendee.ticketType && (
                      <Text fontSize="xs" color="neutral.500">
                        Ticket: {attendee.ticketType}
                      </Text>
                    )}
                  </HStack>
                </VStack>
                
                {isCheckedIn && attendee.checkedInAt && (
                  <HStack spacing={1}>
                    <InfoIcon color="green.500" boxSize={3} />
                    <Text fontSize="xs" color="green.600">
                      Checked in at {new Date(attendee.checkedInAt).toLocaleString()}
                    </Text>
                  </HStack>
                )}
              </VStack>
              
              <Box>
                {canCheckIn ? (
                  <Button
                    colorScheme="primary"
                    size="sm"
                    leftIcon={<CheckIcon />}
                    onClick={() => onCheckIn(attendee)}
                    isLoading={isCheckingIn && checkingInId === attendee.id}
                    loadingText="Checking in..."
                    isDisabled={isCheckingIn}
                  >
                    Check In
                  </Button>
                ) : isCheckedIn ? (
                  <Tooltip label="Already checked in" placement="left">
                    <Box>
                      <Button
                        size="sm"
                        variant="outline"
                        colorScheme="green"
                        leftIcon={<CheckIcon />}
                        isDisabled
                      >
                        Checked In
                      </Button>
                    </Box>
                  </Tooltip>
                ) : (
                  <Tooltip label="Cannot check in - registration not paid" placement="left">
                    <Box>
                      <Button
                        size="sm"
                        variant="ghost"
                        isDisabled
                      >
                        Not Eligible
                      </Button>
                    </Box>
                  </Tooltip>
                )}
              </Box>
            </HStack>
          </Box>
        );
      })}
    </VStack>
  );
};