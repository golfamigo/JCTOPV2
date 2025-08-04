import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import LoginForm from '../../components/features/auth/LoginForm';
import { useAuthStore } from '../../stores/authStore';

/**
 * Login Page Component
 * 
 * Dedicated login page using the existing LoginForm component.
 * Integrates with Expo Router for navigation and auth store for state management.
 * 
 * Features:
 * - Uses existing LoginForm component with full functionality
 * - Integrates with auth store for login state management
 * - Handles navigation after successful login
 * - Responsive design with proper theming
 * - Loading states and error handling
 * 
 * Route: app/auth/login.tsx
 */
export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();

  // Handle login request
  const handleLogin = async (userData: { email: string; password: string }) => {
    try {
      await login(userData);
      // Navigate to events page after successful login
      router.replace('/(tabs)/events');
    } catch (error) {
      // Error is handled by the auth store and displayed in the form
      console.error('Login failed:', error);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async (accessToken: string) => {
    // TODO: Implement Google sign-in with auth store
    console.log('Google sign-in not yet implemented:', accessToken);
  };

  // If already authenticated, redirect to events
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/events');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <LoginForm
          onLogin={handleLogin}
          onGoogleSignIn={handleGoogleSignIn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60, // Account for status bar
  },
});