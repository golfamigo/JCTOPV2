import React from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '../theme';
import { ErrorBoundary } from '../components/organisms/ErrorBoundary';
import { NetworkStatusIndicator } from '../components/molecules/NetworkStatusIndicator';
import OfflineIndicator from '../components/shared/OfflineIndicator';

export default function RootLayout() {
  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary
        level="global"
        onError={(error, errorInfo) => {
          if (__DEV__) {
            console.error('App Error:', error);
            console.error('Error Info:', errorInfo);
          }
        }}
      >
        <NetworkStatusIndicator position="top" autoHideDelay={3000} />
        <OfflineIndicator />
        <Stack
          screenOptions={{
            headerShown: false, // Let individual pages handle headers
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
      </ErrorBoundary>
    </ThemeProvider>
  );
}