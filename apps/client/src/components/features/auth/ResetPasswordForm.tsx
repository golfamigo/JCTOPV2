import React, { useState, useEffect } from 'react';
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
  Progress,
} from '@chakra-ui/react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

type ResetPasswordFormProps = {
  onResetPassword: (token: string, password: string) => Promise<void>;
};

const ResetPasswordForm = ({ onResetPassword }: ResetPasswordFormProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ResetPasswordData>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Design system colors
  const bgColor = useColorModeValue('#F8FAFC', '#0F172A');
  const cardBgColor = useColorModeValue('white', '#1E293B');
  const primaryColor = '#2563EB';
  const errorColor = '#EF4444';
  const successColor = '#10B981';
  const warningColor = '#F59E0B';

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setErrorMessage('Invalid or missing reset token. Please request a new password reset link.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/\d/.test(password)) score += 25;
    
    if (score < 50) return { score, label: 'Weak', color: errorColor };
    if (score < 75) return { score, label: 'Fair', color: warningColor };
    if (score < 100) return { score, label: 'Good', color: primaryColor };
    return { score, label: 'Strong', color: successColor };
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordData> = {};

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (password.length > 50) {
      newErrors.password = 'Password must not exceed 50 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,50}$/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and be 8-50 characters long';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!token) {
      setErrorMessage('Invalid reset token. Please request a new password reset link.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      await onResetPassword(token, password);
      setSuccessMessage('Your password has been successfully reset. You can now log in with your new password.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while resetting your password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const passwordStrength = getPasswordStrength(password);

  if (!token && !errorMessage) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Text>Loading...</Text>
      </Box>
    );
  }

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
            Set New Password
          </Text>

          {/* Description */}
          <Text
            fontSize="16px"
            color="gray.600"
            textAlign="center"
            fontFamily="Inter"
            lineHeight={1.5}
          >
            Enter your new password below. Make sure it's strong and secure.
          </Text>

          {/* Success Alert */}
          {successMessage && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Success!</AlertTitle>
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

          {!errorMessage && token && (
            <>
              {/* Password Field */}
              <FormControl isInvalid={!!errors.password}>
                <FormLabel
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.700"
                  fontFamily="Inter"
                >
                  New Password
                </FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your new password"
                  size="lg"
                  borderColor={errors.password ? errorColor : 'gray.300'}
                  _hover={{ borderColor: errors.password ? errorColor : 'gray.400' }}
                  _focus={{ 
                    borderColor: errors.password ? errorColor : primaryColor, 
                    boxShadow: `0 0 0 1px ${errors.password ? errorColor : primaryColor}` 
                  }}
                  autoComplete="new-password"
                  autoFocus
                />
                <FormErrorMessage color={errorColor}>
                  {errors.password}
                </FormErrorMessage>
                
                {/* Password Strength Indicator */}
                {password && (
                  <Box mt={2}>
                    <Text fontSize="12px" color="gray.600" mb={1} fontFamily="Inter">
                      Password Strength: <Text as="span" color={passwordStrength.color} fontWeight="600">
                        {passwordStrength.label}
                      </Text>
                    </Text>
                    <Progress
                      value={passwordStrength.score}
                      size="sm"
                      colorScheme={passwordStrength.score < 50 ? 'red' : passwordStrength.score < 75 ? 'yellow' : passwordStrength.score < 100 ? 'blue' : 'green'}
                      borderRadius="md"
                    />
                  </Box>
                )}
              </FormControl>

              {/* Confirm Password Field */}
              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel
                  fontSize="16px"
                  fontWeight="600"
                  color="gray.700"
                  fontFamily="Inter"
                >
                  Confirm New Password
                </FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Confirm your new password"
                  size="lg"
                  borderColor={errors.confirmPassword ? errorColor : 'gray.300'}
                  _hover={{ borderColor: errors.confirmPassword ? errorColor : 'gray.400' }}
                  _focus={{ 
                    borderColor: errors.confirmPassword ? errorColor : primaryColor, 
                    boxShadow: `0 0 0 1px ${errors.confirmPassword ? errorColor : primaryColor}` 
                  }}
                  autoComplete="new-password"
                />
                <FormErrorMessage color={errorColor}>
                  {errors.confirmPassword}
                </FormErrorMessage>
              </FormControl>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText="Resetting Password..."
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
                Reset Password
              </Button>
            </>
          )}

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

export default ResetPasswordForm;