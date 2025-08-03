import React, { useState, useEffect } from 'react';
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
  Flex,
  Badge,
} from '@chakra-ui/react';
import { useAuthStore } from '../../../stores/authStore';

interface UpdateProfileData {
  name?: string;
  phone?: string;
}

const ProfilePage = () => {
  const { user, getProfile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Partial<UpdateProfileData>>({});
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Design system colors following branding guide
  const bgColor = useColorModeValue('#F8FAFC', '#0F172A'); // Neutral backgrounds
  const cardBgColor = useColorModeValue('white', '#1E293B');
  const primaryColor = '#2563EB'; // Primary from branding guide
  const secondaryColor = '#475569'; // Secondary from branding guide
  const errorColor = '#EF4444'; // Error from branding guide
  const successColor = '#10B981'; // Success from branding guide
  const neutralColor = '#64748B'; // Neutral text from branding guide

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsFetching(true);
        try {
          await getProfile();
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchProfile();
  }, [user, getProfile]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateProfileData> = {};

    if (name && name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (name && name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters';
    }

    if (phone && phone.trim().length > 0) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{8,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = 'Phone number must be a valid international format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setUpdateError(null);
    setUpdateSuccess(null);
    // Reset form to current user data
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const updateData: UpdateProfileData = {};
      
      if (name.trim() !== user?.name) {
        updateData.name = name.trim();
      }
      
      if (phone.trim() !== (user?.phone || '')) {
        updateData.phone = phone.trim() || undefined;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setUpdateSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setIsEditing(false);
      }
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isFetching) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Text>Loading profile...</Text>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        minH="100vh"
        bg={bgColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        px={4}
      >
        <Text>Unable to load profile</Text>
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
      py={8}
    >
      <Box
        maxW={{ base: "100%", md: "500px" }}
        w="100%"
        bg={cardBgColor}
        p={{ base: 6, md: 8 }}
        borderRadius="md"
        boxShadow="lg"
        border="1px"
        borderColor="#E2E8F0"
        mx={{ base: 4, md: 0 }}
      >
        <VStack spacing={8}>
          {/* Header */}
          <Flex w="100%" justify="space-between" align="center" direction={{ base: "column", sm: "row" }} gap={4}>
            <Text
              fontSize={{ base: "30px", md: "36px" }}
              fontWeight="700"
              color="gray.900"
              fontFamily="Inter"
              lineHeight={1.2}
            >
              Profile
            </Text>
            {!isEditing && (
              <Button
                onClick={handleEdit}
                variant="outline"
                colorScheme="blue"
                size="sm"
                bg="white"
                borderColor={primaryColor}
                color={primaryColor}
                _hover={{ bg: primaryColor, color: "white" }}
              >
                Edit
              </Button>
            )}
          </Flex>

          {/* Success Alert */}
          {updateSuccess && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>{updateSuccess}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Error Alert */}
          {updateError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Update Failed!</AlertTitle>
                <AlertDescription>{updateError}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* User Information */}
          <VStack spacing={4} w="100%">
            {/* Name Field */}
            <FormControl isInvalid={!!errors.name}>
              <FormLabel
                fontSize="16px"
                fontWeight="400"
                color={secondaryColor}
                fontFamily="Inter"
                lineHeight={1.5}
              >
                Full Name
              </FormLabel>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  size="lg"
                  borderColor={errors.name ? errorColor : '#E2E8F0'}
                  _hover={{ borderColor: errors.name ? errorColor : secondaryColor }}
                  _focus={{ 
                    borderColor: errors.name ? errorColor : primaryColor, 
                    boxShadow: `0 0 0 1px ${errors.name ? errorColor : primaryColor}` 
                  }}
                  fontFamily="Inter"
                  fontSize="16px"
                />
              ) : (
                <Text
                  fontSize="16px"
                  color="gray.900"
                  p={3}
                  bg="#F8FAFC"
                  borderRadius="md"
                  border="1px"
                  borderColor="#E2E8F0"
                  fontFamily="Inter"
                  lineHeight={1.5}
                >
                  {user.name}
                </Text>
              )}
              <FormErrorMessage color={errorColor}>
                {errors.name}
              </FormErrorMessage>
            </FormControl>

            {/* Email Field (Read-only) */}
            <FormControl>
              <FormLabel
                fontSize="16px"
                fontWeight="600"
                color="gray.700"
                fontFamily="Inter"
              >
                Email Address
              </FormLabel>
              <HStack>
                <Text
                  fontSize="16px"
                  color="gray.900"
                  p={3}
                  bg="#F8FAFC"
                  borderRadius="md"
                  border="1px"
                  borderColor="#E2E8F0"
                  fontFamily="Inter"
                  lineHeight={1.5}
                  flex={1}
                >
                  {user.email}
                </Text>
                <Badge colorScheme="gray" fontSize="xs">
                  Cannot be changed
                </Badge>
              </HStack>
            </FormControl>

            {/* Phone Field */}
            <FormControl isInvalid={!!errors.phone}>
              <FormLabel
                fontSize="16px"
                fontWeight="600"
                color="gray.700"
                fontFamily="Inter"
              >
                Phone Number
              </FormLabel>
              {isEditing ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number (e.g., +1234567890)"
                  size="lg"
                  borderColor={errors.phone ? errorColor : '#E2E8F0'}
                  _hover={{ borderColor: errors.phone ? errorColor : secondaryColor }}
                  _focus={{ 
                    borderColor: errors.phone ? errorColor : primaryColor, 
                    boxShadow: `0 0 0 1px ${errors.phone ? errorColor : primaryColor}` 
                  }}
                  fontFamily="Inter"
                  fontSize="16px"
                />
              ) : (
                <Text
                  fontSize="16px"
                  color="gray.900"
                  p={3}
                  bg="#F8FAFC"
                  borderRadius="md"
                  border="1px"
                  borderColor="#E2E8F0"
                  fontFamily="Inter"
                  lineHeight={1.5}
                >
                  {user.phone || 'Not provided'}
                </Text>
              )}
              <FormErrorMessage color={errorColor}>
                {errors.phone}
              </FormErrorMessage>
            </FormControl>

            <Divider />

            {/* Account Information */}
            <VStack spacing={3} w="100%" align="start">
              <Text
                fontSize="18px"
                fontWeight="600"
                color="gray.700"
                fontFamily="Inter"
              >
                Account Information
              </Text>
              
              <HStack w="100%" justify="space-between">
                <Text color={neutralColor} fontSize="16px" fontFamily="Inter" lineHeight={1.5}>Authentication Provider:</Text>
                <Badge colorScheme="blue" textTransform="capitalize">
                  {user.authProvider}
                </Badge>
              </HStack>
              
              <HStack w="100%" justify="space-between">
                <Text color={neutralColor} fontSize="16px" fontFamily="Inter" lineHeight={1.5}>Member Since:</Text>
                <Text color="gray.900" fontWeight="400" fontSize="16px" fontFamily="Inter" lineHeight={1.5}>
                  {formatDate(user.createdAt)}
                </Text>
              </HStack>
              
              <HStack w="100%" justify="space-between">
                <Text color={neutralColor} fontSize="16px" fontFamily="Inter" lineHeight={1.5}>Last Updated:</Text>
                <Text color="gray.900" fontWeight="400" fontSize="16px" fontFamily="Inter" lineHeight={1.5}>
                  {formatDate(user.updatedAt)}
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Action Buttons */}
          {isEditing && (
            <HStack spacing={4} w="100%" direction={{ base: "column", sm: "row" }}>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="lg"
                flex={1}
                borderColor={secondaryColor}
                color={secondaryColor}
                _hover={{ bg: secondaryColor, color: "white" }}
                fontFamily="Inter"
                fontWeight="600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                isLoading={isLoading}
                loadingText="Saving..."
                bg={primaryColor}
                color="white"
                size="lg"
                flex={1}
                _hover={{ bg: '#1D4ED8' }}
                _active={{ bg: '#1E40AF' }}
                fontFamily="Inter"
                fontWeight="600"
              >
                Save Changes
              </Button>
            </HStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
};

export default ProfilePage;