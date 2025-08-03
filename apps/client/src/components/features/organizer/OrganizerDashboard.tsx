import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  useToast,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  IconButton,
  Tooltip,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { 
  AddIcon,
  RepeatIcon,
  CalendarIcon,
  ViewIcon,
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { EventStatisticsCard } from './EventStatisticsCard';
import dashboardAnalyticsService, { DashboardAnalytics, EventWithStatistics } from '../../../services/dashboardAnalyticsService';

export const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const bgColor = useColorModeValue('neutral.50', 'neutral.900');
  const cardBgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');

  useEffect(() => {
    loadDashboardAnalytics();
  }, []);

  const loadDashboardAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await dashboardAnalyticsService.getDashboardAnalytics();
      
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        setError(result.error || 'Failed to load dashboard analytics');
      }
    } catch (error) {
      console.error('Failed to load dashboard analytics:', error);
      setError('Failed to load dashboard analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const result = await dashboardAnalyticsService.refreshDashboardAnalytics();
      
      if (result.success && result.data) {
        setAnalytics(result.data);
        toast({
          title: 'Dashboard Updated',
          description: 'Analytics have been refreshed',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        setError(result.error || 'Failed to refresh analytics');
        toast({
          title: 'Refresh Failed',
          description: result.error || 'Failed to refresh analytics',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
      setError('Failed to refresh analytics');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateEvent = () => {
    navigate('/organizer/events/create');
  };

  const handleViewAllEvents = () => {
    navigate('/organizer/events');
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Container maxW="container.xl" py={8}>
          <Center minH="60vh">
            <VStack spacing={6}>
              <Spinner size="xl" color="primary.500" thickness="4px" />
              <Text fontSize="lg" color="neutral.600">
                Loading dashboard...
              </Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (error && !analytics) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        </Container>
      </Box>
    );
  }

  const publishedEventsWithStats = analytics?.eventStatistics.filter(
    e => e.status === 'published' && e.statistics
  ) || [];

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="neutral.900">
                Organizer Dashboard
              </Heading>
              <Text color="neutral.600" fontSize="md">
                Manage your events and track attendance
              </Text>
            </VStack>
            
            <HStack spacing={3}>
              <Tooltip label="Refresh Analytics" placement="top">
                <IconButton
                  aria-label="Refresh analytics"
                  icon={<RepeatIcon />}
                  variant="outline"
                  colorScheme="primary"
                  isLoading={isRefreshing}
                  onClick={refreshAnalytics}
                />
              </Tooltip>
              
              <Button
                leftIcon={<AddIcon />}
                colorScheme="primary"
                onClick={handleCreateEvent}
              >
                Create Event
              </Button>
            </HStack>
          </HStack>

          {/* Summary Statistics */}
          {analytics && (
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Card bg={cardBgColor} borderColor={borderColor} border="1px solid">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel color="neutral.600">Total Events</StatLabel>
                    <StatNumber color="primary.600" fontSize="2xl">
                      {analytics.totalEvents}
                    </StatNumber>
                    <StatHelpText color="neutral.500">
                      {analytics.publishedEvents} published
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBgColor} borderColor={borderColor} border="1px solid">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel color="neutral.600">Total Registrations</StatLabel>
                    <StatNumber color="primary.600" fontSize="2xl">
                      {analytics.totalRegistrations.toLocaleString()}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBgColor} borderColor={borderColor} border="1px solid">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel color="neutral.600">Total Check-ins</StatLabel>
                    <StatNumber color="success.600" fontSize="2xl">
                      {analytics.totalCheckedIn.toLocaleString()}
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>

              <Card bg={cardBgColor} borderColor={borderColor} border="1px solid">
                <CardBody textAlign="center">
                  <Stat>
                    <StatLabel color="neutral.600">Overall Rate</StatLabel>
                    <StatNumber 
                      color={analytics.overallAttendanceRate >= 70 ? 'success.600' : 
                             analytics.overallAttendanceRate >= 40 ? 'warning.600' : 'error.600'} 
                      fontSize="2xl"
                    >
                      {analytics.overallAttendanceRate.toFixed(1)}%
                    </StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Event Statistics Grid */}
          <Card bg={cardBgColor} borderColor={borderColor} border="1px solid">
            <CardHeader>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Heading size="md">Event Analytics</Heading>
                  <Text fontSize="sm" color="neutral.600">
                    Real-time check-in statistics for your active events
                  </Text>
                </VStack>
                
                <Button
                  size="sm"
                  variant="outline"
                  colorScheme="primary"
                  leftIcon={<CalendarIcon />}
                  onClick={handleViewAllEvents}
                >
                  View All Events
                </Button>
              </HStack>
            </CardHeader>

            <Divider />

            <CardBody>
              {publishedEventsWithStats.length === 0 ? (
                <Center py={12}>
                  <VStack spacing={4}>
                    <ViewIcon boxSize={12} color="neutral.400" />
                    <VStack spacing={2} textAlign="center">
                      <Text fontWeight="semibold" color="neutral.600">
                        No Active Events
                      </Text>
                      <Text fontSize="sm" color="neutral.500" maxW="md">
                        Create and publish events to see real-time analytics and check-in statistics here.
                      </Text>
                    </VStack>
                    <Button
                      colorScheme="primary"
                      leftIcon={<AddIcon />}
                      onClick={handleCreateEvent}
                    >
                      Create Your First Event
                    </Button>
                  </VStack>
                </Center>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {publishedEventsWithStats.map((event) => (
                    <EventStatisticsCard
                      key={event.id}
                      event={event}
                    />
                  ))}
                </SimpleGrid>
              )}
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card bg={cardBgColor} borderColor={borderColor} border="1px solid">
            <CardHeader>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Button
                  variant="outline"
                  colorScheme="primary"
                  onClick={handleCreateEvent}
                  h="auto"
                  py={4}
                >
                  <VStack spacing={2}>
                    <AddIcon boxSize={6} />
                    <VStack spacing={0}>
                      <Text fontWeight="semibold">Create Event</Text>
                      <Text fontSize="xs" color="neutral.500">
                        Start organizing a new event
                      </Text>
                    </VStack>
                  </VStack>
                </Button>

                <Button
                  variant="outline"
                  colorScheme="primary"
                  onClick={handleViewAllEvents}
                  h="auto"
                  py={4}
                >
                  <VStack spacing={2}>
                    <CalendarIcon boxSize={6} />
                    <VStack spacing={0}>
                      <Text fontWeight="semibold">Manage Events</Text>
                      <Text fontSize="xs" color="neutral.500">
                        View and edit all events
                      </Text>
                    </VStack>
                  </VStack>
                </Button>

                <Button
                  variant="outline"
                  colorScheme="primary"
                  onClick={() => navigate('/organizer/dashboard/payment-settings')}
                  h="auto"
                  py={4}
                >
                  <VStack spacing={2}>
                    <ViewIcon boxSize={6} />
                    <VStack spacing={0}>
                      <Text fontWeight="semibold">Payment Settings</Text>
                      <Text fontSize="xs" color="neutral.500">
                        Configure payment methods
                      </Text>
                    </VStack>
                  </VStack>
                </Button>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Last Updated */}
          {analytics && (
            <Text fontSize="xs" color="neutral.500" textAlign="center">
              Last updated: {new Date(analytics.lastUpdated).toLocaleString()}
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
};