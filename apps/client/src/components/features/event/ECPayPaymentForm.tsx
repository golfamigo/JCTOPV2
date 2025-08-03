import React, { useState, useEffect } from 'react';
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
  Card,
  CardBody,
  useToast,
  RadioGroup,
  Radio,
  Stack,
  Badge,
  Icon,
  Divider,
  Progress,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon } from '@chakra-ui/icons';
import { FaCreditCard } from 'react-icons/fa';
import { PaymentResponse, PaymentStatusResponse } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';

interface ECPayPaymentFormProps {
  paymentId: string;
  amount: number;
  currency?: string;
  description: string;
  onSuccess: (paymentResponse: PaymentResponse) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const ECPayPaymentForm: React.FC<ECPayPaymentFormProps> = ({
  paymentId,
  amount,
  currency = 'TWD',
  description,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const paymentMethods = paymentService.getECPayPaymentMethods();

  useEffect(() => {
    // Start polling payment status when component mounts
    startPaymentStatusPolling();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [paymentId]);

  const startPaymentStatusPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const poll = () => {
      paymentService.getPaymentStatus(paymentId)
        .then((status) => {
          setPaymentStatus(status);
          
          if (status.status === 'completed') {
            toast({
              title: '付款成功',
              description: '您的付款已成功處理',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            onSuccess({ 
              paymentId, 
              status: 'completed', 
              amount, 
              currency 
            } as PaymentResponse);
            if (pollingInterval) clearInterval(pollingInterval);
          } else if (status.status === 'failed') {
            setError('付款失敗，請重試');
            onError('付款失敗，請重試');
            if (pollingInterval) clearInterval(pollingInterval);
          } else if (status.status === 'cancelled') {
            setError('付款已取消');
            if (onCancel) onCancel();
            if (pollingInterval) clearInterval(pollingInterval);
          }
        })
        .catch((err) => {
          console.error('Error polling payment status:', err);
        });
    };

    // Poll immediately and then every 3 seconds
    poll();
    const interval = setInterval(poll, 3000);
    setPollingInterval(interval);
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setError(null);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Credit':
        return FaCreditCard;
      case 'ATM':
        return CheckIcon;
      case 'CVS':
      case 'BARCODE':
        return CheckIcon;
      case 'ApplePay':
      case 'GooglePay':
        return FaCreditCard;
      default:
        return FaCreditCard;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Credit':
        return 'blue';
      case 'ATM':
        return 'green';
      case 'CVS':
      case 'BARCODE':
        return 'orange';
      case 'ApplePay':
        return 'gray';
      case 'GooglePay':
        return 'red';
      default:
        return 'purple';
    }
  };

  const getPaymentMethodDescription = (method: string) => {
    switch (method) {
      case 'Credit':
        return '支援 Visa、MasterCard、JCB 等信用卡';
      case 'ATM':
        return '透過 ATM 轉帳付款，需 1-3 個工作天入帳';
      case 'CVS':
        return '7-11、全家、萊爾富、OK 超商代碼繳費';
      case 'BARCODE':
        return '7-11、全家、萊爾富、OK 超商條碼繳費';
      case 'ApplePay':
        return '使用 Apple Pay 快速付款';
      case 'GooglePay':
        return '使用 Google Pay 快速付款';
      default:
        return '系統自動選擇最適合的付款方式';
    }
  };

  const getStatusText = (status: string) => {
    return paymentService.getPaymentStatusText(status);
  };

  const getStatusColor = (status: string) => {
    return paymentService.getPaymentStatusColor(status);
  };

  // If payment is processing or completed, show status
  if (paymentStatus && ['processing', 'completed', 'failed'].includes(paymentStatus.status)) {
    return (
      <Card bg={bgColor} borderWidth={1} borderColor={borderColor} maxW="md" mx="auto">
        <CardBody>
          <VStack spacing={4} textAlign="center">
            <Icon 
              as={paymentStatus.status === 'completed' ? CheckIcon : InfoIcon} 
              boxSize={12} 
              color={paymentStatus.status === 'completed' ? 'green.500' : 'blue.500'} 
            />
            
            <Heading as="h3" size="md">
              {paymentStatus.status === 'completed' ? '付款成功' : '付款處理中'}
            </Heading>
            
            <Text color="gray.600">
              {paymentStatus.status === 'completed' 
                ? '您的付款已成功處理，請等待系統確認。' 
                : '正在處理您的付款，請稍候...'}
            </Text>
            
            <Badge 
              colorScheme={paymentStatus.status === 'completed' ? 'green' : 'blue'} 
              fontSize="sm" 
              px={3} 
              py={1}
            >
              {getStatusText(paymentStatus.status)}
            </Badge>
            
            {paymentStatus.status === 'processing' && (
              <Progress size="sm" isIndeterminate colorScheme="blue" w="full" />
            )}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card bg={bgColor} borderWidth={1} borderColor={borderColor} maxW="lg" mx="auto">
      <CardBody>
        <VStack spacing={6}>
          <Heading as="h2" size="lg" textAlign="center">
            ECPay 綠界支付
          </Heading>
          
          {/* Payment Summary */}
          <Box w="full" p={4} bg="gray.50" borderRadius="md">
            <VStack spacing={2}>
              <Text fontSize="sm" color="gray.600">付款金額</Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {paymentService.formatAmount(amount, currency)}
              </Text>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                {description}
              </Text>
            </VStack>
          </Box>

          {/* Payment Method Selection */}
          <Box w="full">
            <Text fontSize="md" fontWeight="medium" mb={3}>
              選擇付款方式
            </Text>
            
            <RadioGroup 
              value={selectedPaymentMethod} 
              onChange={handlePaymentMethodChange}
            >
              <Stack spacing={3}>
                {paymentMethods.map((method) => (
                  <Box
                    key={method.code}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    borderColor={selectedPaymentMethod === method.code ? 'blue.500' : 'gray.200'}
                    bg={selectedPaymentMethod === method.code ? 'blue.50' : 'transparent'}
                    _hover={{ borderColor: 'blue.300', bg: 'blue.25' }}
                    cursor="pointer"
                    onClick={() => handlePaymentMethodChange(method.code)}
                    transition="all 0.2s"
                  >
                    <VStack spacing={2} align="start">
                      <HStack spacing={3} w="full">
                        <Radio value={method.code} />
                        <Icon as={getPaymentMethodIcon(method.code)} color="gray.500" />
                        <Text flex={1} fontWeight="medium">{method.name}</Text>
                        <Badge 
                          colorScheme={getPaymentMethodColor(method.code)} 
                          variant="subtle"
                        >
                          {method.code}
                        </Badge>
                      </HStack>
                      
                      <Text fontSize="sm" color="gray.600" ml={8}>
                        {getPaymentMethodDescription(method.code)}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </Stack>
            </RadioGroup>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <Box w="full" p={3} bg="green.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="green.400">
            <HStack spacing={2}>
              <Icon as={CheckIcon} color="green.500" boxSize={4} />
              <Text fontSize="sm" color="green.700">
                SSL 安全加密傳輸，您的付款資訊受到完整保護
              </Text>
            </HStack>
          </Box>

          {/* Action Buttons */}
          <HStack spacing={3} w="full">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                isDisabled={isProcessing}
                flex={1}
              >
                取消
              </Button>
            )}
            
            <Button
              colorScheme="blue"
              size="lg"
              isLoading={isProcessing}
              loadingText="處理中..."
              rightIcon={isProcessing ? <Spinner size="sm" /> : <Icon as={FaCreditCard} />}
              flex={2}
              onClick={() => {
                // This would trigger the actual ECPay payment process
                // For now, we'll simulate the process
                setIsProcessing(true);
                toast({
                  title: '前往付款頁面',
                  description: '正在為您準備付款頁面...',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            >
              {isProcessing ? '準備中...' : '確認付款'}
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ECPayPaymentForm;