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
  useToast,
  Divider,
  Spinner,
  Center,
  Icon,
  Badge,
  Progress,
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon, InfoIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { PaymentStatusResponse } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';

interface PaymentStatusPageProps {
  paymentId: string;
  eventId?: string;
  onSuccess?: () => void;
  onFailure?: () => void;
  onCancel?: () => void;
}

const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({
  paymentId,
  eventId,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (paymentId) {
      startStatusPolling();
    }
  }, [paymentId]);

  const startStatusPolling = () => {
    let pollCount = 0;
    const maxPolls = 60; // 3 minutes with 3-second intervals

    const poll = async () => {
      try {
        const status = await paymentService.getPaymentStatus(paymentId);
        setPaymentStatus(status);
        setIsLoading(false);
        setPollingCount(pollCount);

        // Check if payment is in a final state
        if (['completed', 'failed', 'cancelled', 'refunded'].includes(status.status)) {
          handleFinalStatus(status);
          return; // Stop polling
        }

        // Continue polling if not in final state and under max polls
        pollCount++;
        if (pollCount < maxPolls) {
          setTimeout(poll, 3000); // Poll every 3 seconds
        } else {
          // Timeout reached
          setError('付款狀態檢查超時，請手動重新整理頁面');
        }
      } catch (err: any) {
        console.error('Error polling payment status:', err);
        setError(err.message || '無法取得付款狀態');
        setIsLoading(false);
      }
    };

    poll();
  };

  const handleFinalStatus = (status: PaymentStatusResponse) => {
    switch (status.status) {
      case 'completed':
        toast({
          title: '付款成功！',
          description: '您的付款已成功處理，報名完成。',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Redirect to confirmation page if payment is for an event registration
        if (status.payment.resourceType === 'event') {
          router.push(`/registration/confirmation/${status.payment.id}`);
        } else if (onSuccess) {
          onSuccess();
        }
        break;
      
      case 'failed':
        toast({
          title: '付款失敗',
          description: '付款處理失敗，請重新嘗試。',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        if (onFailure) onFailure();
        break;
      
      case 'cancelled':
        toast({
          title: '付款已取消',
          description: '您已取消付款流程。',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        if (onCancel) onCancel();
        break;
      
      case 'refunded':
        toast({
          title: '付款已退款',
          description: '此筆付款已處理退款。',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        break;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckIcon;
      case 'failed':
        return WarningIcon;
      case 'cancelled':
        return InfoIcon;
      case 'refunded':
        return InfoIcon;
      case 'processing':
      case 'pending':
      default:
        return InfoIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'orange';
      case 'refunded':
        return 'blue';
      case 'processing':
      case 'pending':
      default:
        return 'blue';
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'completed':
        return '付款成功';
      case 'failed':
        return '付款失敗';
      case 'cancelled':
        return '付款已取消';
      case 'refunded':
        return '付款已退款';
      case 'processing':
        return '付款處理中';
      case 'pending':
        return '等待付款';
      default:
        return '付款狀態未知';
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'completed':
        return '恭喜！您的付款已成功處理，活動報名完成。您將收到確認郵件。';
      case 'failed':
        return '很抱歉，付款處理失敗。請檢查您的付款資訊或選擇其他付款方式重新嘗試。';
      case 'cancelled':
        return '付款流程已取消。如需報名活動，請重新開始付款流程。';
      case 'refunded':
        return '此筆付款已處理退款，金額將退回您的原付款方式。';
      case 'processing':
        return '系統正在處理您的付款，請稍候。這通常需要幾分鐘時間。';
      case 'pending':
        return '等待付款確認中，請完成付款流程。';
      default:
        return '無法確定付款狀態，請聯繫客服。';
    }
  };

  const handleRetryPayment = () => {
    if (eventId) {
      router.push(`/event/${eventId}/register`);
    } else {
      router.back();
    }
  };

  const handleGoToEvent = () => {
    if (eventId) {
      router.push(`/event/${eventId}`);
    } else {
      router.push('/events');
    }
  };

  if (isLoading) {
    return (
      <Container maxW="md" py={8}>
        <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <Center>
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text>檢查付款狀態中...</Text>
                <Text fontSize="sm" color="gray.500">
                  請稍候，正在確認您的付款結果
                </Text>
              </VStack>
            </Center>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="md" py={8}>
        <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={6} textAlign="center">
              <Icon as={WarningIcon} boxSize={16} color="red.500" />
              <Heading as="h2" size="lg" color="red.600">
                發生錯誤
              </Heading>
              <Text color="gray.600">{error}</Text>
              
              <VStack spacing={3} w="full">
                <Button
                  colorScheme="blue"
                  onClick={() => window.location.reload()}
                  w="full"
                >
                  重新載入
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRetryPayment}
                  w="full"
                >
                  重新嘗試付款
                </Button>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (!paymentStatus) {
    return (
      <Container maxW="md" py={8}>
        <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
          <CardBody>
            <Center>
              <Text>無法取得付款資訊</Text>
            </Center>
          </CardBody>
        </Card>
      </Container>
    );
  }

  const isProcessing = ['pending', 'processing'].includes(paymentStatus.status);
  const isSuccess = paymentStatus.status === 'completed';
  const isFailed = paymentStatus.status === 'failed';

  return (
    <Container maxW="md" py={8}>
      <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={6} textAlign="center">
            <Icon 
              as={getStatusIcon(paymentStatus.status)} 
              boxSize={16} 
              color={`${getStatusColor(paymentStatus.status)}.500`} 
            />
            
            <Heading as="h2" size="lg" color={`${getStatusColor(paymentStatus.status)}.600`}>
              {getStatusTitle(paymentStatus.status)}
            </Heading>
            
            <Text color="gray.600" lineHeight="tall">
              {getStatusDescription(paymentStatus.status)}
            </Text>

            <Badge 
              colorScheme={getStatusColor(paymentStatus.status)} 
              fontSize="md" 
              px={4} 
              py={2}
              borderRadius="full"
            >
              {paymentService.getPaymentStatusText(paymentStatus.status)}
            </Badge>

            {isProcessing && (
              <Box w="full">
                <Progress 
                  size="sm" 
                  isIndeterminate 
                  colorScheme="blue" 
                  borderRadius="full"
                />
                <Text fontSize="sm" color="gray.500" mt={2}>
                  已檢查 {pollingCount} 次，最多等待 3 分鐘
                </Text>
              </Box>
            )}

            {/* Payment Details */}
            <Box w="full" p={4} bg="gray.50" borderRadius="md">
              <VStack spacing={2}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">付款編號：</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {paymentStatus.payment.id.substring(0, 8)}...
                  </Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">付款金額：</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {paymentService.formatAmount(paymentStatus.payment.finalAmount)}
                  </Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">付款方式：</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {paymentService.getPaymentMethodName(paymentStatus.payment.paymentMethod)}
                  </Text>
                </HStack>
                
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">處理時間：</Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {new Date(paymentStatus.payment.updatedAt).toLocaleString('zh-TW')}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Action Buttons */}
            <VStack spacing={3} w="full">
              {isSuccess && (
                <Button
                  colorScheme="green"
                  size="lg"
                  rightIcon={<ArrowForwardIcon />}
                  onClick={handleGoToEvent}
                  w="full"
                >
                  查看活動詳情
                </Button>
              )}
              
              {isFailed && (
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleRetryPayment}
                  w="full"
                >
                  重新嘗試付款
                </Button>
              )}
              
              {!isSuccess && (
                <Button
                  variant="outline"
                  onClick={handleGoToEvent}
                  w="full"
                >
                  回到活動頁面
                </Button>
              )}
            </VStack>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default PaymentStatusPage;