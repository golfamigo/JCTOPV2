import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Input, Button, Card, LinearProgress } from '@rneui/themed';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

type ResetPasswordFormProps = {
  onResetPassword: (token: string, password: string) => Promise<void>;
};

const ResetPasswordForm = ({ onResetPassword }: ResetPasswordFormProps) => {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ResetPasswordData>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  useEffect(() => {
    if (!tokenParam) {
      setErrorMessage(t('auth.invalidResetToken', {
        defaultValue: 'Invalid or missing reset token. Please request a new password reset link.'
      }));
    } else {
      setToken(tokenParam);
    }
  }, [tokenParam, t]);

  // Password strength constants for better maintainability
  const PASSWORD_STRENGTH_RULES = {
    MIN_LENGTH: 8,
    SCORE_PER_CRITERIA: 25,
    PATTERNS: {
      LOWERCASE: /[a-z]/,
      UPPERCASE: /[A-Z]/,
      DIGIT: /\d/,
    },
    THRESHOLDS: {
      WEAK: 50,
      FAIR: 75,
      GOOD: 100,
    },
  } as const;

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= PASSWORD_STRENGTH_RULES.MIN_LENGTH) score += PASSWORD_STRENGTH_RULES.SCORE_PER_CRITERIA;
    if (PASSWORD_STRENGTH_RULES.PATTERNS.LOWERCASE.test(password)) score += PASSWORD_STRENGTH_RULES.SCORE_PER_CRITERIA;
    if (PASSWORD_STRENGTH_RULES.PATTERNS.UPPERCASE.test(password)) score += PASSWORD_STRENGTH_RULES.SCORE_PER_CRITERIA;
    if (PASSWORD_STRENGTH_RULES.PATTERNS.DIGIT.test(password)) score += PASSWORD_STRENGTH_RULES.SCORE_PER_CRITERIA;
    
    if (score < PASSWORD_STRENGTH_RULES.THRESHOLDS.WEAK) return { score, label: t('auth.passwordStrength.weak'), color: colors.danger };
    if (score < PASSWORD_STRENGTH_RULES.THRESHOLDS.FAIR) return { score, label: t('auth.passwordStrength.fair'), color: colors.warning };
    if (score < PASSWORD_STRENGTH_RULES.THRESHOLDS.GOOD) return { score, label: t('auth.passwordStrength.good'), color: colors.primary };
    return { score, label: t('auth.passwordStrength.strong'), color: colors.success };
  };

  // Password validation constants
  const PASSWORD_VALIDATION = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    COMPLEXITY_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,50}$/,
  } as const;

  const validateForm = (): boolean => {
    const newErrors: Partial<ResetPasswordData> = {};

    // Password validation
    if (!password) {
      newErrors.password = t('validation.required');
    } else if (password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
      newErrors.password = t('validation.passwordTooShort');
    } else if (password.length > PASSWORD_VALIDATION.MAX_LENGTH) {
      newErrors.password = t('auth.passwordTooLong');
    } else if (!PASSWORD_VALIDATION.COMPLEXITY_REGEX.test(password)) {
      newErrors.password = t('auth.passwordComplexity');
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.enterConfirmPassword');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!token) {
      setErrorMessage(t('auth.invalidResetToken', {
        defaultValue: 'Invalid reset token. Please request a new password reset link.'
      }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      await onResetPassword(token, password);
      setSuccessMessage(t('auth.passwordResetSuccess', {
        defaultValue: 'Your password has been successfully reset. You can now log in with your new password.'
      }));
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.replace('/auth/login');
      }, 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('messages.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEditing = () => {
    handleSubmit();
  };

  const passwordStrength = getPasswordStrength(password);

  if (!token && !errorMessage) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.formCard, { maxWidth: 400 }]}>
          {/* Title */}
          <Text h1 style={[styles.title, { color: colors.dark }]}>
            {t('auth.setNewPassword', { defaultValue: 'Set New Password' })}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('auth.setNewPasswordDescription', {
              defaultValue: 'Enter your new password below. Make sure it\'s strong and secure.'
            })}
          </Text>

          {/* Success Message */}
          {successMessage && (
            <Card containerStyle={[styles.messageCard, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
              <Text style={[styles.messageTitle, { color: colors.success }]}>
                {t('common.success')}
              </Text>
              <Text style={[styles.messageText, { color: colors.success }]}>
                {successMessage}
              </Text>
            </Card>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Card containerStyle={[styles.messageCard, { backgroundColor: colors.danger + '10', borderColor: colors.danger }]}>
              <Text style={[styles.messageTitle, { color: colors.danger }]}>
                {t('common.error')}
              </Text>
              <Text style={[styles.messageText, { color: colors.danger }]}>
                {errorMessage}
              </Text>
            </Card>
          )}

          {!errorMessage && token && (
            <>
              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('auth.newPassword', { defaultValue: 'New Password' })}
                </Text>
                <Input
                  value={password}
                  onChangeText={setPassword}
                  onSubmitEditing={handleSubmitEditing}
                  placeholder={t('auth.enterNewPassword', { defaultValue: 'Enter your new password' })}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  autoFocus
                  returnKeyType="next"
                  errorMessage={errors.password}
                  containerStyle={styles.inputContainerStyle}
                  inputContainerStyle={[
                    styles.inputContainerInnerStyle,
                    { borderBottomColor: errors.password ? colors.danger : colors.border }
                  ]}
                  inputStyle={[styles.inputStyle, { color: colors.text }]}
                  placeholderTextColor={colors.textSecondary}
                  errorStyle={[styles.errorStyle, { color: colors.danger }]}
                />
                
                {/* Password Strength Indicator */}
                {password && (
                  <View style={styles.strengthContainer}>
                    <Text style={[styles.strengthLabel, { color: colors.textSecondary }]}>
                      {t('auth.passwordStrengthLabel', { defaultValue: 'Password Strength' })}: {' '}
                      <Text style={[styles.strengthValue, { color: passwordStrength.color }]}>
                        {passwordStrength.label}
                      </Text>
                    </Text>
                    <LinearProgress
                      value={passwordStrength.score / 100}
                      color={passwordStrength.color}
                      style={styles.strengthProgress}
                      trackColor={colors.border}
                    />
                  </View>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  {t('auth.confirmNewPassword', { defaultValue: 'Confirm New Password' })}
                </Text>
                <Input
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onSubmitEditing={handleSubmitEditing}
                  placeholder={t('auth.confirmNewPasswordPlaceholder', { defaultValue: 'Confirm your new password' })}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  returnKeyType="done"
                  errorMessage={errors.confirmPassword}
                  containerStyle={styles.inputContainerStyle}
                  inputContainerStyle={[
                    styles.inputContainerInnerStyle,
                    { borderBottomColor: errors.confirmPassword ? colors.danger : colors.border }
                  ]}
                  inputStyle={[styles.inputStyle, { color: colors.text }]}
                  placeholderTextColor={colors.textSecondary}
                  errorStyle={[styles.errorStyle, { color: colors.danger }]}
                />
              </View>

              {/* Submit Button */}
              <Button
                title={isLoading ? t('auth.resettingPassword', { defaultValue: 'Resetting Password...' }) : t('auth.resetPassword')}
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                buttonStyle={[styles.submitButton, { backgroundColor: colors.primary }]}
                titleStyle={styles.submitButtonTitle}
                containerStyle={styles.submitButtonContainer}
              />
            </>
          )}

          {/* Back to Login Link */}
          <Button
            title={t('auth.backToSignIn', { defaultValue: 'Back to Sign In' })}
            type="clear"
            onPress={() => router.push('/auth/login')}
            titleStyle={[styles.linkButton, { color: colors.primary }]}
            containerStyle={styles.linkButtonContainer}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16, // 2x spacing from 8pt grid
    paddingVertical: 24, // 3x spacing from 8pt grid
  },
  formCard: {
    width: '100%',
    paddingHorizontal: 24, // 3x spacing from 8pt grid
    paddingVertical: 32, // 4x spacing from 8pt grid
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16, // 2x spacing from 8pt grid
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24, // 3x spacing from 8pt grid
  },
  messageCard: {
    width: '100%',
    marginBottom: 16, // 2x spacing from 8pt grid
    borderWidth: 1,
    borderRadius: 8,
    padding: 16, // 2x spacing from 8pt grid
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4, // 0.5x spacing from 8pt grid
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24, // 3x spacing from 8pt grid
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8, // 1x spacing from 8pt grid
  },
  inputContainerStyle: {
    paddingHorizontal: 0,
  },
  inputContainerInnerStyle: {
    borderBottomWidth: 1,
    paddingBottom: 8, // 1x spacing from 8pt grid
  },
  inputStyle: {
    fontSize: 16,
    paddingVertical: 12, // 1.5x spacing from 8pt grid
  },
  errorStyle: {
    fontSize: 12,
    marginTop: 4, // 0.5x spacing from 8pt grid
  },
  strengthContainer: {
    marginTop: 8, // 1x spacing from 8pt grid
  },
  strengthLabel: {
    fontSize: 12,
    marginBottom: 4, // 0.5x spacing from 8pt grid
  },
  strengthValue: {
    fontWeight: '600',
  },
  strengthProgress: {
    height: 4,
    borderRadius: 2,
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 16, // 2x spacing from 8pt grid
    minHeight: 48, // Touch target minimum size
  },
  submitButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonContainer: {
    width: '100%',
    marginTop: 8, // 1x spacing from 8pt grid
    marginBottom: 16, // 2x spacing from 8pt grid
  },
  linkButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  linkButtonContainer: {
    marginTop: 8, // 1x spacing from 8pt grid
  },
});

export default ResetPasswordForm;