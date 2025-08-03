import React from 'react';
import {
  Box,
  Image,
  Text,
  Heading,
  VStack,
  HStack,
  Badge,
  Button,
  IconButton,
  useColorModeValue,
  Skeleton,
} from '@chakra-ui/react';
import { StarIcon, CalendarIcon } from '@chakra-ui/icons';
import { EventWithRelations } from '@jctop-event/shared-types';

interface EventCardProps {
  event: EventWithRelations;
  onFavorite?: (eventId: string, isFavorited: boolean) => void;
  isFavorited?: boolean;
  onEventClick?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
  isLoading?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onFavorite,
  isFavorited = false,
  onEventClick,
  onRegister,
  isLoading = false,
}) => {
  // Design system colors following branding guide
  const cardBgColor = useColorModeValue('white', '#1E293B');
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const primaryColor = '#2563EB';
  const secondaryColor = '#475569';
  const neutralDark = '#0F172A';
  const neutralMedium = '#64748B';
  const successColor = '#10B981';

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMinPrice = () => {
    if (!event.ticketTypes || event.ticketTypes.length === 0) {
      return 'Free';
    }
    const minPrice = Math.min(...event.ticketTypes.map(ticket => ticket.price));
    return minPrice === 0 ? 'Free' : `$${minPrice.toFixed(2)}`;
  };

  const handleCardClick = () => {
    if (onEventClick && !isLoading) {
      onEventClick(event.id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onFavorite && !isLoading) {
      onFavorite(event.id, !isFavorited);
    }
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onRegister && !isLoading) {
      onRegister(event.id);
    }
  };

  if (isLoading) {
    return (
      <Box
        borderWidth={1}
        borderRadius="lg"
        borderColor={borderColor}
        overflow="hidden"
        bg={cardBgColor}
        shadow="sm"
        transition="all 0.2s"
        _hover={{
          shadow: 'md',
          transform: 'translateY(-2px)',
        }}
        cursor="pointer"
        role="article"
        aria-label="Event card loading"
      >
        <Skeleton height="200px" />
        <Box p={4}>
          <VStack align="stretch" spacing={3}>
            <Skeleton height="24px" />
            <Skeleton height="16px" />
            <Skeleton height="16px" />
            <Skeleton height="20px" width="80px" />
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      borderWidth={1}
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBgColor}
      shadow="sm"
      transition="all 0.2s"
      _hover={{
        shadow: 'md',
        transform: 'translateY(-2px)',
        borderColor: primaryColor,
      }}
      _focus={{
        shadow: 'outline',
        borderColor: primaryColor,
      }}
      cursor="pointer"
      role="article"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Event: ${event.title}`}
    >
      {/* Event Image */}
      <Box position="relative" height="200px" bg="#F8FAFC">
        <Box
          width="100%"
          height="100%"
          bg="#F8FAFC"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color={neutralMedium}
          fontSize="sm"
        >
          🎟️ Event Image
        </Box>
        
        {/* Favorite Button */}
        {onFavorite && (
          <Box position="absolute" top={3} right={3}>
            <IconButton
              icon={<StarIcon />}
              size="sm"
              variant="solid"
              bg="white"
              color={isFavorited ? '#EF4444' : neutralMedium}
              shadow="sm"
              _hover={{
                bg: 'white',
                color: '#EF4444',
                transform: 'scale(1.1)',
              }}
              _focus={{
                shadow: 'outline',
              }}
              onClick={handleFavoriteClick}
              aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            />
          </Box>
        )}

        {/* Event Status Badge */}
        {event.status && (
          <Box position="absolute" top={3} left={3}>
            <Badge
              colorScheme={event.status === 'published' ? 'green' : 'gray'}
              variant="solid"
              fontSize="xs"
              textTransform="capitalize"
            >
              {event.status}
            </Badge>
          </Box>
        )}
      </Box>

      {/* Event Details */}
      <Box p={4}>
        <VStack align="stretch" spacing={3}>
          {/* Category */}
          {event.category && (
            <Badge
              colorScheme="blue"
              variant="subtle"
              alignSelf="flex-start"
              fontSize="xs"
              textTransform="capitalize"
            >
              {event.category.name}
            </Badge>
          )}

          {/* Event Title */}
          <Heading
            as="h3"
            size="md"
            color={neutralDark}
            noOfLines={2}
            lineHeight="1.3"
            fontSize="18px"
            fontWeight="600"
          >
            {event.title}
          </Heading>

          {/* Date and Time */}
          <HStack spacing={2} color={neutralMedium}>
            <CalendarIcon />
            <Text fontSize="sm" lineHeight="1.5">
              {formatDate(event.startDate)} • {formatTime(event.startDate)}
            </Text>
          </HStack>

          {/* Location */}
          <HStack spacing={2} color={neutralMedium}>
            <Text fontSize="sm" fontWeight="medium">📍</Text>
            <Text fontSize="sm" lineHeight="1.5" noOfLines={1}>
              {event.venue?.name || event.location}
            </Text>
          </HStack>

          {/* Price */}
          <VStack align="stretch" spacing={3} pt={2}>
            <HStack spacing={2}>
              <Text fontSize="sm" fontWeight="medium">💰</Text>
              <Text
                fontSize="lg"
                fontWeight="bold"
                color={successColor}
                lineHeight="1.5"
              >
                From {getMinPrice()}
              </Text>
            </HStack>

            {/* Action Buttons */}
            <HStack justify="space-between" align="center">
              {/* Register Button - Only show for published events */}
              {event.status === 'published' && onRegister && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  variant="solid"
                  backgroundColor={primaryColor}
                  onClick={handleRegisterClick}
                  _hover={{
                    backgroundColor: '#1D4ED8',
                  }}
                  _active={{
                    backgroundColor: '#1E40AF',
                  }}
                  _focus={{
                    shadow: 'outline',
                  }}
                  aria-label={`Register for ${event.title}`}
                  flex={1}
                  mr={2}
                >
                  Register
                </Button>
              )}

              {/* View Details Button */}
              <Button
                size="sm"
                colorScheme="primary"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
                _focus={{
                  shadow: 'outline',
                }}
                aria-label={`View details for ${event.title}`}
                flex={event.status === 'published' && onRegister ? 1 : 'auto'}
              >
                View Details
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default EventCard;