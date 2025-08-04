import React from 'react';
import { Stack } from 'expo-router';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme';

export default function RootLayout() {
  return (
    <ChakraProvider theme={theme}>
      <Stack
        screenOptions={{
          headerShown: false, // Let individual pages handle headers
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </ChakraProvider>
  );
}