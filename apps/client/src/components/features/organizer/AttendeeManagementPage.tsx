import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  InputGroup,
  InputLeftElement,
  Flex,
  Spacer,
  ButtonGroup,
} from '@chakra-ui/react';
import { 
  ChevronRightIcon, 
  SearchIcon, 
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon as NextIcon,
  ViewIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import attendeeService, { AttendeeDto, AttendeeListResponse } from '../../../services/attendeeService';
import eventService from '../../../services/eventService';
import { Event } from '@jctop-event/shared-types';

interface AttendeeManagementPageProps {
  eventId: string;
  onNavigateBack?: () => void;
}

const AttendeeManagementPage: React.FC<AttendeeManagementPageProps> = ({
  eventId,
  onNavigateBack,
}) => {
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [attendeeData, setAttendeeData] = useState<AttendeeListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'status' | 'userName' | 'finalAmount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const toast = useToast();

  useEffect(() => {
    loadEventDetails();
  }, [eventId]);

  useEffect(() => {
    loadAttendees();
  }, [eventId, statusFilter, searchTerm, sortBy, sortOrder, currentPage]);

  const loadEventDetails = async () => {
    try {
      const eventData = await eventService.getEventForUser(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      setError(error instanceof Error ? error.message : 'Failed to load event');
    }
  };

  const loadAttendees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        status: statusFilter || undefined,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: pageSize,
      };

      const data = await attendeeService.getEventAttendees(eventId, params);
      setAttendeeData(data);
    } catch (error) {
      console.error('Error loading attendees:', error);
      setError(error instanceof Error ? error.message : 'Failed to load attendees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page on filter
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      setIsExporting(true);
      await attendeeService.exportEventAttendees(eventId, {
        format,
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      
      toast({
        title: 'Export successful',
        description: `Attendee list exported as ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Failed to export attendees',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleEnterCheckInMode = () => {
    navigate(`/organizer/events/${eventId}/checkin`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      case 'checkedIn':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={6}>
      <VStack align="stretch" spacing={6}>
        {/* Breadcrumb */}
        <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={onNavigateBack} cursor="pointer">
              Event Management
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Attendee Management</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <Box
          p={6}
          bg={bg}
          borderWidth={1}
          borderColor={borderColor}
          borderRadius="lg"
          shadow="sm"
        >
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" align="flex-start">
              <VStack align="flex-start" spacing={1}>
                <Heading size="lg">Attendee Management</Heading>
                <Text color="gray.600">
                  {event?.title || 'Loading event...'}
                </Text>
              </VStack>
              
              <HStack spacing={3}>
                <Button
                  leftIcon={<ViewIcon />}
                  colorScheme="primary"
                  variant="solid"
                  onClick={handleEnterCheckInMode}
                  size="md"
                >
                  Enter Check-in Mode
                </Button>
                
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<DownloadIcon />}
                    colorScheme="blue"
                    variant="outline"
                    isLoading={isExporting}
                    loadingText="Exporting..."
                  >
                    Export
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => handleExport('csv')}>
                      Export as CSV
                    </MenuItem>
                    <MenuItem onClick={() => handleExport('excel')}>
                      Export as Excel
                    </MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </HStack>

            {/* Summary Stats */}
            {attendeeData && (
              <HStack spacing={8}>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    Total Attendees
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {attendeeData.total}
                  </Text>
                </VStack>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    Current Page
                  </Text>
                  <Text fontSize="lg" fontWeight="semibold">
                    {attendeeData.page} of {attendeeData.totalPages}
                  </Text>
                </VStack>
              </HStack>
            )}
          </VStack>
        </Box>

        {/* Filters and Search */}
        <Box
          p={4}
          bg={bg}
          borderWidth={1}
          borderColor={borderColor}
          borderRadius="lg"
        >
          <HStack spacing={4} wrap="wrap">
            <Box minW="300px">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input 
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </InputGroup>
            </Box>
            
            <Select 
              placeholder="All Statuses" 
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              w="200px"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
              <option value="checkedIn">Checked In</option>
            </Select>

            <Spacer />

            <ButtonGroup size="sm" isAttached variant="outline">
              <Button 
                onClick={() => handleSort('createdAt')}
                colorScheme={sortBy === 'createdAt' ? 'blue' : 'gray'}
              >
                Date {sortBy === 'createdAt' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </Button>
              <Button 
                onClick={() => handleSort('userName')}
                colorScheme={sortBy === 'userName' ? 'blue' : 'gray'}
              >
                Name {sortBy === 'userName' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </Button>
              <Button 
                onClick={() => handleSort('status')}
                colorScheme={sortBy === 'status' ? 'blue' : 'gray'}
              >
                Status {sortBy === 'status' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </Button>
              <Button 
                onClick={() => handleSort('finalAmount')}
                colorScheme={sortBy === 'finalAmount' ? 'blue' : 'gray'}
              >
                Amount {sortBy === 'finalAmount' && (sortOrder === 'ASC' ? '↑' : '↓')}
              </Button>
            </ButtonGroup>
          </HStack>
        </Box>

        {/* Attendees Table */}
        <Box
          bg={bg}
          borderWidth={1}
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
        >
          {isLoading ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Spinner size="lg" />
                <Text>Loading attendees...</Text>
              </VStack>
            </Center>
          ) : attendeeData?.attendees.length === 0 ? (
            <Center py={12}>
              <VStack spacing={4}>
                <Text fontSize="lg" color="gray.500">
                  No attendees found
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {statusFilter || searchTerm 
                    ? 'Try adjusting your filters or search terms'
                    : 'No one has registered for this event yet'
                  }
                </Text>
              </VStack>
            </Center>
          ) : (
            <>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th>Payment</Th>
                    <Th isNumeric>Amount</Th>
                    <Th>Registration Date</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {attendeeData?.attendees.map((attendee) => (
                    <Tr key={attendee.id}>
                      <Td>
                        <VStack align="flex-start" spacing={1}>
                          <Text fontWeight="semibold">{attendee.userName}</Text>
                          {attendee.userPhone && (
                            <Text fontSize="sm" color="gray.500">
                              {attendee.userPhone}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{attendee.userEmail}</Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(attendee.status)}
                          variant="subtle"
                          textTransform="capitalize"
                        >
                          {attendee.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getPaymentStatusColor(attendee.paymentStatus)}
                          variant="subtle"
                          textTransform="capitalize"
                        >
                          {attendee.paymentStatus}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <VStack align="flex-end" spacing={0}>
                          <Text fontWeight="semibold">
                            {formatCurrency(attendee.finalAmount)}
                          </Text>
                          {attendee.discountAmount > 0 && (
                            <Text fontSize="xs" color="green.500">
                              -{formatCurrency(attendee.discountAmount)} discount
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {formatDate(attendee.createdAt)}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Pagination */}
              {attendeeData && attendeeData.totalPages > 1 && (
                <Flex p={4} justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.600">
                    Showing {((currentPage - 1) * pageSize) + 1} to{' '}
                    {Math.min(currentPage * pageSize, attendeeData.total)} of{' '}
                    {attendeeData.total} attendees
                  </Text>
                  
                  <HStack spacing={2}>
                    <IconButton
                      aria-label="Previous page"
                      icon={<ChevronLeftIcon />}
                      size="sm"
                      isDisabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    />
                    
                    <Text fontSize="sm">
                      Page {currentPage} of {attendeeData.totalPages}
                    </Text>
                    
                    <IconButton
                      aria-label="Next page"
                      icon={<NextIcon />}
                      size="sm"
                      isDisabled={currentPage === attendeeData.totalPages}
                      onClick={() => setCurrentPage(prev => 
                        Math.min(attendeeData.totalPages, prev + 1)
                      )}
                    />
                  </HStack>
                </Flex>
              )}
            </>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default AttendeeManagementPage;