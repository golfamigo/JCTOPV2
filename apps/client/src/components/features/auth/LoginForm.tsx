import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Input, Button, Card, Divider, SocialIcon } from '@rneui/themed';
import { Link } from 'expo-router';
import { useAppTheme } from '../../../theme';
import { useTranslation } from '../../../localization';
import { useResponsive } from '../../../hooks/useResponsive';
import { useKeyboardAwareScrollView } from '../../../hooks/useKeyboardAwareScrollView';
import GoogleAuthService from '../../../services/googleAuthService';
import { LoadingOverlay } from '../../organisms/LoadingOverlay';
import { ErrorCard } from '../../molecules/ErrorCard';
import { useNetworkStatus } from '../../../utils/networkStatus';
import { accessibilityLabels } from '../../../constants/accessibilityLabels';
import { useScreenReader } from '../../../accessibility/hooks/useScreenReader';

interface LoginData {
  email: string;
  password: string;
}

type LoginFormProps = {
  onLogin: (userData: LoginData) => Promise<void>;
  onGoogleSignIn: (accessToken: string) => Promise<void>;
};

const LoginForm = ({ onLogin, onGoogleSignIn }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const { colors, spacing, typography } = useAppTheme();
  const { t } = useTranslation();
  const networkStatus = useNetworkStatus();
  const responsive = useResponsive();
  const { getScrollViewProps } = useKeyboardAwareScrollView();
  const { announceError, announceSuccess } = useScreenReader();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = t('validation.required');
    } else if (!emailRegex.test(email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    if (!password) {
      newErrors.password = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      announceError('請檢查輸入的資料');
      return;
    }

    if (!networkStatus.isConnected) {
      setLoginError(t('errors.offline'));
      announceError(t('errors.offline'));
      return;
    }

    setIsLoading(true);
    setLoginError(null);
    try {
      await onLogin({ email, password });
      announceSuccess('登入成功');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('messages.somethingWentWrong');
      setLoginError(errorMsg);
      announceError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading || isLoading) return;

    if (!networkStatus.isConnected) {
      setLoginError(t('errors.offline'));
      return;
    }

    setIsGoogleLoading(true);
    setLoginError(null);
    
    try {
      const result = await GoogleAuthService.signInWithGoogle();
      
      if (result.success && result.accessToken) {
        await onGoogleSignIn(result.accessToken);
      } else {
        setLoginError(result.error || t('auth.googleSignInFailed'));
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setLoginError(t('auth.failedGoogleSignIn'));
    } finally {
      setIsGoogleLoading(false);
    }
  };


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      minHeight: '100%',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: responsive.isLandscape && responsive.isPhone ? spacing.sm : spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: responsive.isDesktop ? 480 : responsive.isTablet ? 400 : 320,
      padding: responsive.isLandscape && responsive.isPhone ? spacing.md : spacing.lg,
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.lg,
      ...typography.h1,
    },
    errorCard: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      marginBottom: spacing.md,
      padding: spacing.md,
    },
    errorText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    forgotPasswordContainer: {
      alignItems: 'flex-end',
      marginBottom: spacing.sm,
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: 14,
      textDecorationLine: 'underline',
    },
    submitButton: {
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.md,
    },
    divider: {
      flex: 1,
    },
    dividerText: {
      marginHorizontal: spacing.md,
      color: colors.textSecondary,
      fontSize: 14,
    },
    googleButton: {
      marginTop: spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        {...getScrollViewProps()}
        contentContainerStyle={[styles.scrollContent, getScrollViewProps().contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        <Card containerStyle={styles.card}>
          {/* Title */}
          <Text style={styles.title} accessibilityRole="header">
            {t('auth.signIn')}
          </Text>

          {/* Login Error Alert */}
          {loginError && (
            <ErrorCard
              title={t('auth.loginFailed')}
              message={loginError}
              errorType={!networkStatus.isConnected ? 'network' : 'generic'}
              onDismiss={() => setLoginError(null)}
              containerStyle={{ marginBottom: spacing.md }}
            />
          )}

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.enterEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              errorMessage={errors.email}
              testID="email-input"
              accessibilityLabel={accessibilityLabels.forms.email_input}
              accessibilityHint={accessibilityLabels.hints.email_format}
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.enterPassword')}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              errorMessage={errors.password}
              testID="password-input"
              accessibilityLabel={accessibilityLabels.forms.password_input}
              accessibilityHint={accessibilityLabels.hints.password_requirements}
            />
          </View>

          {/* Forgot Password Link */}
          <View style={styles.forgotPasswordContainer}>
            <Link href="/auth/forgot-password" asChild>
              <Text 
                style={styles.forgotPasswordText}
                accessibilityRole="link"
                accessibilityLabel={accessibilityLabels.buttons.forgotPassword}
              >
                {t('auth.forgotPassword')}
              </Text>
            </Link>
          </View>

          {/* Submit Button */}
          <Button
            title={isLoading ? t('auth.signingIn') : t('auth.signIn')}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading || isGoogleLoading}
            buttonStyle={styles.submitButton}
            testID="signin-button"
            accessibilityLabel={accessibilityLabels.buttons.login}
            accessibilityHint={accessibilityLabels.hints.double_tap_to_activate}
            accessibilityState={{ disabled: isLoading || isGoogleLoading, busy: isLoading }}
          />

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text style={styles.dividerText}>
              {t('auth.or')}
            </Text>
            <Divider style={styles.divider} />
          </View>

          {/* Google Sign-In Button */}
          <SocialIcon
            title={isGoogleLoading ? t('auth.signingInWithGoogle') : t('auth.signInWithGoogle')}
            button
            type="google"
            onPress={handleGoogleSignIn}
            loading={isGoogleLoading}
            disabled={isLoading || isGoogleLoading}
            style={styles.googleButton}
          />
        </Card>
      </ScrollView>
      <LoadingOverlay
        visible={isLoading || isGoogleLoading}
        message={isGoogleLoading ? t('auth.signingInWithGoogle') : t('auth.signingIn')}
        variant="spinner"
      />
    </View>
  );
};

export default LoginForm;