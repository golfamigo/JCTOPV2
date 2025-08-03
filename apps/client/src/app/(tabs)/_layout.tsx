import React from 'react';
import { Tabs } from 'expo-router';
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../../theme';

export default function TabLayout() {
  return (
    <ChakraProvider theme={theme}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#2563EB', // Primary color from theme
          tabBarInactiveTintColor: '#64748B', // Muted color from theme
          headerShown: false, // Let the individual pages handle their own headers
        }}
      >
        <Tabs.Screen
          name="events"
          options={{
            title: 'Events',
            tabBarLabel: 'Discover',
            // You can add an icon here later
          }}
        />
        {/* Add other tabs here as needed */}
      </Tabs>
    </ChakraProvider>
  );
}