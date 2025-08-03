import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  useColorModeValue,
  IconButton,
  Tooltip,
  Alert,
  AlertIcon,
  Badge,
  Button,
  Box,
  Progress,
} from '@chakra-ui/react';
import { RepeatIcon, ViewIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { Event } from '@jctop-event/shared-types';
import statisticsService, { EventStatistics } from '../../../services/statisticsService';

interface EventStatisticsCardProps {
  event: Event;
  onViewDetails?: () => void;
}

export const EventStatisticsCard: React.FC<EventStatisticsCardProps> = ({
  event,
  onViewDetails,
}) => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<EventStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cardBgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');
  const hoverBgColor = useColorModeValue('neutral.50', 'neutral.700');

  useEffect(() => {
    loadStatistics();
  }, [event.id]);

  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await statisticsService.getEventStatistics(event.id);
      
      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setError(result.error || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Failed to load event statistics:', error);
      setError('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatistics = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const result = await statisticsService.refreshEventStatistics(event.id);
      
      if (result.success && result.data) {
        setStatistics(result.data);
      } else {
        setError(result.error || 'Failed to refresh statistics');
      }
    } catch (error) {
      console.error('Failed to refresh statistics:', error);
      setError('Failed to refresh statistics');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewCheckIn = () => {
    navigate(`/organizer/events/${event.id}/checkin`);
  };

  const handleViewAttendees = () => {
    navigate(`/organizer/events/${event.id}/attendees`);
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 70) return 'success';
    if (rate >= 40) return 'warning';
    return 'error';
  };

  const getAttendanceRateText = (rate: number) => {
    if (rate >= 70) return 'Excellent';
    if (rate >= 40) return 'Good';
    return 'Needs Attention';
  };

  if (isLoading) {
    return (
      <Card 
        bg={cardBgColor} 
        borderColor={borderColor} 
        border="1px solid" 
        _hover={{ bg: hoverBgColor }}
        transition="all 0.2s"
      >
        <CardBody textAlign="center" py={8}>
          <Spinner size="md" color="primary.500" />
          <Text mt={2} fontSize="sm" color="neutral.600">
            Loading statistics...
          </Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card 
      bg={cardBgColor} 
      borderColor={borderColor} 
      border="1px solid" 
      _hover={{ bg: hoverBgColor }}
      transition="all 0.2s"
      position="relative"
    >
      <CardHeader pb={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1} flex={1}>
            <Text 
              fontWeight="bold" 
              fontSize="md" 
              noOfLines={1}
              title={event.title}
            >
              {event.title}
            </Text>
            <Text fontSize="xs" color="neutral.500">
              {new Date(event.startDate).toLocaleDateString()}
            </Text>
            <Badge 
              colorScheme={event.status === 'published' ? 'green' : 'gray'} 
              size="sm"
            >
              {event.status}
            </Badge>
          </VStack>
          
          <Tooltip label="Refresh Statistics" placement="top">
            <IconButton
              aria-label="Refresh statistics"
              icon={<RepeatIcon />}
              variant="ghost"
              size="sm"
              isLoading={isRefreshing}
              onClick={refreshStatistics}
            />
          </Tooltip>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        {error ? (
          <Alert status="error" size="sm">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        ) : statistics ? (
          <VStack spacing={4} align="stretch">
            {/* Main Statistics */}
            <HStack spacing={4} justify="space-between">
              <Stat size="sm" textAlign="center">
                <StatLabel fontSize="xs" color="neutral.600">Total</StatLabel>
                <StatNumber fontSize="lg" color="primary.600">
                  {statistics.totalRegistrations}
                </StatNumber>
              </Stat>
              
              <Stat size="sm" textAlign="center">
                <StatLabel fontSize="xs" color="neutral.600">Checked In</StatLabel>
                <StatNumber fontSize="lg" color="success.600">
                  {statistics.checkedInCount}
                </StatNumber>
              </Stat>
              
              <Stat size="sm" textAlign="center">
                <StatLabel fontSize="xs" color="neutral.600">Rate</StatLabel>
                <StatNumber 
                  fontSize="lg" 
                  color={`${getAttendanceRateColor(statistics.attendanceRate)}.600`}
                >
                  {statistics.attendanceRate.toFixed(1)}%
                </StatNumber>
              </Stat>
            </HStack>

            {/* Progress Bar */}
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="neutral.600">
                  Attendance Progress
                </Text>
                <Text fontSize="xs" color="neutral.600">
                  {getAttendanceRateText(statistics.attendanceRate)}
                </Text>
              </HStack>
              <Progress 
                value={statistics.attendanceRate} 
                colorScheme={getAttendanceRateColor(statistics.attendanceRate)}
                size="sm"
                borderRadius="md"
              />
            </Box>

            {/* Action Buttons */}
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="primary"
                variant="outline"
                leftIcon={<ViewIcon />}
                onClick={handleViewCheckIn}
                flex={1}
              >
                Check-in
              </Button>
              <Button
                size="sm"
                variant="ghost"
                colorScheme="primary"
                onClick={handleViewAttendees}
                flex={1}
              >
                Attendees
              </Button>
            </HStack>

            {/* Last Updated */}
            <Text fontSize="xs" color="neutral.500" textAlign="center">
              Updated {new Date(statistics.lastUpdated).toLocaleTimeString()}
            </Text>
          </VStack>
        ) : (
          <Text fontSize="sm" color="neutral.500" textAlign="center">
            No statistics available
          </Text>
        )}
      </CardBody>
    </Card>
  );
};