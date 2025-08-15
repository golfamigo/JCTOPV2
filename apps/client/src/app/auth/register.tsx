import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import RegisterForm from '../../components/features/auth/RegisterForm';
import { useAuthStore } from '../../stores/authStore';
import authService from '../../services/authService';
import { useAppTheme } from '@/theme';

/**
 * Register Page Component
 * 
 * Dedicated registration page using the existing RegisterForm component.
 * Integrates with Expo Router for navigation and auth store for state management.
 * 
 * Features:
 * - Uses existing RegisterForm component with full functionality
 * - Integrates with auth store for registration state management
 * - Handles navigation after successful registration
 * - Responsive design with proper theming
 * - Loading states and error handling
 * 
 * Route: app/auth/register.tsx
 */
export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();
  const { colors, spacing } = useAppTheme();

  // Handle registration request
  const handleRegister = async (userData: { name: string; email: string; password: string }) => {
    try {
      // Register user
      await authService.register(userData);
      
      // Auto-login after successful registration
      await login({ email: userData.email, password: userData.password });
      
      // Navigate to events page after successful registration
      router.replace('/(tabs)/events');
    } catch (error) {
      // Error is handled by the form component
      console.error('Registration failed:', error);
      throw error; // Re-throw so the form can display the error
    }
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

  const styles = createStyles(colors, spacing);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RegisterForm
          onRegister={handleRegister}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, spacing: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.lightGrey,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: spacing.lg,
      paddingTop: 60, // Account for status bar
    },
  });