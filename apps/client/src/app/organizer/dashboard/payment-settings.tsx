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
  CardHeader,
  useToast,
  Divider,
  SimpleGrid,
  Badge,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Center,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  SettingsIcon, 
  DeleteIcon, 
  CheckIcon, 
  InfoIcon,
  ChevronDownIcon 
} from '@chakra-ui/icons';
import { FaCreditCard, FaApplePay, FaGooglePay } from 'react-icons/fa';
import { PaymentProvider } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';
import PaymentProviderCredentialsForm from '../../../components/features/organizer/PaymentProviderCredentialsForm';

const PaymentSettingsPage: React.FC = () => {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [actionType, setActionType] = useState<'create' | 'edit'>('create');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    loadPaymentProviders();
  }, []);

  const loadPaymentProviders = async () => {
    try {
      setIsLoading(true);
      const providerList = await paymentService.getPaymentProviders();
      setProviders(providerList);
      setError(null);
    } catch (err: any) {
      console.error('Error loading payment providers:', err);
      setError(err.message || '無法載入付款方式設定');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProvider = (providerId: string) => {
    setSelectedProvider(null);
    setSelectedProviderId(providerId);
    setActionType('create');
    onOpen();
  };

  const handleEditProvider = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    setSelectedProviderId(provider.providerId);
    setActionType('edit');
    onOpen();
  };

  const handleSetDefault = async (providerId: string) => {
    try {
      await paymentService.setDefaultPaymentProvider(providerId);
      toast({
        title: '設定已更新',
        description: '預設付款方式已更改',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await loadPaymentProviders();
    } catch (err: any) {
      toast({
        title: '設定失敗',
        description: err.message || '無法更改預設付款方式',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveProvider = async (providerId: string) => {
    if (!confirm('確定要移除此付款方式嗎？這將會停用相關的付款功能。')) {
      return;
    }

    try {
      await paymentService.removePaymentProvider(providerId);
      toast({
        title: '付款方式已移除',
        description: '付款方式設定已成功移除',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await loadPaymentProviders();
    } catch (err: any) {
      toast({
        title: '移除失敗',
        description: err.message || '無法移除付款方式',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSaveProvider = async (provider: PaymentProvider) => {
    onClose();
    toast({
      title: actionType === 'create' ? '付款方式已新增' : '設定已更新',
      description: '付款方式設定已成功儲存',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    await loadPaymentProviders();
  };

  const getProviderIcon = (providerId: string) => {
    switch (providerId) {
      case 'ecpay':
        return FaCreditCard;
      case 'stripe':
        return FaCreditCard;
      case 'paypal':
        return FaCreditCard;
      case 'applepay':
        return FaApplePay;
      case 'googlepay':
        return FaGooglePay;
      default:
        return FaCreditCard;
    }
  };

  const getProviderName = (providerId: string): string => {
    switch (providerId) {
      case 'ecpay':
        return 'ECPay 綠界科技';
      case 'stripe':
        return 'Stripe';
      case 'paypal':
        return 'PayPal';
      case 'applepay':
        return 'Apple Pay';
      case 'googlepay':
        return 'Google Pay';
      default:
        return providerId;
    }
  };

  const getProviderColor = (providerId: string): string => {
    switch (providerId) {
      case 'ecpay':
        return 'green';
      case 'stripe':
        return 'purple';
      case 'paypal':
        return 'blue';
      case 'applepay':
        return 'gray';
      case 'googlepay':
        return 'red';
      default:
        return 'gray';
    }
  };

  const availableProviders = [
    { id: 'ecpay', name: 'ECPay 綠界科技', description: '台灣主要的第三方支付服務' },
    // Future providers can be added here
    // { id: 'stripe', name: 'Stripe', description: '國際信用卡支付服務' },
    // { id: 'paypal', name: 'PayPal', description: 'PayPal 數位錢包支付' },
  ];

  const getAvailableProviders = () => {
    const configuredProviderIds = providers.map(p => p.providerId);
    return availableProviders.filter(p => !configuredProviderIds.includes(p.id));
  };

  if (isLoading) {
    return (
      <Container maxW="6xl" py={8}>
        <Center>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text>載入付款設定中...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            付款方式設定
          </Heading>
          <Text color="gray.600">
            管理您的付款方式，設定不同的支付服務提供商
          </Text>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Add Provider Section */}
        {getAvailableProviders().length > 0 && (
          <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading as="h2" size="md">
                  新增付款方式
                </Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {getAvailableProviders().map((provider) => (
                  <Card
                    key={provider.id}
                    variant="outline"
                    _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
                    cursor="pointer"
                    onClick={() => handleAddProvider(provider.id)}
                  >
                    <CardBody>
                      <VStack spacing={3}>
                        <Icon 
                          as={getProviderIcon(provider.id)} 
                          boxSize={10} 
                          color={`${getProviderColor(provider.id)}.500`} 
                        />
                        <VStack spacing={1} textAlign="center">
                          <Text fontWeight="bold">{provider.name}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {provider.description}
                          </Text>
                        </VStack>
                        <Button size="sm" colorScheme="blue" leftIcon={<AddIcon />}>
                          新增
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Configured Providers */}
        <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Heading as="h2" size="md">
                已設定的付款方式
              </Heading>
              <Badge colorScheme="blue">
                {providers.length} 個付款方式
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            {providers.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={InfoIcon} boxSize={12} color="gray.400" />
                  <Text color="gray.500" textAlign="center">
                    尚未設定任何付款方式<br />
                    請先新增付款方式以開始收款
                  </Text>
                </VStack>
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={4}>
                {providers.map((provider) => (
                  <Card key={provider.id} variant="outline">
                    <CardBody>
                      <Flex justify="space-between" align="start">
                        <HStack spacing={4} flex={1}>
                          <Icon 
                            as={getProviderIcon(provider.providerId)} 
                            boxSize={8} 
                            color={`${getProviderColor(provider.providerId)}.500`} 
                          />
                          <VStack spacing={1} align="start" flex={1}>
                            <HStack>
                              <Text fontWeight="bold">
                                {getProviderName(provider.providerId)}
                              </Text>
                              {provider.isDefault && (
                                <Badge colorScheme="green" size="sm">
                                  預設
                                </Badge>
                              )}
                              {!provider.isActive && (
                                <Badge colorScheme="gray" size="sm">
                                  已停用
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              設定時間：{new Date(provider.createdAt).toLocaleDateString('zh-TW')}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              更新時間：{new Date(provider.updatedAt).toLocaleDateString('zh-TW')}
                            </Text>
                          </VStack>
                        </HStack>

                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<ChevronDownIcon />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<SettingsIcon />}
                              onClick={() => handleEditProvider(provider)}
                            >
                              編輯設定
                            </MenuItem>
                            {!provider.isDefault && (
                              <MenuItem
                                icon={<CheckIcon />}
                                onClick={() => handleSetDefault(provider.providerId)}
                              >
                                設為預設
                              </MenuItem>
                            )}
                            <MenuItem
                              icon={<DeleteIcon />}
                              color="red.500"
                              onClick={() => handleRemoveProvider(provider.providerId)}
                            >
                              移除
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </CardBody>
        </Card>

        {/* Information Section */}
        <Card bg="blue.50" borderWidth={1} borderColor="blue.200">
          <CardBody>
            <VStack spacing={3} align="start">
              <HStack>
                <Icon as={InfoIcon} color="blue.500" />
                <Text fontWeight="bold" color="blue.700">
                  付款方式說明
                </Text>
              </HStack>
              <VStack spacing={2} align="start" fontSize="sm" color="blue.600">
                <Text>• 每個付款方式需要設定對應的服務商憑證</Text>
                <Text>• 設為預設的付款方式將優先用於新的付款</Text>
                <Text>• 停用的付款方式不會出現在付款選項中</Text>
                <Text>• 所有付款資料都會以加密方式安全儲存</Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Provider Configuration Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionType === 'create' ? '新增付款方式' : '編輯付款方式'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PaymentProviderCredentialsForm
              provider={selectedProvider}
              providerId={selectedProviderId}
              onSave={handleSaveProvider}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PaymentSettingsPage;