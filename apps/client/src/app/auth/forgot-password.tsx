import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ForgotPasswordForm from '@/components/features/auth/ForgotPasswordForm';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/theme';

/**
 * Forgot Password Screen Component
 * 
 * Screen for password reset functionality using React Native Elements UI.
 * Migrated from Chakra UI to maintain consistency with the new design system.
 * 
 * Features:
 * - Email input with validation
 * - Success/error message display
 * - Navigation back to login
 * - Traditional Chinese localization support
 * - Responsive design following 8pt grid system
 * 
 * Route: app/auth/forgot-password.tsx
 */
export default function ForgotPasswordScreen() {
  const { colors } = useAppTheme();

  const handleForgotPassword = async (email: string): Promise<void> => {
    await authService.forgotPassword(email);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ForgotPasswordForm onForgotPassword={handleForgotPassword} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16, // 2x spacing from 8pt grid
  },
});