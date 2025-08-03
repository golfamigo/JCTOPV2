import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';

interface ForgotPasswordData {
  email: string;
}

type ForgotPasswordFormProps = {
  onForgotPassword: (email: string) => Promise<void>;
};

const ForgotPasswordForm = ({ onForgotPassword }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ForgotPasswordData>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Design system colors
  const bgColor = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBgColor = useColorModeValue('white', '#1E293B');
  const primaryColor = '#2563EB';
  const errorColor = '#EF4444';
  const successColor = '#10B981';

  const validateForm = (): boolean => {
    const newErrors: Partial<ForgotPasswordData> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    } else if (email.length > 100) {
      newErrors.email = 'Email must not exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      await onForgotPassword(email);
      setSuccessMessage(
        'If an account with that email address exists, we have sent you a password reset link.'
      );
      setEmail(''); // Clear form on success
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={4}
    >
      <Box
        maxW="400px"
        w="100%"
        bg={cardBgColor}
        p={8}
        borderRadius="md"
        boxShadow="lg"
        border="1px"
        borderColor="gray.200"
      >
        <VStack spacing={6}>
          {/* Title */}
          <Text
            fontSize="36px"
            fontWeight="bold"
            color="gray.900"
            textAlign="center"
            fontFamily="Inter"
            lineHeight={1.2}
          >
            Reset Password
          </Text>

          {/* Description */}
          <Text
            fontSize="16px"
            color="gray.600"
            textAlign="center"
            fontFamily="Inter"
            lineHeight={1.5}
          >
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {/* Success Alert */}
          {successMessage && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Email Sent!</AlertTitle>
                <AlertDescription>{successMessage}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Error!</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Email Field */}
          <FormControl isInvalid={!!errors.email}>
            <FormLabel
              fontSize="16px"
              fontWeight="600"
              color="gray.700"
              fontFamily="Inter"
            >
              Email
            </FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your email address"
              size="lg"
              borderColor={errors.email ? errorColor : 'gray.300'}
              _hover={{ borderColor: errors.email ? errorColor : 'gray.400' }}
              _focus={{ 
                borderColor: errors.email ? errorColor : primaryColor, 
                boxShadow: `0 0 0 1px ${errors.email ? errorColor : primaryColor}` 
              }}
              autoComplete="email"
              autoFocus
            />
            <FormErrorMessage color={errorColor}>
              {errors.email}
            </FormErrorMessage>
          </FormControl>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Sending..."
            bg={primaryColor}
            color="white"
            size="lg"
            w="100%"
            _hover={{ bg: '#1D4ED8' }}
            _active={{ bg: '#1E40AF' }}
            _disabled={{ bg: 'gray.400', cursor: 'not-allowed' }}
            fontFamily="Inter"
            fontWeight="600"
            mt={4}
          >
            Send Reset Link
          </Button>

          {/* Back to Login Link */}
          <ChakraLink
            as={Link}
            to="/login"
            color={primaryColor}
            fontSize="16px"
            fontFamily="Inter"
            textAlign="center"
            _hover={{ textDecoration: 'underline' }}
          >
            Back to Sign In
          </ChakraLink>
        </VStack>
      </Box>
    </Box>
  );
};

export default ForgotPasswordForm;