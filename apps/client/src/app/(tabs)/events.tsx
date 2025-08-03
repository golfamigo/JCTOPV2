import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ChakraProvider, useColorModeValue } from '@chakra-ui/react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import EventsList from '../../components/features/event/EventsList';
import theme from '../../theme';

/**
 * Events Discovery Page Component
 * 
 * This page displays a list of all published events with pagination.
 * It serves as the main discovery interface for attendees to find events.
 * 
 * Features:
 * - Displays published events in a responsive grid layout
 * - Includes pagination for efficient loading
 * - Supports event favoriting (when authentication is implemented)
 * - Responsive design for mobile, tablet, and desktop
 * - Loading states and error handling
 * 
 * Route: app/(tabs)/events.tsx (for Expo Router integration)
 */
export default function EventsPage() {
  const router = useRouter();
  const [favoritedEvents] = useState<Set<string>>(new Set());
  
  // Get theme colors for status bar
  const statusBarStyle = useColorModeValue('dark', 'light');
  
  const handleEventClick = (eventId: string) => {
    // Navigate to registration page for the event
    router.push(`/event/${eventId}/register`);
  };

  const handleFavorite = (eventId: string, isFavorited: boolean) => {
    // TODO: Implement favorite functionality with authentication
    console.log('Toggle favorite:', eventId, isFavorited);
  };

  return (
    <ChakraProvider theme={theme}>
      <View style={{ flex: 1 }}>
        <StatusBar style={statusBarStyle} />
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <EventsList
            onEventClick={handleEventClick}
            onFavorite={handleFavorite}
            favoritedEvents={favoritedEvents}
            title="Discover Events"
            showTitle={true}
            itemsPerPage={12}
          />
        </ScrollView>
      </View>
    </ChakraProvider>
  );
}