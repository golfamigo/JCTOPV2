import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Switch,
  Alert,
  AlertIcon,
  AlertDescription,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Divider,
  Badge,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Textarea,
  Code,
} from '@chakra-ui/react';
import { CheckIcon, InfoIcon, WarningIcon } from '@chakra-ui/icons';
import { FaCreditCard } from 'react-icons/fa';
import { PaymentProvider, PaymentProviderDto, UpdatePaymentProviderDto } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';

interface PaymentProviderCredentialsFormProps {
  provider?: PaymentProvider; // If editing existing provider
  providerId: string; // 'ecpay', 'stripe', etc.
  onSave: (provider: PaymentProvider) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ECPayCredentials {
  merchantId: string;
  hashKey: string;
  hashIV: string;
  environment: 'development' | 'production';
  returnUrl?: string;
}

const PaymentProviderCredentialsForm: React.FC<PaymentProviderCredentialsFormProps> = ({
  provider,
  providerId,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [credentials, setCredentials] = useState<ECPayCredentials>({
    merchantId: '',
    hashKey: '',
    hashIV: '',
    environment: 'development',
    returnUrl: '',
  });
  
  const [isActive, setIsActive] = useState(true);
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    if (provider) {
      // If editing existing provider, we can't show credentials (they're encrypted)
      // But we can show other settings
      setIsActive(provider.isActive);
      setIsDefault(provider.isDefault);
    }
  }, [provider]);

