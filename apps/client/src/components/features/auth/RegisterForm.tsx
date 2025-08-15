import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, Input, Button, CheckBox } from '@rneui/themed';
import { Link } from 'expo-router';
import { useTranslation } from '../../../localization';
import { useAppTheme } from '@/theme';
import PasswordStrengthIndicator from '../../molecules/PasswordStrengthIndicator';
import { LoadingOverlay } from '../../organisms/LoadingOverlay';
import { ErrorCard } from '../../molecules/ErrorCard';
import { useNetworkStatus } from '../../../utils/networkStatus';

/**
 * Validation constants for form fields
 */
const VALIDATION_RULES = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    MAX_LENGTH: 100,
    REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    COMPLEXITY_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,50}$/,
  },
} as const;

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterFormProps {
  onRegister: (userData: Omit<RegisterData, 'confirmPassword'>) => Promise<void>;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister }) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const networkStatus = useNetworkStatus();
  
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = t('validation.required');
    } else if (trimmedName.length < VALIDATION_RULES.NAME.MIN_LENGTH) {
      newErrors.name = t('auth.nameTooShort');
    } else if (trimmedName.length > VALIDATION_RULES.NAME.MAX_LENGTH) {
      newErrors.name = t('auth.nameTooLong');
    }

    // Email validation
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = t('validation.required');
    } else if (!VALIDATION_RULES.EMAIL.REGEX.test(trimmedEmail)) {
      newErrors.email = t('validation.invalidEmail');
    } else if (trimmedEmail.length > VALIDATION_RULES.EMAIL.MAX_LENGTH) {
      newErrors.email = t('auth.emailTooLong');
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('validation.required');
    } else if (formData.password.length < VALIDATION_RULES.PASSWORD.MIN_LENGTH) {
      newErrors.password = t('validation.passwordTooShort');
    } else if (formData.password.length > VALIDATION_RULES.PASSWORD.MAX_LENGTH) {
      newErrors.password = t('auth.passwordTooLong');
    } else if (!VALIDATION_RULES.PASSWORD.COMPLEXITY_REGEX.test(formData.password)) {
      newErrors.password = t('auth.passwordComplexity');
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.required');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsDoNotMatch');
    }

    // Terms acceptance validation
    if (!termsAccepted) {
      newErrors.terms = t('validation.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!networkStatus.isConnected) {
      setSubmitError(t('errors.offline'));
      return;
    }

    setIsLoading(true);
    setSubmitError(null);
    try {
      const { confirmPassword, ...userData } = formData;
      await onRegister(userData);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t('messages.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(colors, spacing, typography);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      testID="register-form-container"
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Title */}
          <Text h1 style={styles.title} testID="register-form-title">
            {t('auth.createAccount')}
          </Text>

          {/* Name Field */}
          <View style={styles.inputContainer}>
            <Input
              label={t('auth.name')}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder={t('auth.enterName')}
              autoCapitalize="words"
              autoCorrect={false}
              errorMessage={errors.name}
              containerStyle={styles.inputWrapper}
              inputContainerStyle={[
                styles.inputField,
                errors.name ? styles.inputError : undefined
              ]}
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputText}
              errorStyle={styles.errorText}
              testID="register-form-name-input"
            />
          </View>

          {/* Email Field */}
          <View style={styles.inputContainer}>
            <Input
              label={t('auth.email')}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder={t('auth.enterEmail')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              errorMessage={errors.email}
              containerStyle={styles.inputWrapper}
              inputContainerStyle={[
                styles.inputField,
                errors.email ? styles.inputError : undefined
              ]}
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputText}
              errorStyle={styles.errorText}
              testID="register-form-email-input"
            />
          </View>

          {/* Password Field */}
          <View style={styles.inputContainer}>
            <Input
              label={t('auth.password')}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder={t('auth.enterPassword')}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              errorMessage={errors.password}
              containerStyle={styles.inputWrapper}
              inputContainerStyle={[
                styles.inputField,
                errors.password ? styles.inputError : undefined
              ]}
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputText}
              errorStyle={styles.errorText}
              testID="register-form-password-input"
            />
            <PasswordStrengthIndicator 
              password={formData.password}
              testID="register-form-password-strength"
            />
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Input
              label={t('auth.confirmPassword')}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder={t('auth.enterConfirmPassword')}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              errorMessage={errors.confirmPassword}
              containerStyle={styles.inputWrapper}
              inputContainerStyle={[
                styles.inputField,
                errors.confirmPassword ? styles.inputError : undefined
              ]}
              labelStyle={styles.inputLabel}
              inputStyle={styles.inputText}
              errorStyle={styles.errorText}
              testID="register-form-confirm-password-input"
            />
          </View>

          {/* Terms and Conditions Checkbox */}
          <View style={styles.checkboxContainer}>
            <CheckBox
              title={
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    {t('auth.agreeToTerms')}
                  </Text>
                  <Link href="/terms" asChild>
                    <Text style={styles.termsLink}>
                      {t('auth.termsAndConditions')}
                    </Text>
                  </Link>
                </View>
              }
              checked={termsAccepted}
              onPress={() => {
                setTermsAccepted(!termsAccepted);
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: undefined }));
                }
              }}
              containerStyle={styles.checkbox}
              textStyle={styles.checkboxText}
              checkedColor={colors.primary}
              testID="register-form-terms-checkbox"
            />
            {errors.terms && (
              <Text style={styles.errorText}>{errors.terms}</Text>
            )}
          </View>

          {/* Error Display */}
          {submitError && (
            <ErrorCard
              message={submitError}
              errorType={!networkStatus.isConnected ? 'network' : 'generic'}
              onDismiss={() => setSubmitError(null)}
              containerStyle={{ marginBottom: spacing.md }}
            />
          )}

          {/* Submit Button */}
          <Button
            title={isLoading ? t('auth.registering') : t('common.register')}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            buttonStyle={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled
            ]}
            titleStyle={styles.submitButtonText}
            loadingProps={{
              color: colors.white,
            }}
            testID="register-form-submit-button"
          />

          {/* Navigation Link */}
          <View style={styles.navigationContainer}>
            <Text style={styles.navigationText}>
              {t('auth.alreadyHaveAccount')}
            </Text>
            <Link href="/auth/login" asChild>
              <Text style={styles.navigationLink}>
                {t('auth.signIn')}
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
      <LoadingOverlay
        visible={isLoading}
        message={t('auth.registering')}
        variant="spinner"
      />
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: any, spacing: any, typography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
    },
    formContainer: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.xl,
      color: colors.text,
      ...typography.h1,
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    inputWrapper: {
      paddingHorizontal: 0,
    },
    inputField: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.white,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginTop: spacing.xs,
    },
    inputError: {
      borderBottomColor: colors.danger,
      borderBottomWidth: 2,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.xs,
    },
    inputText: {
      fontSize: 16,
      color: colors.text,
    },
    errorText: {
      fontSize: 12,
      color: colors.danger,
      marginTop: spacing.xs,
    },
    checkboxContainer: {
      marginVertical: spacing.md,
    },
    checkbox: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      paddingHorizontal: 0,
      marginLeft: 0,
      marginRight: 0,
    },
    checkboxText: {
      fontSize: 16,
      fontWeight: 'normal',
      color: colors.text,
      marginLeft: spacing.sm,
    },
    termsTextContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      marginLeft: spacing.sm,
    },
    termsText: {
      fontSize: 16,
      color: colors.text,
      marginRight: spacing.xs,
    },
    termsLink: {
      fontSize: 16,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.md,
      marginTop: spacing.lg,
      elevation: 2,
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    submitButtonDisabled: {
      backgroundColor: colors.disabled,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.lg,
      flexWrap: 'wrap',
    },
    navigationText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginRight: spacing.xs,
    },
    navigationLink: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '600',
    },
  });

export default RegisterForm;