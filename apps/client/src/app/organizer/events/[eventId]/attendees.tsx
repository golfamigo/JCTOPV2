import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AttendeeManagementPage from '../../../../components/features/organizer/AttendeeManagementPage';

export default function AttendeeManagementScreen() {
  const { eventId } = useLocalSearchParams();
  const router = useRouter();

  const handleNavigateBack = () => {
    router.back();
  };

  if (!eventId || typeof eventId !== 'string') {
    return null;
  }

  return (
    <AttendeeManagementPage 
      eventId={eventId} 
      onNavigateBack={handleNavigateBack}
    />
  );
}