  const validateCredentials = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.merchantId) {
      newErrors.merchantId = '商店代號為必填項目';
    } else if (!/^\d+$/.test(credentials.merchantId)) {
      newErrors.merchantId = '商店代號必須為數字';
    }

    if (!credentials.hashKey) {
      newErrors.hashKey = 'HashKey 為必填項目';
    } else if (!/^[A-Za-z0-9]+$/.test(credentials.hashKey)) {
      newErrors.hashKey = 'HashKey 只能包含英數字';
    }

    if (!credentials.hashIV) {
      newErrors.hashIV = 'HashIV 為必填項目';
    } else if (!/^[A-Za-z0-9]+$/.test(credentials.hashIV)) {
      newErrors.hashIV = 'HashIV 只能包含英數字';
    }

    if (credentials.returnUrl && !isValidUrl(credentials.returnUrl)) {
      newErrors.returnUrl = '請輸入有效的 URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleTestCredentials = async () => {
    if (!validateCredentials()) {
      setTestResult({
        success: false,
        message: '請先修正表單錯誤'
      });
      return;
    }

    setTestResult(null);
    
    try {
      const validation = paymentService.validateECPayCredentials(credentials);
      
      if (validation.valid) {
        setTestResult({
          success: true,
          message: '憑證格式驗證通過！實際連線測試需要儲存後進行。'
        });
      } else {
        setTestResult({
          success: false,
          message: validation.message || '憑證驗證失敗'
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || '憑證測試失敗'
      });
    }
  };

  const handleSave = async () => {
    if (!validateCredentials()) {
      toast({
        title: '表單驗證失敗',
        description: '請修正表單中的錯誤',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);

    try {
      let savedProvider: PaymentProvider;

      if (provider) {
        // Update existing provider
        const updateData: UpdatePaymentProviderDto = {
          credentials,
          isActive,
          isDefault,
        };
        savedProvider = await paymentService.updatePaymentProvider(provider.providerId, updateData);
      } else {
        // Create new provider
        const providerData: PaymentProviderDto = {
          providerId,
          providerName: getProviderName(providerId),
          credentials,
          isActive,
          isDefault,
        };
        savedProvider = await paymentService.addPaymentProvider(providerData);
      }

      toast({
        title: provider ? '設定已更新' : '付款方式已新增',
        description: `${getProviderName(providerId)} 設定已成功儲存`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      onSave(savedProvider);
    } catch (error: any) {
      console.error('Error saving payment provider:', error);
      toast({
        title: '儲存失敗',
        description: error.message || '無法儲存付款方式設定',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getProviderName = (id: string): string => {
    switch (id) {
      case 'ecpay':
        return 'ECPay 綠界科技';
      case 'stripe':
        return 'Stripe';
      case 'paypal':
        return 'PayPal';
      default:
        return id;
    }
  };

  const renderECPayForm = () => (
    <VStack spacing={6}>
      {/* Basic Credentials */}
      <VStack spacing={4} w="full">
        <FormControl isInvalid={!!errors.merchantId}>
          <FormLabel>商店代號 (MerchantID)</FormLabel>
          <Input
            value={credentials.merchantId}
            onChange={(e) => setCredentials({ ...credentials, merchantId: e.target.value })}
            placeholder="例如：2000132"
            maxLength={10}
          />
          <FormErrorMessage>{errors.merchantId}</FormErrorMessage>
          <FormHelperText>ECPay 提供的商店代號，通常為 7 位數字</FormHelperText>
        </FormControl>

        <FormControl isInvalid={!!errors.hashKey}>
          <FormLabel>HashKey</FormLabel>
          <Input
            type="password"
            value={credentials.hashKey}
            onChange={(e) => setCredentials({ ...credentials, hashKey: e.target.value })}
            placeholder="請輸入 ECPay HashKey"
            maxLength={50}
          />
          <FormErrorMessage>{errors.hashKey}</FormErrorMessage>
          <FormHelperText>ECPay 提供的 HashKey，用於加密驗證</FormHelperText>
        </FormControl>

        <FormControl isInvalid={!!errors.hashIV}>
          <FormLabel>HashIV</FormLabel>
          <Input
            type="password"
            value={credentials.hashIV}
            onChange={(e) => setCredentials({ ...credentials, hashIV: e.target.value })}
            placeholder="請輸入 ECPay HashIV"
            maxLength={50}
          />
          <FormErrorMessage>{errors.hashIV}</FormErrorMessage>
          <FormHelperText>ECPay 提供的 HashIV，用於加密驗證</FormHelperText>
        </FormControl>

        <FormControl>
          <FormLabel>環境設定</FormLabel>
          <Select
            value={credentials.environment}
            onChange={(e) => setCredentials({ 
              ...credentials, 
              environment: e.target.value as 'development' | 'production' 
            })}
          >
            <option value="development">測試環境 (Staging)</option>
            <option value="production">正式環境 (Production)</option>
          </Select>
          <FormHelperText>
            {credentials.environment === 'development' 
              ? '使用 ECPay 測試環境，適合開發和測試' 
              : '使用 ECPay 正式環境，實際收款'}
          </FormHelperText>
        </FormControl>

        <FormControl isInvalid={!!errors.returnUrl}>
          <FormLabel>自訂回傳網址 (選填)</FormLabel>
          <Input
            value={credentials.returnUrl}
            onChange={(e) => setCredentials({ ...credentials, returnUrl: e.target.value })}
            placeholder="https://your-domain.com/payment/callback"
          />
          <FormErrorMessage>{errors.returnUrl}</FormErrorMessage>
          <FormHelperText>自訂付款完成後的回傳網址，留空使用系統預設</FormHelperText>
        </FormControl>
      </VStack>

      {/* Test Credentials */}
      <Box w="full" p={4} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.400">
        <VStack spacing={3} align="start">
          <HStack>
            <Icon as={InfoIcon} color="blue.500" />
            <Text fontWeight="medium" color="blue.700">憑證測試</Text>
          </HStack>
          <Text fontSize="sm" color="blue.600">
            在儲存前，建議先測試憑證格式是否正確
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={handleTestCredentials}
          >
            測試憑證
          </Button>
          
          {testResult && (
            <Alert status={testResult.success ? 'success' : 'error'} size="sm">
              <AlertIcon />
              <AlertDescription fontSize="sm">{testResult.message}</AlertDescription>
            </Alert>
          )}
        </VStack>
      </Box>
    </VStack>
  );

  const renderConfigurationHelp = () => (
    <VStack spacing={4} align="start">
      <Heading as="h4" size="sm">如何取得 ECPay 憑證？</Heading>
      
      <Box>
        <Text fontWeight="medium" mb={2}>1. 登入 ECPay 管理後台</Text>
        <Text fontSize="sm" color="gray.600" mb={3}>
          前往 ECPay 特店管理後台，使用您的帳號密碼登入
        </Text>
      </Box>

      <Box>
        <Text fontWeight="medium" mb={2}>2. 查看商店資訊</Text>
        <Text fontSize="sm" color="gray.600" mb={3}>
          在「系統開發管理」→「系統介接設定」中可以找到：
        </Text>
        <VStack spacing={1} align="start" pl={4}>
          <Text fontSize="sm">• 商店代號 (MerchantID)</Text>
          <Text fontSize="sm">• HashKey</Text>
          <Text fontSize="sm">• HashIV</Text>
        </VStack>
      </Box>

      <Box>
        <Text fontWeight="medium" mb={2}>3. 測試環境</Text>
        <Text fontSize="sm" color="gray.600" mb={1}>
          測試環境使用以下範例憑證：
        </Text>
        <Box p={3} bg="gray.100" borderRadius="md" fontSize="sm" fontFamily="mono">
          <Text>商店代號: 2000132</Text>
          <Text>HashKey: 5294y06JbISpM5x9</Text>
          <Text>HashIV: v77hoKGq4kWxNNIS</Text>
        </Box>
      </Box>

      <Alert status="warning" size="sm">
        <AlertIcon />
        <AlertDescription fontSize="sm">
          正式環境請使用您實際的 ECPay 商店憑證，測試憑證僅供開發測試使用
        </AlertDescription>
      </Alert>
    </VStack>
  );

  return (
    <Card bg={bgColor} borderWidth={1} borderColor={borderColor}>
      <CardHeader>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <Icon as={FaCreditCard} color="blue.500" boxSize={6} />
            <VStack spacing={0} align="start">
              <Heading as="h3" size="md">
                {getProviderName(providerId)} 憑證設定
              </Heading>
              <Text fontSize="sm" color="gray.600">
                {provider ? '編輯付款方式憑證' : '新增付款方式憑證'}
              </Text>
            </VStack>
          </HStack>
          <Badge colorScheme={providerId === 'ecpay' ? 'green' : 'blue'}>
            {providerId.toUpperCase()}
          </Badge>
        </HStack>
      </CardHeader>

      <CardBody>
        <Tabs>
          <TabList>
            <Tab>憑證設定</Tab>
            <Tab>設定說明</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              <VStack spacing={6}>
                {providerId === 'ecpay' && renderECPayForm()}

                <Divider />

                {/* Provider Settings */}
                <VStack spacing={4} w="full">
                  <FormControl>
                    <HStack justify="space-between">
                      <VStack spacing={0} align="start">
                        <FormLabel mb={0}>啟用此付款方式</FormLabel>
                        <FormHelperText mt={0}>
                          停用後，使用者將無法選擇此付款方式
                        </FormHelperText>
                      </VStack>
                      <Switch
                        isChecked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        colorScheme="green"
                      />
                    </HStack>
                  </FormControl>

                  <FormControl>
                    <HStack justify="space-between">
                      <VStack spacing={0} align="start">
                        <FormLabel mb={0}>設為預設付款方式</FormLabel>
                        <FormHelperText mt={0}>
                          新的付款將優先使用此付款方式
                        </FormHelperText>
                      </VStack>
                      <Switch
                        isChecked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        colorScheme="blue"
                      />
                    </HStack>
                  </FormControl>
                </VStack>

                <Divider />

                {/* Action Buttons */}
                <HStack spacing={3} w="full" justify="end">
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    isDisabled={isSaving || isLoading}
                  >
                    取消
                  </Button>
                  <Button
                    colorScheme="blue"
                    onClick={handleSave}
                    isLoading={isSaving || isLoading}
                    leftIcon={<CheckIcon />}
                  >
                    {provider ? '更新設定' : '儲存設定'}
                  </Button>
                </HStack>
              </VStack>
            </TabPanel>

            <TabPanel px={0}>
              {providerId === 'ecpay' && renderConfigurationHelp()}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default PaymentProviderCredentialsForm;