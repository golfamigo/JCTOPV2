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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  useToast,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import { 
  ChevronRightIcon, 
  ChevronLeftIcon,
  ViewIcon,
  CloseIcon,
  CheckIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { CameraScanner } from './CameraScanner';
import { CameraService } from '../../../services/cameraService';
import { CheckInService } from '../../../services/checkinService';
import { CheckInSuccessModal } from './CheckInSuccessModal';
import { CheckInErrorModal } from './CheckInErrorModal';
import { AttendeeSearchForm } from './AttendeeSearchForm';
import { AttendeeSearchResults, AttendeeSearchResult } from './AttendeeSearchResults';
import eventService from '../../../services/eventService';
import registrationService from '../../../services/registrationService';
import attendeeSearchService from '../../../services/attendeeSearchService';
import { Event } from '@jctop-event/shared-types';
import statisticsService, { EventStatistics } from '../../../services/statisticsService';
import { CheckInStatisticsHeader } from './CheckInStatisticsHeader';


interface ScannedTicket {
  registrationId: string;
  attendeeName: string;
  ticketType: string;
  status: 'valid' | 'invalid' | 'already_checked_in';
  errorMessage?: string;
  errorCode?: 'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE';
}

export const CheckInModeScreen: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [statisticsError, setStatisticsError] = useState<string | null>(null);
  const [isRefreshingStats, setIsRefreshingStats] = useState(false);
  const [recentScans, setRecentScans] = useState<ScannedTicket[]>([]);
  const [currentScan, setCurrentScan] = useState<ScannedTicket | null>(null);
  const [error, setError] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successAttendee, setSuccessAttendee] = useState<{ name: string; email: string; ticketType: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errorCode, setErrorCode] = useState<'ALREADY_CHECKED_IN' | 'TICKET_NOT_FOUND' | 'INVALID_QR_CODE' | undefined>();
  
  // Manual search states
  const [searchResults, setSearchResults] = useState<AttendeeSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkingInId, setCheckingInId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState(0);

  const bgColor = useColorModeValue('neutral.50', 'neutral.900');
  const cardBgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');

  const cameraService = CameraService.getInstance();
  const checkInService = CheckInService.getInstance();

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  // Real-time statistics polling
  useEffect(() => {
    if (!eventId || !statistics) return;

    const interval = setInterval(() => {
      // Only refresh if not already refreshing and user is actively using the app
      if (!isRefreshingStats && !document.hidden) {
        statisticsService.getEventStatistics(eventId, true).then(result => {
          if (result.success && result.data) {
            setStatistics(result.data);
          }
        });
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [eventId, statistics, isRefreshingStats]);

  const loadEventData = async () => {
    try {
      setIsLoading(true);
      const eventData = await eventService.getEventById(eventId!);
      setEvent(eventData);
      
      // Load check-in statistics
      await loadCheckInStats();
    } catch (error) {
      const errorMessage = `Failed to load event data: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCheckInStats = async () => {
    try {
      setStatisticsLoading(true);
      setStatisticsError(null);
      
      const result = await statisticsService.getEventStatistics(eventId!);
      
      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setStatisticsError(result.error || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Failed to load check-in stats:', error);
      setStatisticsError('Failed to load statistics');
    } finally {
      setStatisticsLoading(false);
    }
  };

  const refreshStatistics = async () => {
    try {
      setIsRefreshingStats(true);
      setStatisticsError(null);
      
      const result = await statisticsService.refreshEventStatistics(eventId!);
      
      if (result.success && result.data) {
        setStatistics(result.data);
        toast({
          title: 'Statistics Updated',
          description: 'Statistics have been refreshed',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        setStatisticsError(result.error || 'Failed to refresh statistics');
        toast({
          title: 'Refresh Failed',
          description: result.error || 'Failed to refresh statistics',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      setStatisticsError('Failed to refresh statistics');
    } finally {
      setIsRefreshingStats(false);
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setError('');
  };

  const handleStopScanning = () => {
    setIsScanning(false);
  };

  const handleQRCodeScanned = async (qrData: string) => {
    try {
      // Validate QR code format
      const validationResult = cameraService.validateQRCodeData(qrData);
      
      if (!validationResult.success) {
        setErrorMessage(validationResult.error || 'Invalid QR code');
        setErrorCode('INVALID_QR_CODE');
        setShowErrorModal(true);
        return;
      }

      // Process the scanned registration
      const processResult = await cameraService.processScannedQR(qrData);
      
      if (!processResult.success) {
        setErrorMessage(processResult.error || 'Failed to process QR code');
        setErrorCode('INVALID_QR_CODE');
        setShowErrorModal(true);
        return;
      }

      // Call backend to validate and check-in the attendee
      const checkInResult = await checkInService.processQRCodeCheckIn(eventId!, processResult.data);
      
      if (checkInResult.success && checkInResult.data) {
        const { attendee } = checkInResult.data;
        if (attendee) {
          setSuccessAttendee(attendee);
          setShowSuccessModal(true);
          
          // Add to recent scans
          const ticket: ScannedTicket = {
            registrationId: processResult.data.registrationId || 'unknown',
            attendeeName: attendee.name,
            ticketType: attendee.ticketType,
            status: 'valid',
          };
          setRecentScans(prev => [ticket, ...prev.slice(0, 4)]); // Keep last 5 scans
          
          // Refresh statistics
          refreshStatistics();
        }
      } else {
        setErrorMessage(checkInResult.error || 'Check-in failed');
        setErrorCode(checkInResult.errorCode as any);
        setShowErrorModal(true);
        
        // Add to recent scans as failed
        const ticket: ScannedTicket = {
          registrationId: processResult.data.registrationId || 'unknown',
          attendeeName: 'Unknown',
          ticketType: 'Unknown',
          status: checkInResult.errorCode === 'ALREADY_CHECKED_IN' ? 'already_checked_in' : 'invalid',
          errorMessage: checkInResult.error,
          errorCode: checkInResult.errorCode as any,
        };
        setRecentScans(prev => [ticket, ...prev.slice(0, 4)]);
      }

    } catch (error) {
      const errorMsg = `Failed to process QR code: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setErrorMessage(errorMsg);
      setErrorCode('INVALID_QR_CODE');
      setShowErrorModal(true);
    }
  };

  const handleScanError = (error: string) => {
    setError(error);
    toast({
      title: 'Camera Error',
      description: error,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleExitCheckInMode = () => {
    navigate(`/organizer/events/${eventId}/attendees`);
  };

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true);
      setSearchError('');
      
      // Validate search query
      const validation = attendeeSearchService.validateSearchQuery(query);
      if (!validation.valid) {
        setSearchError(validation.error || 'Invalid search query');
        return;
      }
      
      // Search for attendees
      const results = await attendeeSearchService.searchAttendees(eventId!, { query });
      setSearchResults(results.attendees);
    } catch (error) {
      const errorMsg = `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setSearchError(errorMsg);
      toast({
        title: 'Search Error',
        description: errorMsg,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchError('');
  };

  const handleManualCheckIn = async (attendee: AttendeeSearchResult) => {
    try {
      setIsCheckingIn(true);
      setCheckingInId(attendee.id);
      
      // Call the manual check-in service
      const result = await attendeeSearchService.manualCheckIn(eventId!, attendee.registrationId);
      
      if (result.success && result.attendee) {
        setSuccessAttendee(result.attendee);
        setShowSuccessModal(true);
        
        // Refresh statistics
        refreshStatistics();
        
        // Update search results to reflect checked-in status
        setSearchResults(prev => prev.map(result => 
          result.id === attendee.id 
            ? { ...result, status: 'checkedIn' as const, checkedInAt: new Date().toISOString() }
            : result
        ));
        
        // Add to recent scans
        const ticket: ScannedTicket = {
          registrationId: attendee.registrationId,
          attendeeName: attendee.name,
          ticketType: attendee.ticketType || 'General Admission',
          status: 'valid',
        };
        setRecentScans(prev => [ticket, ...prev.slice(0, 4)]);
      } else {
        setErrorMessage(result.error || 'Manual check-in failed');
        setErrorCode(result.errorCode);
        setShowErrorModal(true);
        
        // Add to recent scans as failed
        const ticket: ScannedTicket = {
          registrationId: attendee.registrationId,
          attendeeName: attendee.name,
          ticketType: attendee.ticketType || 'General Admission',
          status: result.errorCode === 'ALREADY_CHECKED_IN' ? 'already_checked_in' : 'invalid',
          errorMessage: result.error,
          errorCode: result.errorCode,
        };
        setRecentScans(prev => [ticket, ...prev.slice(0, 4)]);
      }
      
    } catch (error) {
      const errorMsg = `Manual check-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setErrorMessage(errorMsg);
      setErrorCode('TICKET_NOT_FOUND');
      setShowErrorModal(true);
    } finally {
      setIsCheckingIn(false);
      setCheckingInId(undefined);
    }
  };

  const getStatusColor = (status: ScannedTicket['status']) => {
    switch (status) {
      case 'valid':
        return 'success';
      case 'already_checked_in':
        return 'warning';
      case 'invalid':
      default:
        return 'error';
    }
  };

  const getStatusIcon = (status: ScannedTicket['status']) => {
    switch (status) {
      case 'valid':
        return CheckIcon;
      case 'already_checked_in':
        return ViewIcon;
      case 'invalid':
      default:
        return CloseIcon;
    }
  };

  if (isLoading) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Container maxW="container.xl" py={8}>
          <Center minH="60vh">
            <VStack spacing={6}>
              <Spinner size="xl" color="primary.500" thickness="4px" />
              <Text fontSize="lg" color="neutral.600">
                Loading check-in mode...
              </Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box minH="100vh" bg={bgColor}>
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            <Text>Event not found or access denied.</Text>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header with breadcrumb */}
          <Box>
            <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="neutral.500" />}>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/organizer/dashboard')}>
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate(`/organizer/events/${eventId}/attendees`)}>
                  {event.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage>
                <Text color="neutral.600">Check-in Mode</Text>
              </BreadcrumbItem>
            </Breadcrumb>

            <HStack justify="space-between" align="center" mt={4}>
              <VStack align="start" spacing={1}>
                <Heading size="lg" color="neutral.900">
                  Check-in Mode: {event.title}
                </Heading>
                <Text color="neutral.600" fontSize="md">
                  Scan attendee QR codes to check them in
                </Text>
              </VStack>
              
              <Button
                leftIcon={<ChevronLeftIcon />}
                variant="outline"
                colorScheme="neutral"
                onClick={handleExitCheckInMode}
              >
                Exit Check-in Mode
              </Button>
            </HStack>
          </Box>

          {/* Statistics Header */}
          <CheckInStatisticsHeader
            statistics={statistics}
            isLoading={statisticsLoading}
            error={statisticsError}
            onRefresh={refreshStatistics}
            isRefreshing={isRefreshingStats}
          />

          {/* Main Scanner Interface with Tabs */}
          <HStack spacing={8} align="start">
            {/* Left side - Scanner/Search */}
            <VStack flex={2} spacing={4}>
              <Card bg={cardBgColor} borderColor={borderColor} border="1px solid" w="100%">
                <CardBody>
                  <Tabs 
                    index={activeTab} 
                    onChange={setActiveTab} 
                    colorScheme="primary"
                    variant="enclosed"
                  >
                    <TabList>
                      <Tab>
                        <HStack spacing={2}>
                          <ViewIcon />
                          <Text>QR Scanner</Text>
                        </HStack>
                      </Tab>
                      <Tab>
                        <HStack spacing={2}>
                          <SearchIcon />
                          <Text>Manual Search</Text>
                        </HStack>
                      </Tab>
                    </TabList>

                    <TabPanels>
                      {/* QR Scanner Tab */}
                      <TabPanel>
                        <VStack spacing={4}>
                          <HStack justify="space-between" align="center" w="100%">
                            <Heading size="md">QR Code Scanner</Heading>
                            <Badge
                              colorScheme={isScanning ? 'green' : 'gray'}
                              variant="subtle"
                              px={3}
                              py={1}
                            >
                              {isScanning ? 'Active' : 'Inactive'}
                            </Badge>
                          </HStack>
                          
                          <CameraScanner
                            onQRCodeScanned={handleQRCodeScanned}
                            onError={handleScanError}
                            isScanning={isScanning}
                            height={400}
                          />
                          
                          <Text textAlign="center" color="neutral.600" fontSize="sm">
                            Position the QR code within the scanning frame
                          </Text>
                          
                          <HStack spacing={4}>
                            {!isScanning ? (
                              <Button
                                colorScheme="primary"
                                size="lg"
                                onClick={handleStartScanning}
                                leftIcon={<ViewIcon />}
                              >
                                Start Scanning
                              </Button>
                            ) : (
                              <Button
                                colorScheme="red"
                                size="lg"
                                onClick={handleStopScanning}
                                leftIcon={<CloseIcon />}
                              >
                                Stop Scanning
                              </Button>
                            )}
                          </HStack>
                        </VStack>
                      </TabPanel>

                      {/* Manual Search Tab */}
                      <TabPanel>
                        <VStack spacing={6} align="stretch">
                          <Heading size="md">Manual Attendee Search</Heading>
                          
                          <AttendeeSearchForm
                            onSearch={handleSearch}
                            isSearching={isSearching}
                            onClear={handleClearSearch}
                          />
                          
                          <Divider />
                          
                          <AttendeeSearchResults
                            results={searchResults}
                            isLoading={isSearching}
                            error={searchError}
                            onCheckIn={handleManualCheckIn}
                            isCheckingIn={isCheckingIn}
                            checkingInId={checkingInId}
                          />
                        </VStack>
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </CardBody>
              </Card>
            </VStack>

            {/* Recent Scans */}
            <VStack flex={1} spacing={4}>
              <Card bg={cardBgColor} borderColor={borderColor} border="1px solid" w="100%">
                <CardHeader>
                  <Heading size="md">Recent Check-ins</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {recentScans.length === 0 ? (
                      <Text color="neutral.500" textAlign="center" py={8}>
                        No check-ins yet
                      </Text>
                    ) : (
                      recentScans.map((scan, index) => (
                        <Box
                          key={index}
                          p={3}
                          border="1px solid"
                          borderColor={borderColor}
                          borderRadius="md"
                          bg={useColorModeValue('neutral.25', 'neutral.700')}
                        >
                          <HStack justify="space-between" align="center">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="semibold" fontSize="sm">
                                {scan.attendeeName}
                              </Text>
                              <Text fontSize="xs" color="neutral.600">
                                {scan.ticketType}
                              </Text>
                            </VStack>
                            <Badge
                              colorScheme={getStatusColor(scan.status)}
                              variant="subtle"
                              size="sm"
                            >
                              {scan.status === 'valid' ? 'Checked In' : 
                               scan.status === 'already_checked_in' ? 'Already In' : 'Invalid'}
                            </Badge>
                          </HStack>
                        </Box>
                      ))
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </HStack>

          {/* Error Display */}
          {error && (
            <Alert status="error">
              <AlertIcon />
              <Text>{error}</Text>
            </Alert>
          )}
        </VStack>
      </Container>

      {/* Success Modal */}
      {successAttendee && (
        <CheckInSuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setSuccessAttendee(null);
          }}
          attendee={successAttendee}
        />
      )}

      {/* Error Modal */}
      <CheckInErrorModal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
          setErrorCode(undefined);
        }}
        error={errorMessage}
        errorCode={errorCode}
      />
    </Box>
  );
};