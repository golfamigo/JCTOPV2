import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ResetPasswordForm from '@/components/features/auth/ResetPasswordForm';
import { authService } from '@/services/authService';
import { useAppTheme } from '@/theme';

/**
 * Reset Password Screen Component
 * 
 * Screen for password reset confirmation using React Native Elements UI.
 * Migrated from Chakra UI to maintain consistency with the new design system.
 * 
 * Features:
 * - Token validation from URL parameters
 * - New password and confirm password fields
 * - Password strength indicator
 * - Success/error message display
 * - Auto-redirect to login after successful reset
 * - Traditional Chinese localization support
 * - Responsive design following 8pt grid system
 * 
 * Route: app/auth/reset-password.tsx
 */
export default function ResetPasswordScreen() {
  const { colors } = useAppTheme();

  const handleResetPassword = async (token: string, password: string): Promise<void> => {
    await authService.resetPassword(token, password);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ResetPasswordForm onResetPassword={handleResetPassword} />
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