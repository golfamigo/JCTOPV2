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
  Heading,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { KeyboardAvoidingView, Platform } from 'react-native';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

type RegisterFormProps = {
  onRegister: (userData: RegisterData) => Promise<void>;
};

const RegisterForm = ({ onRegister }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterData>>({});
  const toast = useToast();

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterData> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address';
    } else if (email.length > 100) {
      newErrors.email = 'Email must not exceed 100 characters';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (password.length > 50) {
      newErrors.password = 'Password must not exceed 50 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,50}$/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and be 8-50 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onRegister({ name, email, password });
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: error instanceof Error ? error.message : 'An error occurred during registration.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Box
        flex={1}
        bg="neutral.50"
        px={5}
        py={10}
        justifyContent="center"
      >
        <VStack spacing={8} mx="auto" w="full" maxW="md">
          {/* Title following UIUX typography scale */}
          <Heading
            size="xl"
            fontSize="36px"
            fontWeight="bold"
            color="neutral.900"
            textAlign="center"
            lineHeight={1.2}
            fontFamily="Inter"
          >
            Create Account
          </Heading>

          <VStack spacing={6}>
            {/* Name Field with WCAG compliance */}
            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel
                fontSize="16px"
                fontWeight="600"
                color="neutral.900"
                mb={2}
                fontFamily="Inter"
              >
                Name
              </FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                autoCapitalize="words"
                autoCorrect="off"
                bg="white"
                borderColor={errors.name ? "error.500" : "neutral.200"}
                borderWidth={1}
                borderRadius={8}
                fontSize="16px"
                px={4}
                py={3}
                minH={12}
                _focus={{
                  borderColor: "primary.500",
                  bg: "white"
                }}
                _invalid={{
                  borderColor: "error.500"
                }}
                aria-label="Name input field"
              />
              <FormErrorMessage
                fontSize="14px"
                color="error.500"
                mt={1}
              >
                {errors.name}
              </FormErrorMessage>
            </FormControl>

            {/* Email Field with WCAG compliance */}
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel
                fontSize="16px"
                fontWeight="600"
                color="neutral.900"
                mb={2}
                fontFamily="Inter"
              >
                Email
              </FormLabel>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                autoCapitalize="none"
                autoCorrect="off"
                bg="white"
                borderColor={errors.email ? "error.500" : "neutral.200"}
                borderWidth={1}
                borderRadius={8}
                fontSize="16px"
                px={4}
                py={3}
                minH={12}
                _focus={{
                  borderColor: "primary.500",
                  bg: "white"
                }}
                _invalid={{
                  borderColor: "error.500"
                }}
                aria-label="Email input field"
              />
              <FormErrorMessage
                fontSize="14px"
                color="error.500"
                mt={1}
              >
                {errors.email}
              </FormErrorMessage>
            </FormControl>

            {/* Password Field with WCAG compliance */}
            <FormControl isInvalid={!!errors.password} isRequired>
              <FormLabel
                fontSize="16px"
                fontWeight="600"
                color="neutral.900"
                mb={2}
                fontFamily="Inter"
              >
                Password
              </FormLabel>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                type="password"
                autoCapitalize="none"
                autoCorrect="off"
                bg="white"
                borderColor={errors.password ? "error.500" : "neutral.200"}
                borderWidth={1}
                borderRadius={8}
                fontSize="16px"
                px={4}
                py={3}
                minH={12}
                _focus={{
                  borderColor: "primary.500",
                  bg: "white"
                }}
                _invalid={{
                  borderColor: "error.500"
                }}
                aria-label="Password input field"
              />
              <FormErrorMessage
                fontSize="14px"
                color="error.500"
                mt={1}
              >
                {errors.password}
              </FormErrorMessage>
            </FormControl>

            {/* Submit Button following brand colors and 4px grid */}
            <Button
              onClick={handleSubmit}
              isDisabled={isLoading}
              isLoading={isLoading}
              loadingText="Registering..."
              colorScheme="primary"
              bg="primary.500"
              _hover={{ bg: "primary.600" }}
              _pressed={{ bg: "primary.700" }}
              _disabled={{ bg: "neutral.300" }}
              size="lg"
              fontSize="18px"
              fontWeight="bold"
              borderRadius={8}
              minH={12}
              mt={4}
              aria-label="Register button"
            >
              {isLoading ? (
                <HStack spacing={2} alignItems="center">
                  <Spinner size="sm" color="white" />
                  <Text color="white" fontSize="18px" fontWeight="bold">
                    Registering...
                  </Text>
                </HStack>
              ) : (
                'Register'
              )}
            </Button>
          </VStack>
        </VStack>
      </Box>
    </KeyboardAvoidingView>
  );
};

export default RegisterForm;