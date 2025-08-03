import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
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
  Divider,
  Link as ChakraLink,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import GoogleSignInButton from './GoogleSignInButton';

interface LoginData {
  email: string;
  password: string;
}

type LoginFormProps = {
  onLogin: (userData: LoginData) => Promise<void>;
  onGoogleSignIn: (accessToken: string) => Promise<void>;
};

const LoginForm = ({ onLogin, onGoogleSignIn }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  // Design system colors
  const bgColor = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBgColor = useColorModeValue('white', '#1E293B');
  const primaryColor = '#2563EB';
  const errorColor = '#EF4444';

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError(null);
    try {
      await onLogin({ email, password });
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
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
            Sign In
          </Text>

          {/* Login Error Alert */}
          {loginError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Login Failed!</AlertTitle>
                <AlertDescription>{loginError}</AlertDescription>
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
              placeholder="Enter your email"
              size="lg"
              borderColor={errors.email ? errorColor : 'gray.300'}
              _hover={{ borderColor: errors.email ? errorColor : 'gray.400' }}
              _focus={{ 
                borderColor: errors.email ? errorColor : primaryColor, 
                boxShadow: `0 0 0 1px ${errors.email ? errorColor : primaryColor}` 
              }}
              autoComplete="email"
            />
            <FormErrorMessage color={errorColor}>
              {errors.email}
            </FormErrorMessage>
          </FormControl>

          {/* Password Field */}
          <FormControl isInvalid={!!errors.password}>
            <FormLabel
              fontSize="16px"
              fontWeight="600"
              color="gray.700"
              fontFamily="Inter"
            >
              Password
            </FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              size="lg"
              borderColor={errors.password ? errorColor : 'gray.300'}
              _hover={{ borderColor: errors.password ? errorColor : 'gray.400' }}
              _focus={{ 
                borderColor: errors.password ? errorColor : primaryColor, 
                boxShadow: `0 0 0 1px ${errors.password ? errorColor : primaryColor}` 
              }}
              autoComplete="current-password"
            />
            <FormErrorMessage color={errorColor}>
              {errors.password}
            </FormErrorMessage>
          </FormControl>

          {/* Forgot Password Link */}
          <Box w="100%" textAlign="right">
            <ChakraLink
              as={Link}
              to="/forgot-password"
              color={primaryColor}
              fontSize="14px"
              fontFamily="Inter"
              _hover={{ textDecoration: 'underline' }}
            >
              Forgot your password?
            </ChakraLink>
          </Box>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Signing In..."
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
            Sign In
          </Button>

          {/* Divider */}
          <HStack spacing={4} w="100%">
            <Divider />
            <Text 
              fontSize="14px" 
              color="gray.500" 
              fontFamily="Inter"
              whiteSpace="nowrap"
            >
              or
            </Text>
            <Divider />
          </HStack>

          {/* Google Sign-In Button */}
          <GoogleSignInButton
            onGoogleSignIn={onGoogleSignIn}
            isLoading={isLoading}
          />
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginForm;