import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  useColorModeValue,
  Skeleton,
  Container,
} from '@chakra-ui/react';
import EventCard from './EventCard';
import Pagination from '../../ui/Pagination';
import eventService from '../../../services/eventService';
import { EventWithRelations, PaginatedEventsResponse } from '@jctop-event/shared-types';

interface EventsListProps {
  onEventClick?: (eventId: string) => void;
  onFavorite?: (eventId: string, isFavorited: boolean) => void;
  favoritedEvents?: Set<string>;
  title?: string;
  showTitle?: boolean;
  itemsPerPage?: number;
}

const EventsList: React.FC<EventsListProps> = ({
  onEventClick,
  onFavorite,
  favoritedEvents = new Set(),
  title = 'Discover Events',
  showTitle = true,
  itemsPerPage = 12,
}) => {
  // State management
  const [events, setEvents] = useState<EventWithRelations[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLimit, setCurrentLimit] = useState(itemsPerPage);

  // Design system colors
  const bgColor = useColorModeValue('#F8FAFC', '#0F172A');
  const textColor = useColorModeValue('#0F172A', '#F8FAFC');
  const mutedTextColor = useColorModeValue('#64748B', '#94A3B8');

  // Fetch events function
  const fetchEvents = async (page: number, limit: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: PaginatedEventsResponse = await eventService.getPublicEvents(page, limit);
      
      setEvents(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
      setCurrentLimit(response.pagination.limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
      setEvents([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEvents(1, itemsPerPage);
  }, [itemsPerPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchEvents(page, currentLimit);
    // Scroll to top of the list on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit: number) => {
    fetchEvents(1, newLimit); // Reset to page 1 when changing page size
  };

  // Handle retry
  const handleRetry = () => {
    fetchEvents(currentPage, currentLimit);
  };

  // Handle event click
  const handleEventClick = (eventId: string) => {
    if (onEventClick) {
      onEventClick(eventId);
    }
  };

  // Handle favorite toggle
  const handleFavoriteToggle = (eventId: string, isFavorited: boolean) => {
    if (onFavorite) {
      onFavorite(eventId, isFavorited);
    }
  };

  // Loading skeleton
  const renderLoadingSkeleton = () => (
    <Grid
      templateColumns={{
        base: '1fr',
        md: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
        xl: 'repeat(4, 1fr)',
      }}
      gap={6}
    >
      {Array.from({ length: currentLimit }).map((_, index) => (
        <EventCard
          key={`skeleton-${index}`}
          event={{} as EventWithRelations}
          isLoading={true}
        />
      ))}
    </Grid>
  );

  // Empty state
  const renderEmptyState = () => (
    <VStack spacing={6} py={12} textAlign="center">
      <Box fontSize="6xl">🎟️</Box>
      <VStack spacing={2}>
        <Heading as="h3" size="lg" color={textColor}>
          No Events Found
        </Heading>
        <Text color={mutedTextColor} maxW="400px">
          There are no published events available at the moment. Please check back later for upcoming events.
        </Text>
      </VStack>
      <Button colorScheme="primary" onClick={handleRetry}>
        Refresh Events
      </Button>
    </VStack>
  );

  // Error state
  const renderErrorState = () => (
    <Alert status="error" borderRadius="md" flexDirection="column" textAlign="center" py={8}>
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Failed to Load Events
      </AlertTitle>
      <AlertDescription maxWidth="400px" mb={4}>
        {error || 'An unexpected error occurred while loading events. Please try again.'}
      </AlertDescription>
      <Button colorScheme="red" size="sm" onClick={handleRetry}>
        Try Again
      </Button>
    </Alert>
  );

  return (
    <Container maxW="1200px" px={{ base: 4, md: 6 }}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        {showTitle && (
          <Box textAlign="center" py={{ base: 6, md: 8 }}>
            <Heading
              as="h1"
              size="2xl"
              color={textColor}
              mb={4}
              fontWeight="700"
            >
              {title}
            </Heading>
            <Text
              fontSize="lg"
              color={mutedTextColor}
              maxW="600px"
              mx="auto"
              lineHeight="1.6"
            >
              Find and discover amazing events happening around you. From concerts to conferences, there's something for everyone.
            </Text>
          </Box>
        )}

        {/* Content */}
        <Box minH="400px">
          {error ? (
            renderErrorState()
          ) : isLoading ? (
            renderLoadingSkeleton()
          ) : events.length === 0 ? (
            renderEmptyState()
          ) : (
            <Grid
              templateColumns={{
                base: '1fr',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)',
              }}
              gap={6}
            >
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onEventClick={handleEventClick}
                  onFavorite={onFavorite ? handleFavoriteToggle : undefined}
                  isFavorited={favoritedEvents.has(event.id)}
                />
              ))}
            </Grid>
          )}
        </Box>

        {/* Pagination */}
        {!error && !isLoading && events.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={currentLimit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            isLoading={isLoading}
            showPageSizeSelector={true}
            pageSizeOptions={[12, 24, 48]}
          />
        )}
      </VStack>
    </Container>
  );
};

export default EventsList;