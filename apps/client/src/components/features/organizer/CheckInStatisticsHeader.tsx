import React from 'react';
import {
  HStack,
  Card,
  CardBody,
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
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { EventStatistics } from '../../../services/statisticsService';

interface CheckInStatisticsHeaderProps {
  statistics: EventStatistics | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const CheckInStatisticsHeader: React.FC<CheckInStatisticsHeaderProps> = ({
  statistics,
  isLoading,
  error,
  onRefresh,
  isRefreshing = false,
}) => {
  const cardBgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 70) return 'success.600';
    if (rate >= 40) return 'warning.600';
    return 'error.600';
  };

  if (isLoading && !statistics) {
    return (
      <Card bg={cardBgColor} borderColor={borderColor} border="1px solid">
        <CardBody textAlign="center" py={8}>
          <Spinner size="lg" color="primary.500" />
        </CardBody>
      </Card>
    );
  }

  if (error && !statistics) {
    return (
      <Alert status="error">
        <AlertIcon />
        Failed to load statistics: {error}
      </Alert>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <HStack spacing={6} justify="center" position="relative">
      {/* Refresh Button */}
      <Tooltip label="Refresh Statistics" placement="top">
        <IconButton
          aria-label="Refresh statistics"
          icon={<RepeatIcon />}
          variant="ghost"
          colorScheme="primary"
          position="absolute"
          top="8px"
          right="8px"
          zIndex={1}
          isLoading={isRefreshing}
          onClick={onRefresh}
          size="sm"
        />
      </Tooltip>

      {/* Total Registrations */}
      <Card bg={cardBgColor} borderColor={borderColor} border="1px solid" flex={1}>
        <CardBody textAlign="center">
          <Stat>
            <StatLabel color="neutral.600">Total Registrations</StatLabel>
            <StatNumber color="primary.600" fontSize="3xl">
              {statistics.totalRegistrations.toLocaleString()}
            </StatNumber>
          </Stat>
        </CardBody>
      </Card>
      
      {/* Checked In */}
      <Card bg={cardBgColor} borderColor={borderColor} border="1px solid" flex={1}>
        <CardBody textAlign="center">
          <Stat>
            <StatLabel color="neutral.600">Checked In</StatLabel>
            <StatNumber color="success.600" fontSize="3xl">
              {statistics.checkedInCount.toLocaleString()}
            </StatNumber>
            <StatHelpText color="success.600">
              {statistics.totalRegistrations > 0 ? statistics.attendanceRate.toFixed(1) : '0.0'}%
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
      
      {/* Pending */}
      <Card bg={cardBgColor} borderColor={borderColor} border="1px solid" flex={1}>
        <CardBody textAlign="center">
          <Stat>
            <StatLabel color="neutral.600">Pending</StatLabel>
            <StatNumber 
              color={getAttendanceRateColor(100 - statistics.attendanceRate)} 
              fontSize="3xl"
            >
              {(statistics.totalRegistrations - statistics.checkedInCount).toLocaleString()}
            </StatNumber>
            <StatHelpText 
              color={getAttendanceRateColor(100 - statistics.attendanceRate)}
            >
              {statistics.totalRegistrations > 0 ? (100 - statistics.attendanceRate).toFixed(1) : '100.0'}%
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </HStack>
  );
};