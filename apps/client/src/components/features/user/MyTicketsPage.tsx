import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  Container,
  Card,
  CardBody,
  Image,
  Divider,
  Spinner,
  Center,
  Icon,
  Badge,
  useToast,
  SimpleGrid,
  EmptyState,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { 
  CalendarIcon, 
  DownloadIcon, 
  ViewIcon, 
  ChevronDownIcon,
  MoreHorizontalIcon,
  ExternalLinkIcon 
} from '@chakra-ui/icons';
import { Registration } from '@jctop-event/shared-types';
import registrationService from '../../../services/registrationService';

const MyTicketsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    loadUserRegistrations();
  }, []);

  const loadUserRegistrations = async () => {
    try {
      setIsLoading(true);
      const userRegistrations = await registrationService.getUserRegistrations();
      setRegistrations(userRegistrations);
    } catch (err: any) {
      console.error('Error loading registrations:', err);
      setError(err.message || '無法載入票券資訊');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = (registration: Registration) => {
    if (!registration.qrCode) {
      toast({
        title: '無法下載',
        description: 'QR Code 尚未生成',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const link = document.createElement('a');
    link.href = registration.qrCode;
    link.download = `ticket-${registration.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'QR Code 已下載',
      description: '您的電子票券已下載完成',
      status: 'success',
      duration: 3000,
    });
  };

  const handleViewDetails = (registration: Registration) => {
    router.push(`/registration/confirmation/${registration.id}`);
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const formatEventDate = (date: Date | string) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatEventTime = (date: Date | string) => {
    const eventDate = new Date(date);
    return eventDate.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isEventPast = (date: Date | string) => {
    return new Date(date) < new Date();
  };

  const renderTicketCard = (registration: Registration) => {
    const isPast = registration.event ? isEventPast(registration.event.startDate) : false;

    return (
      <Card
        key={registration.id}
        bg={bgColor}
        borderWidth={1}
        borderColor={borderColor}
        opacity={isPast ? 0.7 : 1}
      >
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="start">
              <VStack align="stretch" flex={1} spacing={2}>
                <Badge
                  colorScheme={registrationService.getStatusColor(registration.status)}
                  size="sm"
                  alignSelf="flex-start"
                >
                  {registrationService.formatRegistrationStatus(registration.status)}
                </Badge>
                
                <Heading as="h3" size="md" noOfLines={2}>
                  {registration.event?.title || '載入中...'}
                </Heading>
                
                {registration.event && (
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Icon as={CalendarIcon} color="gray.500" boxSize={4} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" color="gray.600">
                          {formatEventDate(registration.event.startDate)}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {formatEventTime(registration.event.startDate)}
                        </Text>
                      </VStack>
                    </HStack>
                    
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      📍 {registration.event.location}
                    </Text>
                  </VStack>
                )}
              </VStack>

              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<MoreHorizontalIcon />}
                  variant="ghost"
                  size="sm"
                />
                <MenuList>
                  <MenuItem
                    icon={<ViewIcon />}
                    onClick={() => handleViewDetails(registration)}
                  >
                    查看詳情
                  </MenuItem>
                  {registration.qrCode && (
                    <MenuItem
                      icon={<DownloadIcon />}
                      onClick={() => handleDownloadQR(registration)}
                    >
                      下載 QR Code
                    </MenuItem>
                  )}
                  {registration.event && (
                    <MenuItem
                      icon={<ExternalLinkIcon />}
                      onClick={() => handleViewEvent(registration.event!.id)}
                    >
                      查看活動
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            </Flex>

            <Divider />

            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="xs" color="gray.500">票券數量</Text>
                <Text fontSize="sm" fontWeight="medium">
                  {registrationService.formatTicketSummary(registration.ticketSelections)}
                </Text>
              </VStack>
              
              <VStack align="end" spacing={1}>
                <Text fontSize="xs" color="gray.500">付款金額</Text>
                <Text fontSize="sm" fontWeight="medium" color="green.600">
                  NT$ {registration.finalAmount.toLocaleString()}
                </Text>
              </VStack>
            </HStack>

            {registration.qrCode && (
              <Box p={3} bg={cardBgColor} borderRadius="md">
                <HStack justify="space-between" align="center">
                  <Image
                    src={registration.qrCode}
                    alt="QR Code"
                    boxSize="60px"
                    borderRadius="md"
                  />
                  <VStack align="end" spacing={1}>
                    <Text fontSize="xs" color="gray.500">報名編號</Text>
                    <Text fontSize="xs" fontFamily="mono" fontWeight="medium">
                      {registration.id.substring(0, 8).toUpperCase()}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            )}

            {isPast && (
              <Alert status="info" size="sm">
                <AlertIcon />
                <Text fontSize="sm">此活動已結束</Text>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={6}>
          <Heading as="h1" size="xl">
            我的票券
          </Heading>
          <Center>
            <VStack spacing={4}>
              <Spinner size="xl" color="blue.500" />
              <Text>載入票券中...</Text>
            </VStack>
          </Center>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={6}>
          <Heading as="h1" size="xl">
            我的票券
          </Heading>
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadUserRegistrations}>
            重新載入
          </Button>
        </VStack>
      </Container>
    );
  }

  if (registrations.length === 0) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={8}>
          <Heading as="h1" size="xl">
            我的票券
          </Heading>
          
          <EmptyState
            title="尚無票券"
            description="您目前沒有任何活動票券"
            action={
              <Button
                colorScheme="blue"
                onClick={() => router.push('/events')}
              >
                瀏覽活動
              </Button>
            }
          />
        </VStack>
      </Container>
    );
  }

  const upcomingEvents = registrations.filter(r => 
    r.event && !isEventPast(r.event.startDate)
  );
  const pastEvents = registrations.filter(r => 
    r.event && isEventPast(r.event.startDate)
  );

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading as="h1" size="xl">
            我的票券
          </Heading>
          <Text color="gray.600">
            共 {registrations.length} 張票券
          </Text>
        </HStack>

        {upcomingEvents.length > 0 && (
          <VStack spacing={4} align="stretch">
            <Heading as="h2" size="lg" color="blue.600">
              即將舉行 ({upcomingEvents.length})
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {upcomingEvents.map(renderTicketCard)}
            </SimpleGrid>
          </VStack>
        )}

        {pastEvents.length > 0 && (
          <VStack spacing={4} align="stretch">
            <Heading as="h2" size="lg" color="gray.500">
              已結束 ({pastEvents.length})
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {pastEvents.map(renderTicketCard)}
            </SimpleGrid>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default MyTicketsPage;