import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
  useDisclosure,
  useToast,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { DiscountCodeResponse, CreateDiscountCodeDto, UpdateDiscountCodeDto } from '@jctop-event/shared-types';
import discountCodeService from '../../../services/discountCodeService';
import DiscountCodeForm from './DiscountCodeForm';
import DiscountCodeCard from './DiscountCodeCard';

interface DiscountCodeListProps {
  eventId: string;
}

const DiscountCodeList: React.FC<DiscountCodeListProps> = ({ eventId }) => {
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCodeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadDiscountCodes();
  }, [eventId]);

  const loadDiscountCodes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const codes = await discountCodeService.getDiscountCodes(eventId);
      setDiscountCodes(codes);
    } catch (error) {
      console.error('Error loading discount codes:', error);
      setError(error instanceof Error ? error.message : 'Failed to load discount codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCode = async (data: CreateDiscountCodeDto) => {
    setIsSubmitting(true);
    try {
      const newCode = await discountCodeService.createDiscountCode(eventId, data);
      setDiscountCodes(prev => [newCode, ...prev]);
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCode = async (data: UpdateDiscountCodeDto) => {
    if (!editingCode) return;
    
    setIsSubmitting(true);
    try {
      const updatedCode = await discountCodeService.updateDiscountCode(
        eventId, 
        editingCode.id, 
        data
      );
      setDiscountCodes(prev => 
        prev.map(code => code.id === editingCode.id ? updatedCode : code)
      );
      setEditingCode(null);
    } catch (error) {
      throw error; // Re-throw to be handled by the form
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    try {
      await discountCodeService.deleteDiscountCode(eventId, codeId);
      setDiscountCodes(prev => prev.filter(code => code.id !== codeId));
      
      toast({
        title: 'Discount code deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to delete discount code',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEditCode = (code: DiscountCodeResponse) => {
    setEditingCode(code);
    onOpen();
  };

  const handleCloseForm = () => {
    setEditingCode(null);
    onClose();
  };

  const getStatsData = () => {
    const totalCodes = discountCodes.length;
    const activeCodes = discountCodes.filter(code => 
      !code.expiresAt || new Date(code.expiresAt) > new Date()
    ).length;
    const totalUsage = discountCodes.reduce((sum, code) => sum + code.usageCount, 0);
    
    return { totalCodes, activeCodes, totalUsage };
  };

  const { totalCodes, activeCodes, totalUsage } = getStatsData();

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading discount codes...</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <VStack align="flex-start" spacing={1}>
            <Heading size="lg">Discount Codes</Heading>
            <Text color="gray.600">
              Manage promotional codes for your event
            </Text>
          </VStack>
          
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
            isDisabled={isLoading}
          >
            Create Discount Code
          </Button>
        </Flex>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box p={4} bg="blue.50" borderRadius="md" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {totalCodes}
            </Text>
            <Text fontSize="sm" color="gray.600">Total Codes</Text>
          </Box>
          
          <Box p={4} bg="green.50" borderRadius="md" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {activeCodes}
            </Text>
            <Text fontSize="sm" color="gray.600">Active Codes</Text>
          </Box>
          
          <Box p={4} bg="purple.50" borderRadius="md" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              {totalUsage}
            </Text>
            <Text fontSize="sm" color="gray.600">Total Usage</Text>
          </Box>
        </SimpleGrid>

        {/* Error State */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Discount Codes List */}
        {discountCodes.length === 0 ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500" mb={4}>
              No discount codes created yet
            </Text>
            <Text color="gray.400" mb={6}>
              Create your first discount code to start offering promotions to your customers
            </Text>
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
            >
              Create Your First Discount Code
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} spacing={4}>
            {discountCodes.map((code) => (
              <DiscountCodeCard
                key={code.id}
                discountCode={code}
                onEdit={handleEditCode}
                onDelete={handleDeleteCode}
                isLoading={isSubmitting}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      {/* Form Modal */}
      <DiscountCodeForm
        isOpen={isOpen}
        onClose={handleCloseForm}
        onSubmit={editingCode ? handleUpdateCode : handleCreateCode}
        initialData={editingCode || undefined}
        isLoading={isSubmitting}
      />
    </Box>
  );
};

export default DiscountCodeList;