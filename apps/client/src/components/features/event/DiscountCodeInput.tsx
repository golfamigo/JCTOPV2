import React, { useState, useEffect } from 'react';
import {
  Input,
  Button,
  HStack,
  VStack,
  Text,
  Alert,
  AlertIcon,
  AlertDescription,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useColorModeValue,
  Spinner,
  Box,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import registrationService from '../../../services/registrationService';
import { DiscountValidationResponse } from '@jctop-event/shared-types';

interface DiscountCodeInputProps {
  eventId: string;
  totalAmount: number;
  onDiscountApplied: (discount: DiscountValidationResponse, code?: string) => void;
  isDisabled?: boolean;
}

const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({
  eventId,
  totalAmount,
  onDiscountApplied,
  isDisabled = false,
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<DiscountValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAppliedDiscount, setHasAppliedDiscount] = useState(false);

  // Design system colors following branding guide
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const primaryColor = '#2563EB';
  const successColor = '#10B981';
  const errorColor = '#EF4444';
  const neutralMedium = '#64748B';
  const neutralLight = '#F8FAFC';

  useEffect(() => {
    // Reset validation when total amount changes
    if (hasAppliedDiscount && validationResult) {
      handleValidateCode();
    }
  }, [totalAmount]);

  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError('Please enter a discount code');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await registrationService.validateDiscountCode(eventId, code.trim(), totalAmount);
      setValidationResult(result);
      
      if (result.valid) {
        setHasAppliedDiscount(true);
        onDiscountApplied(result, code.trim());
      } else {
        setHasAppliedDiscount(false);
        setError(result.errorMessage || 'Invalid discount code');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate discount code';
      setError(errorMessage);
      setValidationResult(null);
      setHasAppliedDiscount(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveDiscount = () => {
    setCode('');
    setValidationResult(null);
    setError(null);
    setHasAppliedDiscount(false);
    onDiscountApplied({
      valid: false,
      discountAmount: 0,
      finalAmount: totalAmount,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating && code.trim()) {
      handleValidateCode();
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl isInvalid={!!error}>
        <FormLabel 
          color={neutralMedium}
          fontWeight="semibold"
          fontSize="sm"
        >
          Discount Code (Optional)
        </FormLabel>
        
        <HStack spacing={3}>
          <Input
            placeholder="Enter discount code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            isDisabled={isDisabled || isValidating}
            borderColor={borderColor}
            focusBorderColor={primaryColor}
            _placeholder={{ color: neutralMedium }}
            textTransform="uppercase"
            flex={1}
          />
          
          {!hasAppliedDiscount ? (
            <Button
              onClick={handleValidateCode}
              isLoading={isValidating}
              loadingText="Checking..."
              isDisabled={isDisabled || !code.trim() || isValidating}
              colorScheme="blue"
              backgroundColor={primaryColor}
              _hover={{ backgroundColor: '#1D4ED8' }}
              size="md"
              minW="100px"
            >
              {isValidating ? <Spinner size="sm" /> : 'Apply'}
            </Button>
          ) : (
            <Button
              onClick={handleRemoveDiscount}
              isDisabled={isDisabled}
              variant="outline"
              borderColor={errorColor}
              color={errorColor}
              _hover={{
                backgroundColor: errorColor,
                color: 'white',
              }}
              size="md"
              minW="100px"
              leftIcon={<CloseIcon boxSize={3} />}
            >
              Remove
            </Button>
          )}
        </HStack>
        
        {error && (
          <FormErrorMessage color={errorColor} fontSize="sm">
            {error}
          </FormErrorMessage>
        )}
      </FormControl>

      {/* Success Message */}
      {validationResult?.valid && (
        <Alert status="success" borderRadius="md" backgroundColor={neutralLight}>
          <AlertIcon color={successColor} />
          <VStack align="start" spacing={1} flex={1}>
            <AlertDescription fontWeight="semibold" color={successColor}>
              Discount Applied Successfully!
            </AlertDescription>
            <HStack spacing={4} fontSize="sm" color={neutralMedium}>
              <Text>
                Discount: <Text as="span" fontWeight="semibold" color={successColor}>
                  -{formatPrice(validationResult.discountAmount)}
                </Text>
              </Text>
              <Text>
                New Total: <Text as="span" fontWeight="bold" color={primaryColor}>
                  {formatPrice(validationResult.finalAmount)}
                </Text>
              </Text>
            </HStack>
          </VStack>
          <CheckIcon color={successColor} boxSize={4} />
        </Alert>
      )}

      {/* Validation Feedback */}
      {isValidating && (
        <Box 
          p={3} 
          borderRadius="md" 
          backgroundColor={neutralLight}
          borderWidth={1}
          borderColor={borderColor}
        >
          <HStack spacing={3}>
            <Spinner size="sm" color={primaryColor} />
            <Text fontSize="sm" color={neutralMedium}>
              Validating discount code...
            </Text>
          </HStack>
        </Box>
      )}
    </VStack>
  );
};

export default DiscountCodeInput;