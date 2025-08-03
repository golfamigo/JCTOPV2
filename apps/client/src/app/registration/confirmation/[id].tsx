import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import RegistrationConfirmationPage from '../../../components/features/registration/RegistrationConfirmationPage';

export default function RegistrationConfirmationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return <div>Invalid registration ID</div>;
  }

  return <RegistrationConfirmationPage registrationId={id} />;
}