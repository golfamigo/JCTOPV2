import React, { useState, useEffect } from 'react';
import {
  VStack,
  Box,
  HStack,
  Text,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useColorModeValue,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { TicketTypeWithAvailability, TicketSelection } from '@jctop-event/shared-types';
import TicketQuantityPicker from './TicketQuantityPicker';
import ticketService from '../../../services/ticketService';

interface TicketTypeSelectorProps {
  eventId: string;
  onSelectionChange: (selections: TicketSelection[], totalPrice: number) => void;
  initialSelections?: TicketSelection[];
  isDisabled?: boolean;
}

const TicketTypeSelector: React.FC<TicketTypeSelectorProps> = ({
  eventId,
  onSelectionChange,
  initialSelections = [],
  isDisabled = false,
}) => {
  const [ticketTypes, setTicketTypes] = useState<TicketTypeWithAvailability[]>([]);
  const [selections, setSelections] = useState<TicketSelection[]>(initialSelections);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientValidationErrors, setClientValidationErrors] = useState<string[]>([]);

  // Design system colors following branding guide
  const cardBgColor = useColorModeValue('white', '#1E293B');
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const primaryColor = '#2563EB';
  const secondaryColor = '#475569';
  const successColor = '#10B981';
  const warningColor = '#FBBF24';
  const errorColor = '#EF4444';
  const neutralLight = '#F8FAFC';
  const neutralMedium = '#64748B';

  useEffect(() => {
    fetchTicketTypes();
  }, [eventId]);

  useEffect(() => {
    // Calculate total price and validate selections
    const totalPrice = ticketService.calculateTotalPrice(ticketTypes, selections);
    const validation = ticketService.validateSelectionClientSide(ticketTypes, selections);
    
    setClientValidationErrors(validation.errors);
    onSelectionChange(selections, totalPrice);
  }, [selections, ticketTypes, onSelectionChange]);

  const fetchTicketTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const types = await ticketService.getTicketTypesWithAvailability(eventId);
      setTicketTypes(types);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (ticketTypeId: string, quantity: number) => {
    if (isDisabled) return;

    setSelections(prev => {
      const filtered = prev.filter(s => s.ticketTypeId !== ticketTypeId);
      if (quantity > 0) {
        return [...filtered, { ticketTypeId, quantity }];
      }
      return filtered;
    });
  };

  const getQuantityForTicketType = (ticketTypeId: string): number => {
    const selection = selections.find(s => s.ticketTypeId === ticketTypeId);
    return selection ? selection.quantity : 0;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getTotalSelectedQuantity = (): number => {
    return selections.reduce((total, selection) => total + selection.quantity, 0);
  };

  if (isLoading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner color={primaryColor} size="xl" />
        <Text mt={4} color={neutralMedium}>Loading ticket information...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Unable to load ticket information</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (ticketTypes.length === 0) {
    return (
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>No tickets available</AlertTitle>
          <AlertDescription>
            Ticket sales have not started yet or all tickets have been sold.
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="md" color={primaryColor} mb={2}>
          Select Tickets
        </Heading>
        <Text color={neutralMedium} fontSize="sm">
          Choose the type and quantity of tickets you'd like to purchase
        </Text>
      </Box>

      {clientValidationErrors.length > 0 && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Selection Error</AlertTitle>
            <VStack align="start" spacing={1} mt={2}>
              {clientValidationErrors.map((error, index) => (
                <Text key={index} fontSize="sm">{error}</Text>
              ))}
            </VStack>
          </Box>
        </Alert>
      )}

      <VStack spacing={4} align="stretch">
        {ticketTypes.map((ticketType) => {
          const selectedQuantity = getQuantityForTicketType(ticketType.id);
          const isAvailable = ticketType.availableQuantity > 0;
          const isSoldOut = ticketType.availableQuantity === 0;

          return (
            <Box
              key={ticketType.id}
              p={6}
              borderWidth={1}
              borderRadius="md"
              borderColor={selectedQuantity > 0 ? primaryColor : borderColor}
              backgroundColor={selectedQuantity > 0 ? `${primaryColor}05` : cardBgColor}
              opacity={isDisabled || isSoldOut ? 0.6 : 1}
              transition="all 0.2s"
              _hover={isAvailable && !isDisabled ? {
                borderColor: primaryColor,
                boxShadow: `0 0 0 1px ${primaryColor}40`,
              } : {}}
            >
              <HStack justify="between" align="start" spacing={4}>
                <VStack align="start" spacing={3} flex={1}>
                  <HStack align="center" spacing={3}>
                    <Heading size="sm" color={primaryColor}>
                      {ticketType.name}
                    </Heading>
                    {isSoldOut && (
                      <Badge colorScheme="red" variant="solid">
                        Sold Out
                      </Badge>
                    )}
                    {!isSoldOut && ticketType.availableQuantity <= 10 && (
                      <Badge colorScheme="orange" variant="solid">
                        {ticketType.availableQuantity} left
                      </Badge>
                    )}
                  </HStack>

                  <Text fontSize="xl" fontWeight="semibold" color={primaryColor}>
                    {formatPrice(ticketType.price)}
                  </Text>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={successColor}>
                      {ticketType.availableQuantity} of {ticketType.totalQuantity} available
                    </Text>
                    {ticketType.soldQuantity > 0 && (
                      <Text fontSize="sm" color={neutralMedium}>
                        {ticketType.soldQuantity} already sold
                      </Text>
                    )}
                  </VStack>
                </VStack>

                <VStack align="end" spacing={2}>
                  <TicketQuantityPicker
                    value={selectedQuantity}
                    max={Math.min(ticketType.availableQuantity, 10)} // Limit to 10 per type
                    onChange={(quantity) => handleQuantityChange(ticketType.id, quantity)}
                    isDisabled={isDisabled || isSoldOut}
                    aria-label={`${ticketType.name} quantity selector`}
                  />
                  
                  {selectedQuantity > 0 && (
                    <Text fontSize="sm" color={primaryColor} fontWeight="medium">
                      {selectedQuantity} × {formatPrice(ticketType.price)} = {formatPrice(selectedQuantity * ticketType.price)}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>
          );
        })}
      </VStack>

      {getTotalSelectedQuantity() > 0 && (
        <>
          <Divider />
          <Box p={4} backgroundColor={neutralLight} borderRadius="md">
            <HStack justify="between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold" color={primaryColor}>
                  Total Selected
                </Text>
                <Text fontSize="sm" color={neutralMedium}>
                  {getTotalSelectedQuantity()} ticket{getTotalSelectedQuantity() !== 1 ? 's' : ''}
                </Text>
              </VStack>
              <Text fontSize="xl" fontWeight="bold" color={primaryColor}>
                {formatPrice(ticketService.calculateTotalPrice(ticketTypes, selections))}
              </Text>
            </HStack>
          </Box>
        </>
      )}
    </VStack>
  );
};

export default TicketTypeSelector;