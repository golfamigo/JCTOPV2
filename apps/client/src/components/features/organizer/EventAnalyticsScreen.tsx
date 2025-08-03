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
  Divider,
  Badge,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  DownloadIcon,
  RepeatIcon,
  ChevronDownIcon,
  CalendarIcon,
  AttachmentIcon,
} from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { EventReport } from '@jctop-event/shared-types';
import { useReportStore } from '../../../stores/reportStore';
import reportService, { EXPORT_FORMATS } from '../../../services/reportService';
import { ReportVisualization } from './ReportVisualization';
import { ReportExportControls } from './ReportExportControls';

export const EventAnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { eventId } = useParams<{ eventId: string }>();
  
  const {
    currentReport,
    reportLoading,
    reportError,
    setReport,
    setReportLoading,
    setReportError,
    clearReport,
  } = useReportStore();

  const bgColor = useColorModeValue('neutral.50', 'neutral.900');
  const cardBgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');

  useEffect(() => {
    if (eventId) {
      loadReport();
    }

    return () => {
      clearReport();
    };
  }, [eventId]);

  const loadReport = async () => {
    if (!eventId) return;

    setReportLoading(true);
    setReportError(null);

    try {
      const report = await reportService.getEventReport(eventId);
      setReport(report);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load event report';
      setReportError(errorMessage);
      toast({
        title: 'Error Loading Report',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setReportLoading(false);
    }
  };

  const handleRefresh = () => {
    loadReport();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ended':
        return 'success';
      case 'published':
        return 'primary';
      case 'draft':
        return 'warning';
      case 'paused':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (reportLoading) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="7xl" py={8}>
          <Center>
            <VStack spacing={4}>
              <Spinner size="xl" color="primary.500" />
              <Text>Loading event report...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (reportError) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="7xl" py={8}>
          <VStack spacing={6}>
            <HStack w="full" justify="space-between">
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                onClick={() => navigate('/organizer/dashboard')}
              >
                Back to Dashboard
              </Button>
            </HStack>
            
            <Alert status="error">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <Text fontWeight="bold">Failed to Load Report</Text>
                <Text>{reportError}</Text>
              </VStack>
            </Alert>

            <Button onClick={handleRefresh} leftIcon={<RepeatIcon />}>
              Try Again
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!currentReport) {
    return (
      <Box bg={bgColor} minH="100vh">
        <Container maxW="7xl" py={8}>
          <Center>
            <Text>No report data available</Text>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="7xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" wrap="wrap" spacing={4}>
            <HStack spacing={4}>
              <Button
                leftIcon={<ArrowBackIcon />}
                variant="ghost"
                onClick={() => navigate('/organizer/dashboard')}
              >
                Back to Dashboard
              </Button>
              <VStack align="start" spacing={1}>
                <Heading size="lg">{currentReport.eventDetails.title}</Heading>
                <HStack>
                  <Badge colorScheme={getStatusColor(currentReport.eventDetails.status)}>
                    {currentReport.eventDetails.status.toUpperCase()}
                  </Badge>
                  <Text color="neutral.600" fontSize="sm">
                    Report generated on {formatDate(currentReport.generatedAt)}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <HStack spacing={2}>
              <Tooltip label="Refresh Report">
                <IconButton
                  icon={<RepeatIcon />}
                  aria-label="Refresh Report"
                  variant="outline"
                  onClick={handleRefresh}
                  isLoading={reportLoading}
                />
              </Tooltip>
              <ReportExportControls 
                eventId={eventId!} 
                eventTitle={currentReport.eventDetails.title}
              />
            </HStack>
          </HStack>

          {/* Event Summary */}
          <Card bg={cardBgColor} borderColor={borderColor}>
            <CardHeader>
              <Heading size="md" color="primary.600">Event Summary</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="neutral.600">Location</Text>
                  <Text fontWeight="medium">{currentReport.eventDetails.location}</Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="neutral.600">Start Date</Text>
                  <Text fontWeight="medium">
                    {formatDate(currentReport.eventDetails.startDate.toString())}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="neutral.600">End Date</Text>
                  <Text fontWeight="medium">
                    {formatDate(currentReport.eventDetails.endDate.toString())}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="neutral.600">Duration</Text>
                  <Text fontWeight="medium">
                    {Math.ceil(
                      (new Date(currentReport.eventDetails.endDate).getTime() - 
                       new Date(currentReport.eventDetails.startDate).getTime()) / 
                      (1000 * 60 * 60 * 24)
                    )} days
                  </Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Registrations</StatLabel>
                  <StatNumber color="primary.600">
                    {currentReport.registrationStats.total}
                  </StatNumber>
                  <StatHelpText>
                    Paid: {currentReport.registrationStats.byStatus.paid + 
                            currentReport.registrationStats.byStatus.checkedIn}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Gross Revenue</StatLabel>
                  <StatNumber color="success.600">
                    {formatCurrency(currentReport.revenue.gross)}
                  </StatNumber>
                  <StatHelpText>
                    Net: {formatCurrency(currentReport.revenue.net)}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Attendance Rate</StatLabel>
                  <StatNumber color="primary.600">
                    {currentReport.attendanceStats.rate}%
                  </StatNumber>
                  <StatHelpText>
                    {currentReport.attendanceStats.checkedIn} of {currentReport.attendanceStats.registered} checked in
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBgColor} borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Discounts Applied</StatLabel>
                  <StatNumber color="warning.600">
                    {formatCurrency(currentReport.revenue.discountAmount)}
                  </StatNumber>
                  <StatHelpText>
                    Total savings for attendees
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Visualizations */}
          <ReportVisualization report={currentReport} />
        </VStack>
      </Container>
    </Box>
  );
};