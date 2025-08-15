import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import EventsList from '../../components/features/event/EventsList';
import { useAppTheme } from '@/theme';
import { ErrorBoundary } from '../../components/organisms/ErrorBoundary';

/**
 * Events Discovery Page Component
 * 
 * This page displays a list of all published events with search and filtering.
 * It serves as the main discovery interface for attendees to find events.
 * 
 * Features:
 * - Displays published events in a responsive grid layout
 * - Includes search functionality with debouncing
 * - Category filtering with Traditional Chinese labels
 * - Pull-to-refresh functionality
 * - Supports event favoriting (when authentication is implemented)
 * - Responsive design for mobile, tablet, and desktop
 * - Loading states and error handling with localized messages
 * 
 * Route: app/(tabs)/events.tsx (for Expo Router integration)
 */
export default function EventsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [favoritedEvents] = useState<Set<string>>(new Set());
  
  const handleEventClick = (eventId: string) => {
    // Navigate to registration page for the event
    router.push(`/event/${eventId}/register`);
  };

  const handleFavorite = (eventId: string, isFavorited: boolean) => {
    // TODO: Implement favorite functionality with authentication
    console.log('Toggle favorite:', eventId, isFavorited);
  };

  return (
    <ErrorBoundary level="screen">
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="dark" backgroundColor={colors.background} />
        <EventsList
          onEventClick={handleEventClick}
          onFavorite={handleFavorite}
          favoritedEvents={favoritedEvents}
          title={t('events.discoverEvents')}
          showTitle={true}
        itemsPerPage={12}
      />
      </View>
    </ErrorBoundary>
  );
}