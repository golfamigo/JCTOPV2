import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  useColorModeValue,
  Flex,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { EventReport } from '@jctop-event/shared-types';

interface ReportVisualizationProps {
  report: EventReport;
}

export const ReportVisualization: React.FC<ReportVisualizationProps> = ({ report }) => {
  const cardBgColor = useColorModeValue('white', 'neutral.800');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');
  const tableBgColor = useColorModeValue('neutral.50', 'neutral.700');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'checkedIn':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const totalPaidRegistrations = report.registrationStats.byStatus.paid + 
                                 report.registrationStats.byStatus.checkedIn;

  return (
    <VStack spacing={6} align="stretch">
      {/* Registration Status Breakdown */}
      <Card bg={cardBgColor} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="primary.600">Registration Status Breakdown</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="stretch" spacing={4}>
              <Text fontWeight="semibold">Registration Distribution</Text>
              {Object.entries(report.registrationStats.byStatus).map(([status, count]) => {
                const percentage = report.registrationStats.total > 0 
                  ? (count / report.registrationStats.total) * 100 
                  : 0;
                
                return (
                  <Box key={status}>
                    <HStack justify="space-between" mb={1}>
                      <Text textTransform="capitalize" fontSize="sm">
                        {status === 'checkedIn' ? 'Checked In' : status}
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {count} ({percentage.toFixed(1)}%)
                      </Text>
                    </HStack>
                    <Progress
                      value={percentage}
                      size="sm"
                      colorScheme={getStatusColor(status)}
                      bg="neutral.100"
                    />
                  </Box>
                );
              })}
            </VStack>

            <VStack align="start" spacing={3}>
              <Text fontWeight="semibold">Quick Stats</Text>
              <SimpleGrid columns={2} spacing={4} w="full">
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="success.600">
                    {totalPaidRegistrations}
                  </Text>
                  <Text fontSize="sm" color="neutral.600">Paid Registrations</Text>
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="primary.600">
                    {report.attendanceStats.rate}%
                  </Text>
                  <Text fontSize="sm" color="neutral.600">Show-up Rate</Text>
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="warning.600">
                    {report.registrationStats.byStatus.pending}
                  </Text>
                  <Text fontSize="sm" color="neutral.600">Pending</Text>
                </Box>
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" color="error.600">
                    {report.registrationStats.byStatus.cancelled}
                  </Text>
                  <Text fontSize="sm" color="neutral.600">Cancelled</Text>
                </Box>
              </SimpleGrid>
            </VStack>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Ticket Type Performance */}
      {report.registrationStats.byTicketType.length > 0 && (
        <Card bg={cardBgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color="primary.600">Ticket Type Performance</Heading>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple" bg={tableBgColor} borderRadius="md">
                <Thead>
                  <Tr>
                    <Th>Ticket Type</Th>
                    <Th isNumeric>Quantity Sold</Th>
                    <Th isNumeric>Revenue</Th>
                    <Th isNumeric>Avg. Price</Th>
                    <Th>Performance</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {report.registrationStats.byTicketType.map((ticketType) => {
                    const avgPrice = ticketType.quantitySold > 0 
                      ? ticketType.revenue / ticketType.quantitySold 
                      : 0;
                    const revenuePercentage = report.revenue.gross > 0
                      ? (ticketType.revenue / report.revenue.gross) * 100
                      : 0;

                    return (
                      <Tr key={ticketType.ticketTypeId}>
                        <Td fontWeight="medium">{ticketType.ticketTypeName}</Td>
                        <Td isNumeric>{ticketType.quantitySold}</Td>
                        <Td isNumeric fontWeight="semibold" color="success.600">
                          {formatCurrency(ticketType.revenue)}
                        </Td>
                        <Td isNumeric>{formatCurrency(avgPrice)}</Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontSize="xs" color="neutral.600">
                              {revenuePercentage.toFixed(1)}% of total
                            </Text>
                            <Progress
                              value={revenuePercentage}
                              size="sm"
                              colorScheme="primary"
                              w="100px"
                            />
                          </VStack>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>
      )}

      {/* Revenue Analysis */}
      <Card bg={cardBgColor} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="primary.600">Revenue Analysis</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Box textAlign="center" p={4} bg={tableBgColor} borderRadius="md">
              <Text fontSize="3xl" fontWeight="bold" color="success.600">
                {formatCurrency(report.revenue.gross)}
              </Text>
              <Text color="neutral.600">Gross Revenue</Text>
            </Box>
            
            <Box textAlign="center" p={4} bg={tableBgColor} borderRadius="md">
              <Text fontSize="3xl" fontWeight="bold" color="warning.600">
                -{formatCurrency(report.revenue.discountAmount)}
              </Text>
              <Text color="neutral.600">Total Discounts</Text>
            </Box>
            
            <Box textAlign="center" p={4} bg={tableBgColor} borderRadius="md">
              <Text fontSize="3xl" fontWeight="bold" color="primary.600">
                {formatCurrency(report.revenue.net)}
              </Text>
              <Text color="neutral.600">Net Revenue</Text>
            </Box>
          </SimpleGrid>

          {report.revenue.discountAmount > 0 && (
            <Box mt={4} p={3} bg="warning.50" borderRadius="md" border="1px" borderColor="warning.200">
              <Text fontSize="sm" color="warning.800">
                <strong>Discount Impact:</strong> Discounts reduced revenue by{' '}
                {((report.revenue.discountAmount / report.revenue.gross) * 100).toFixed(1)}%
              </Text>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Registration Timeline */}
      {report.timeline.length > 0 ? (
        <Card bg={cardBgColor} borderColor={borderColor}>
          <CardHeader>
            <Heading size="md" color="primary.600">Registration Timeline</Heading>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th isNumeric>Daily Registrations</Th>
                    <Th isNumeric>Daily Revenue</Th>
                    <Th isNumeric>Cumulative Registrations</Th>
                    <Th isNumeric>Cumulative Revenue</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {report.timeline.slice(-10).map((point) => (
                    <Tr key={point.date}>
                      <Td>{formatDate(point.date)}</Td>
                      <Td isNumeric>
                        <Text color={point.registrations > 0 ? 'success.600' : 'neutral.500'}>
                          {point.registrations}
                        </Text>
                      </Td>
                      <Td isNumeric>
                        <Text color={point.revenue > 0 ? 'success.600' : 'neutral.500'}>
                          {formatCurrency(point.revenue)}
                        </Text>
                      </Td>
                      <Td isNumeric fontWeight="medium">
                        {point.cumulativeRegistrations}
                      </Td>
                      <Td isNumeric fontWeight="medium" color="primary.600">
                        {formatCurrency(point.cumulativeRevenue)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            {report.timeline.length > 10 && (
              <Text fontSize="sm" color="neutral.600" mt={2} textAlign="center">
                Showing last 10 days. Full timeline available in exported reports.
              </Text>
            )}
          </CardBody>
        </Card>
      ) : (
        <Alert status="info">
          <AlertIcon />
          No timeline data available - this typically means no registrations have been recorded yet.
        </Alert>
      )}

      {/* Summary Insights */}
      <Card bg={cardBgColor} borderColor={borderColor}>
        <CardHeader>
          <Heading size="md" color="primary.600">Event Insights</Heading>
        </CardHeader>
        <CardBody>
          <VStack align="start" spacing={3}>
            {report.attendanceStats.rate >= 80 && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                Excellent attendance rate! {report.attendanceStats.rate}% of registered attendees showed up.
              </Alert>
            )}
            
            {report.attendanceStats.rate < 60 && report.attendanceStats.registered > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                Consider improving check-in processes. Only {report.attendanceStats.rate}% of registered attendees checked in.
              </Alert>
            )}

            {report.revenue.discountAmount > (report.revenue.gross * 0.2) && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                High discount usage: {((report.revenue.discountAmount / report.revenue.gross) * 100).toFixed(1)}% of gross revenue was discounted.
              </Alert>
            )}

            {report.registrationStats.byStatus.cancelled > (report.registrationStats.total * 0.1) && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                High cancellation rate: {((report.registrationStats.byStatus.cancelled / report.registrationStats.total) * 100).toFixed(1)}% of registrations were cancelled.
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};