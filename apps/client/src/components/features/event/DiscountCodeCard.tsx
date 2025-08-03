import React from 'react';
import {
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  useColorModeValue,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon, CopyIcon } from '@chakra-ui/icons';
import { DiscountCodeResponse } from '@jctop-event/shared-types';

interface DiscountCodeCardProps {
  discountCode: DiscountCodeResponse;
  onEdit: (discountCode: DiscountCodeResponse) => void;
  onDelete: (discountCodeId: string) => Promise<void>;
  isLoading?: boolean;
}

const DiscountCodeCard: React.FC<DiscountCodeCardProps> = ({
  discountCode,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const isExpired = discountCode.expiresAt && new Date(discountCode.expiresAt) < new Date();
  
  const getTypeColor = () => {
    return discountCode.type === 'percentage' ? 'blue' : 'green';
  };

  const getValueDisplay = () => {
    if (discountCode.type === 'percentage') {
      return `${discountCode.value}%`;
    }
    return `$${discountCode.value.toFixed(2)}`;
  };

  const getStatusColor = () => {
    if (isExpired) return 'red';
    return 'green';
  };

  const getStatusText = () => {
    if (isExpired) return 'Expired';
    return 'Active';
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(discountCode.code);
      toast({
        title: 'Copied to clipboard',
        description: `Discount code "${discountCode.code}" copied successfully`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy discount code to clipboard',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(discountCode.id);
      onClose();
    } catch (error) {
      console.error('Error deleting discount code:', error);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No expiration';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Box
        p={4}
        bg={cardBg}
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="md"
        shadow="sm"
        _hover={{ shadow: 'md' }}
        transition="box-shadow 0.2s"
      >
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between" align="flex-start">
            <VStack align="flex-start" spacing={1} flex={1}>
              <HStack>
                <Text fontSize="lg" fontWeight="bold" fontFamily="mono">
                  {discountCode.code}
                </Text>
                <Tooltip label="Copy code">
                  <IconButton
                    aria-label="Copy discount code"
                    icon={<CopyIcon />}
                    size="sm"
                    variant="ghost"
                    onClick={copyToClipboard}
                  />
                </Tooltip>
              </HStack>
              
              <HStack spacing={2}>
                <Badge colorScheme={getTypeColor()} variant="subtle">
                  {discountCode.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                </Badge>
                <Badge colorScheme={getStatusColor()} variant="outline">
                  {getStatusText()}
                </Badge>
              </HStack>
            </VStack>

            <HStack>
              <Tooltip label="Edit discount code">
                <IconButton
                  aria-label="Edit discount code"
                  icon={<EditIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(discountCode)}
                  isDisabled={isLoading}
                />
              </Tooltip>
              
              <Tooltip label="Delete discount code">
                <IconButton
                  aria-label="Delete discount code"
                  icon={<DeleteIcon />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={onOpen}
                  isDisabled={isLoading}
                />
              </Tooltip>
            </HStack>
          </HStack>

          <VStack align="stretch" spacing={2}>
            <HStack justify="space-between">
              <Text fontSize="sm" color={textColor}>
                Discount Value:
              </Text>
              <Text fontSize="lg" fontWeight="semibold" color="blue.500">
                {getValueDisplay()}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color={textColor}>
                Usage Count:
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {discountCode.usageCount} times
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color={textColor}>
                Expires:
              </Text>
              <Text 
                fontSize="sm" 
                fontWeight="medium"
                color={isExpired ? 'red.500' : 'gray.700'}
              >
                {formatDate(discountCode.expiresAt)}
              </Text>
            </HStack>

            <HStack justify="space-between">
              <Text fontSize="sm" color={textColor}>
                Created:
              </Text>
              <Text fontSize="sm">
                {formatDate(discountCode.createdAt)}
              </Text>
            </HStack>
          </VStack>
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Discount Code
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the discount code "{discountCode.code}"? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={isLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DiscountCodeCard;