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
  Flex,
  SimpleGrid,
  Link,
} from '@chakra-ui/react';
import { CheckIcon, DownloadIcon, ViewIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Registration } from '@jctop-event/shared-types';
import registrationService from '../../../services/registrationService';

interface RegistrationConfirmationPageProps {
  registrationId: string;
}

const RegistrationConfirmationPage: React.FC<RegistrationConfirmationPageProps> = ({
  registrationId,
}) => {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    loadRegistration();
  }, [registrationId]);

  const loadRegistration = async () => {
    try {
      setIsLoading(true);
      const registrationData = await registrationService.getRegistration(registrationId);
      setRegistration(registrationData);
    } catch (err: any) {
      console.error('Error loading registration:', err);
      setError(err.message || '無法載入報名資訊');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!registration?.qrCode) return;

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

  const handleViewMyTickets = () => {
    router.push('/user/tickets');
  };

  const handleBackToEvent = () => {
    if (registration?.eventId) {
      router.push(`/event/${registration.eventId}`);
    } else {
      router.push('/events');
    }
  };

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <Center>
              <VStack spacing={4}>
                <Spinner size="xl" color="green.500" />
                <Text>載入報名資訊中...</Text>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="4xl" py={8}>
        <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button mt={4} onClick={() => router.back()}>
              返回
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (!registration) {
    return (
      <Container maxW="4xl" py={8}>
        <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <Text>找不到報名資訊</Text>
          </CardBody>
        </Card>
      </Container>
    );
  }

  const formatTicketSelections = (selections: any[]) => {
    return selections.map((selection, index) => (
      <HStack key={index} justify="space-between" w="full">
        <Text fontSize="sm">票種 {index + 1}</Text>
        <Text fontSize="sm" fontWeight="medium">
          {selection.quantity} 張 × NT$ {selection.price.toLocaleString()}
        </Text>
      </HStack>
    ));
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Success Header */}
        <Card bg="green.50" borderWidth={2} borderColor="green.200">
          <CardBody>
            <VStack spacing={4} textAlign="center">
              <Icon as={CheckIcon} boxSize={16} color="green.500" />
              <Heading as="h1" size="xl" color="green.700">
                報名成功！
              </Heading>
              <Text color="green.600" fontSize="lg">
                恭喜您已成功完成活動報名，您將收到確認郵件
              </Text>
              <Badge colorScheme="green" fontSize="md" px={4} py={2} borderRadius="full">
                已付款完成
              </Badge>
            </VStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          {/* Event & Registration Details */}
          <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="md" color="gray.700">
                  活動資訊
                </Heading>
                
                <Box p={4} bg={cardBgColor} borderRadius="md">
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">活動名稱：</Text>
                      <Text fontSize="sm" fontWeight="medium" textAlign="right">
                        {registration.event?.title || '載入中...'}
                      </Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">活動日期：</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {registration.event?.startDate 
                          ? new Date(registration.event.startDate).toLocaleDateString('zh-TW')
                          : '載入中...'
                        }
                      </Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">活動地點：</Text>
                      <Text fontSize="sm" fontWeight="medium" textAlign="right">
                        {registration.event?.location || '載入中...'}
                      </Text>
                    </HStack>
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">報名編號：</Text>
                      <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
                        {registration.id.substring(0, 8).toUpperCase()}
                      </Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">報名狀態：</Text>
                      <Badge colorScheme="green" size="sm">
                        已完成
                      </Badge>
                    </HStack>
                  </VStack>
                </Box>

                {/* Ticket Information */}
                <Heading as="h3" size="sm" color="gray.700" mt={4}>
                  票券資訊
                </Heading>
                
                <Box p={4} bg={cardBgColor} borderRadius="md">
                  <VStack spacing={2} align="stretch">
                    {formatTicketSelections(registration.ticketSelections || [])}
                    
                    <Divider />
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">原價：</Text>
                      <Text fontSize="sm">NT$ {registration.totalAmount.toLocaleString()}</Text>
                    </HStack>
                    
                    {registration.discountAmount && registration.discountAmount > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">折扣：</Text>
                        <Text fontSize="sm" color="red.500">
                          -NT$ {registration.discountAmount.toLocaleString()}
                        </Text>
                      </HStack>
                    )}
                    
                    <HStack justify="space-between">
                      <Text fontWeight="bold">實付金額：</Text>
                      <Text fontWeight="bold" color="green.600">
                        NT$ {registration.finalAmount.toLocaleString()}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>

          {/* QR Code & Actions */}
          <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="md" color="gray.700">
                  電子票券
                </Heading>
                
                {registration.qrCode ? (
                  <VStack spacing={4}>
                    <Box p={4} bg="white" borderRadius="md" borderWidth={1}>
                      <Image
                        src={registration.qrCode}
                        alt="活動入場 QR Code"
                        maxW="200px"
                        mx="auto"
                      />
                    </Box>
                    
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      請出示此 QR Code 作為入場憑證
                    </Text>
                    
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={handleDownloadQR}
                      w="full"
                    >
                      下載 QR Code
                    </Button>
                  </VStack>
                ) : (
                  <Box p={8} textAlign="center">
                    <Text color="gray.500">QR Code 生成中...</Text>
                  </Box>
                )}

                <Divider />

                {/* Action Buttons */}
                <VStack spacing={3}>
                  <Button
                    leftIcon={<ViewIcon />}
                    colorScheme="green"
                    size="lg"
                    onClick={handleViewMyTickets}
                    w="full"
                  >
                    查看我的票券
                  </Button>
                  
                  <Button
                    leftIcon={<ExternalLinkIcon />}
                    variant="outline"
                    onClick={handleBackToEvent}
                    w="full"
                  >
                    回到活動頁面
                  </Button>
                </VStack>

                {/* Important Notes */}
                <Alert status="info" size="sm">
                  <AlertIcon />
                  <Box fontSize="sm">
                    <Text fontWeight="bold">重要提醒：</Text>
                    <Text>
                      1. 請妥善保存此 QR Code<br/>
                      2. 活動當天請出示 QR Code 入場<br/>
                      3. 確認郵件已發送至您的信箱
                    </Text>
                  </Box>
                </Alert>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default RegistrationConfirmationPage;