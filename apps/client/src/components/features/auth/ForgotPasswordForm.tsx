import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Input, Button, Card } from '@rneui/themed';
import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

interface ForgotPasswordData {
  email: string;
}

type ForgotPasswordFormProps = {
  onForgotPassword: (email: string) => Promise<void>;
};

const ForgotPasswordForm = ({ onForgotPassword }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ForgotPasswordData>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  // Validation constants for better maintainability
  const VALIDATION_RULES = {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    EMAIL_MAX_LENGTH: 100,
  } as const;

  const validateForm = (): boolean => {
    const newErrors: Partial<ForgotPasswordData> = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = t('validation.required');
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(trimmedEmail)) {
      newErrors.email = t('validation.invalidEmail');
    } else if (trimmedEmail.length > VALIDATION_RULES.EMAIL_MAX_LENGTH) {
      newErrors.email = t('auth.emailTooLong');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      await onForgotPassword(email.trim());
      setSuccessMessage(
        t('auth.resetPasswordEmailSent', {
          defaultValue: 'If an account with that email address exists, we have sent you a password reset link.'
        })
      );
      setEmail(''); // Clear form on success
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t('messages.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitEditing = () => {
    handleSubmit();
  };

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
            {t('auth.resetPassword')}
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t('auth.resetPasswordDescription', {
              defaultValue: 'Enter your email address and we\'ll send you a link to reset your password.'
            })}
          </Text>

          {/* Success Message */}
          {successMessage && (
            <Card containerStyle={[styles.messageCard, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
              <Text style={[styles.messageTitle, { color: colors.success }]}>
                {t('auth.emailSent', { defaultValue: 'Email Sent!' })}
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

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              {t('auth.email')}
            </Text>
            <Input
              value={email}
              onChangeText={setEmail}
              onSubmitEditing={handleSubmitEditing}
              placeholder={t('auth.enterEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              autoFocus
              returnKeyType="done"
              errorMessage={errors.email}
              containerStyle={styles.inputContainerStyle}
              inputContainerStyle={[
                styles.inputContainerInnerStyle,
                { borderBottomColor: errors.email ? colors.danger : colors.border }
              ]}
              inputStyle={[styles.inputStyle, { color: colors.text }]}
              placeholderTextColor={colors.textSecondary}
              errorStyle={[styles.errorStyle, { color: colors.danger }]}
            />
          </View>

          {/* Submit Button */}
          <Button
            title={isLoading ? t('common.loading') : t('auth.sendResetLink')}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={[styles.submitButton, { backgroundColor: colors.primary }]}
            titleStyle={styles.submitButtonTitle}
            containerStyle={styles.submitButtonContainer}
          />

          {/* Back to Login Link */}
          <Button
            title={t('auth.backToSignIn', { defaultValue: 'Back to Sign In' })}
            type="clear"
            onPress={() => router.back()}
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

export default ForgotPasswordForm;