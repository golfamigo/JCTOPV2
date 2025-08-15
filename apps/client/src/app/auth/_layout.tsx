import React from 'react';
import { Stack } from 'expo-router';

/**
 * Auth Layout Component
 * 
 * Layout for authentication-related pages (login, register, forgot password, etc.)
 * Configures navigation stack options for auth flow pages.
 * 
 * Features:
 * - Clean stack navigation without headers
 * - Consistent styling across auth pages
 * - Proper screen transitions
 * 
 * Route: app/auth/_layout.tsx
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'modal', // Use modal presentation for auth flow
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: '登入',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: '註冊',
          headerShown: false,
        }}
      />
      {/* Password reset flow screens */}
      <Stack.Screen
        name="forgot-password"
        options={{
          title: '忘記密碼',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: '重設密碼',
          headerShown: false,
        }}
      />
    </Stack>
  );
}