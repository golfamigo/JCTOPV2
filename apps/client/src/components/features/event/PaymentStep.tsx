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
  Container,
  Card,
  CardBody,
  useToast,
  Divider,
  SimpleGrid,
  Spinner,
  Center,
  RadioGroup,
  Radio,
  Stack,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckIcon } from '@chakra-ui/icons';
import { FaCreditCard } from 'react-icons/fa';
import { Event, RegistrationFormData, PaymentResponse } from '@jctop-event/shared-types';
import StepIndicator from '../../common/StepIndicator';
import paymentService from '../../../services/paymentService';

interface PaymentStepProps {
  event: Event;
  formData: RegistrationFormData;
  onSuccess: (paymentResponse: PaymentResponse) => void;
  onBack: () => void;
  isLoading?: boolean;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  event,
  formData,
  onSuccess,
  onBack,
  isLoading = false,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods] = useState(paymentService.getECPayPaymentMethods());
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handlePaymentInitiation = async () => {
    if (isProcessing || isLoading) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Validate payment amount
      const validation = paymentService.validateAmount(formData.totalAmount);
      if (!validation.valid) {
        setError(validation.message || '金額驗證失敗');
        return;
      }

      // Initiate event payment
      const paymentResponse = await paymentService.initiateEventPayment(event.id, {
        amount: formData.totalAmount,
        description: `${event.title} - 活動報名`,
        paymentMethod: selectedPaymentMethod,
        metadata: {
          eventId: event.id,
          eventTitle: event.title,
          ticketSelections: formData.ticketSelections,
          customFieldValues: formData.customFieldValues,
          discountCode: formData.discountCode,
          discountAmount: formData.discountAmount,
        }
      });

      // Handle successful payment initiation
      if (paymentResponse.status === 'requires_action' && paymentResponse.redirectUrl) {
        // For ECPay, redirect to payment page
        window.location.href = paymentResponse.redirectUrl;
      } else {
        onSuccess(paymentResponse);
      }

    } catch (err: any) {
      console.error('Payment initiation failed:', err);
      setError(err.message || '支付初始化失敗，請稍後再試');
      
      toast({
        title: '支付失敗',
        description: err.message || '支付初始化失敗，請稍後再試',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
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

  return (
    <Container maxW="4xl" py={8}>
      <StepIndicator 
        steps={[
          { title: '選擇票券' },
          { title: '填寫資訊' },
          { title: '付款確認' }
        ]}
        currentStep={2} 
      />
      
      <Box mt={8}>
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          付款確認
        </Heading>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Payment Summary */}
          <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <Heading as="h3" size="md" mb={4}>
                付款摘要
              </Heading>
              
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text>活動名稱：</Text>
                  <Text fontWeight="medium">{event.title}</Text>
                </HStack>
                
                <Divider />
                
                {/* Ticket Summary */}
                {formData.ticketSelections.map((selection, index) => (
                  <HStack key={index} justify="space-between">
                    <Text fontSize="sm">
                      票券 {index + 1} × {selection.quantity}
                    </Text>
                    <Text fontSize="sm">
                      {paymentService.formatAmount(
                        (formData.totalAmount - (formData.discountAmount || 0)) / 
                        formData.ticketSelections.reduce((sum, s) => sum + s.quantity, 0) * 
                        selection.quantity
                      )}
                    </Text>
                  </HStack>
                ))}
                
                <Divider />
                
                <HStack justify="space-between">
                  <Text>小計：</Text>
                  <Text>{paymentService.formatAmount(formData.totalAmount)}</Text>
                </HStack>
                
                {formData.discountAmount && formData.discountAmount > 0 && (
                  <HStack justify="space-between" color="green.500">
                    <Text>折扣：</Text>
                    <Text>-{paymentService.formatAmount(formData.discountAmount)}</Text>
                  </HStack>
                )}
                
                <Divider />
                
                <HStack justify="space-between" fontWeight="bold" fontSize="lg">
                  <Text>總計：</Text>
                  <Text color="blue.500">
                    {paymentService.formatAmount(
                      formData.totalAmount - (formData.discountAmount || 0)
                    )}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Payment Method Selection */}
          <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
            <CardBody>
              <Heading as="h3" size="md" mb={4}>
                選擇付款方式
              </Heading>
              
              <RadioGroup 
                value={selectedPaymentMethod} 
                onChange={setSelectedPaymentMethod}
              >
                <Stack spacing={3}>
                  {paymentMethods.map((method) => (
                    <Box
                      key={method.code}
                      p={3}
                      borderWidth={1}
                      borderRadius="md"
                      borderColor={selectedPaymentMethod === method.code ? 'blue.500' : 'gray.200'}
                      bg={selectedPaymentMethod === method.code ? 'blue.50' : 'transparent'}
                      _hover={{ borderColor: 'blue.300' }}
                      cursor="pointer"
                      onClick={() => setSelectedPaymentMethod(method.code)}
                    >
                      <HStack spacing={3}>
                        <Radio value={method.code} />
                        <Icon as={getPaymentMethodIcon(method.code)} color="gray.500" />
                        <Text flex={1}>{method.name}</Text>
                        <Badge 
                          colorScheme={getPaymentMethodColor(method.code)} 
                          variant="subtle"
                        >
                          {method.code}
                        </Badge>
                      </HStack>
                    </Box>
                  ))}
                </Stack>
              </RadioGroup>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Error Alert */}
        {error && (
          <Alert status="error" mt={6} borderRadius="md">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Security Notice */}
        <Box mt={6} p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.400">
          <HStack spacing={2}>
            <Icon as={CheckIcon} color="blue.500" />
            <Text fontSize="sm" color="blue.700">
              您的付款資訊將透過安全加密傳輸，我們不會儲存您的信用卡資訊。
            </Text>
          </HStack>
        </Box>

        {/* Navigation Buttons */}
        <HStack justify="space-between" mt={8}>
          <Button
            leftIcon={<ArrowBackIcon />}
            variant="outline"
            onClick={onBack}
            isDisabled={isProcessing || isLoading}
          >
            返回
          </Button>
          
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handlePaymentInitiation}
            isLoading={isProcessing || isLoading}
            loadingText="處理中..."
            rightIcon={isProcessing ? <Spinner size="sm" /> : <Icon as={FaCreditCard} />}
          >
            {isProcessing ? '處理中...' : '前往付款'}
          </Button>
        </HStack>
      </Box>
    </Container>
  );
};

export default PaymentStep;