import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, LinearProgress } from '@rneui/themed';
import { useTranslation } from '../../localization';
import { useAppTheme } from '@/theme';

export interface PasswordStrengthLevel {
  score: number; // 0-4 (weak to strong)
  label: string;
  color: string;
  progress: number; // 0-1 for progress bar
}

interface PasswordStrengthIndicatorProps {
  password: string;
  testID?: string;
}

/**
 * Calculate password strength based on multiple criteria
 * Returns score 0-4 (weak to strong)
 */
/**
 * Password strength evaluation criteria and scoring
 */
const PASSWORD_STRENGTH_CRITERIA = {
  MIN_LENGTH: 8,
  BONUS_LENGTH: 12,
  PATTERNS: {
    LOWERCASE: /[a-z]/,
    UPPERCASE: /[A-Z]/,
    NUMBERS: /[0-9]/,
    SPECIAL_CHARS: /[^A-Za-z0-9]/,
  },
} as const;

/**
 * Password strength level definitions with i18n keys and visual styling
 * Using theme colors for consistency
 */
const getStrengthLevels = (colors: any) => ({
  0: { label: 'auth.passwordStrength.veryWeak', color: colors.danger, progress: 0.2 },
  1: { label: 'auth.passwordStrength.weak', color: colors.danger, progress: 0.3 },
  2: { label: 'auth.passwordStrength.fair', color: colors.warning, progress: 0.5 },
  3: { label: 'auth.passwordStrength.good', color: colors.warning, progress: 0.7 },
  4: { label: 'auth.passwordStrength.strong', color: colors.success, progress: 1.0 },
} as const);

export const calculatePasswordStrength = (password: string, colors?: any): PasswordStrengthLevel => {
  if (!password?.length) {
    return { score: 0, label: '', color: '', progress: 0 };
  }

  // Use default colors if not provided (for backward compatibility)
  const defaultColors = {
    danger: '#DC3545',
    warning: '#FFC107',
    success: '#28A745'
  };
  const themeColors = colors || defaultColors;
  const STRENGTH_LEVELS = getStrengthLevels(themeColors);

  let score = 0;

  // Length scoring - up to 2 points for length
  if (password.length >= PASSWORD_STRENGTH_CRITERIA.MIN_LENGTH) score += 1;
  if (password.length >= PASSWORD_STRENGTH_CRITERIA.BONUS_LENGTH) score += 1;

  // Character variety scoring - up to 4 points for different character types
  const { PATTERNS } = PASSWORD_STRENGTH_CRITERIA;
  if (PATTERNS.LOWERCASE.test(password)) score += 1;
  if (PATTERNS.UPPERCASE.test(password)) score += 1;
  if (PATTERNS.NUMBERS.test(password)) score += 1;
  if (PATTERNS.SPECIAL_CHARS.test(password)) score += 1;

  // Cap the maximum score at 4 to match our strength levels
  const finalScore = Math.min(score, 4) as keyof typeof STRENGTH_LEVELS;
  const level = STRENGTH_LEVELS[finalScore];
  
  return {
    score: finalScore,
    label: level.label,
    color: level.color,
    progress: level.progress,
  };
};

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  testID = 'password-strength-indicator',
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const strength = calculatePasswordStrength(password, colors);

  // Don't show anything if no password entered
  if (!password || password.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.progressContainer}>
        <LinearProgress
          value={strength.progress}
          color={strength.color}
          trackColor={colors.border}
          style={[styles.progressBar, { height: 4 }]}
          testID={`${testID}-progress-bar`}
        />
      </View>
      <Text
        style={[
          styles.strengthText,
          { 
            color: strength.color,
            fontSize: 12,
            marginTop: spacing.xs,
          }
        ]}
        testID={`${testID}-text`}
      >
        {t(strength.label)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'left',
  },
});

export default PasswordStrengthIndicator;