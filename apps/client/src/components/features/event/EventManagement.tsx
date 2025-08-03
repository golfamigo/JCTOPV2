import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { Event } from '@jctop-event/shared-types';
import eventService from '../../../services/eventService';
import DiscountCodeList from './DiscountCodeList';
import TicketConfiguration from './TicketConfiguration';
import SeatingConfiguration from './SeatingConfiguration';
import EventStatusManager from './EventStatusManager';
import { useRouter } from 'expo-router';

interface EventManagementProps {
  eventId: string;
  onNavigateBack?: () => void;
}

const EventManagement: React.FC<EventManagementProps> = ({
  eventId,
  onNavigateBack,
}) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const router = useRouter();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const eventData = await eventService.getEventForUser(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'green';
      case 'draft':
        return 'yellow';
      case 'paused':
        return 'orange';
      case 'ended':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Center py={12}>
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Loading event details...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!event) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Event not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={6}>
      <VStack align="stretch" spacing={6}>
        {/* Breadcrumb */}
        <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={onNavigateBack} cursor="pointer">
              My Events
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Event Management</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Event Header */}
        <Box
          p={6}
          bg={bg}
          borderWidth={1}
          borderColor={borderColor}
          borderRadius="lg"
          shadow="sm"
        >
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="flex-start" wrap="wrap">
              <VStack align="flex-start" spacing={2}>
                <Heading size="lg">{event.title}</Heading>
                <Text color="gray.600" fontSize="md">
                  {event.description}
                </Text>
              </VStack>
              
              <Badge
                colorScheme={getStatusColor(event.status)}
                variant="subtle"
                px={3}
                py={1}
                borderRadius="full"
                textTransform="capitalize"
              >
                {event.status}
              </Badge>
            </HStack>

            <HStack spacing={8} wrap="wrap">
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Start Date
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {formatDate(event.startDate)}
                </Text>
              </VStack>
              
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  End Date
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {formatDate(event.endDate)}
                </Text>
              </VStack>
              
              <VStack align="flex-start" spacing={1}>
                <Text fontSize="sm" color="gray.500" fontWeight="medium">
                  Location
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {event.location}
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </Box>

        {/* Management Tabs */}
        <Box
          bg={bg}
          borderWidth={1}
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
        >
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
            <TabList>
              <Tab>Event Status</Tab>
              <Tab>Attendees</Tab>
              <Tab>Discount Codes</Tab>
              <Tab>Tickets</Tab>
              <Tab>Seating</Tab>
            </TabList>

            <TabPanels>
              {/* Event Status Tab */}
              <TabPanel>
                <EventStatusManager
                  eventId={eventId}
                  currentStatus={event.status}
                  onStatusChanged={(newStatus) => {
                    setEvent(prev => prev ? { ...prev, status: newStatus } : null);
                  }}
                />
              </TabPanel>

              {/* Attendees Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between" align="center">
                    <VStack align="flex-start" spacing={1}>
                      <Heading size="md">Attendee Management</Heading>
                      <Text color="gray.600">
                        View and manage event attendees, track registrations, and export attendee lists.
                      </Text>
                    </VStack>
                    <Button
                      colorScheme="blue"
                      onClick={() => router.push(`/organizer/events/${eventId}/attendees`)}
                    >
                      Manage Attendees
                    </Button>
                  </HStack>
                  
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.600">
                      Access detailed attendee information including contact details, payment status, 
                      registration dates, and custom field responses. Export attendee lists to CSV or Excel 
                      for external use.
                    </Text>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Discount Codes Tab */}
              <TabPanel>
                <DiscountCodeList eventId={eventId} />
              </TabPanel>

              {/* Tickets Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Ticket Configuration</Heading>
                  <Text color="gray.600">
                    Configure ticket types and pricing for your event.
                  </Text>
                  <TicketConfiguration
                    ticketTypes={[]} // TODO: Load actual ticket types
                    onChange={(ticketTypes) => {
                      console.log('Ticket types updated:', ticketTypes);
                      // TODO: Implement ticket type updates
                    }}
                  />
                </VStack>
              </TabPanel>

              {/* Seating Tab */}
              <TabPanel>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Seating Configuration</Heading>
                  <Text color="gray.600">
                    Configure seating zones and capacity for your event.
                  </Text>
                  <SeatingConfiguration
                    seatingZones={[]} // TODO: Load actual seating zones
                    onChange={(seatingZones) => {
                      console.log('Seating zones updated:', seatingZones);
                      // TODO: Implement seating zone updates
                    }}
                  />
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Container>
  );
};

export default EventManagement;