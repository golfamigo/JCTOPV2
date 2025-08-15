import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card, Text, Button, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

export interface ErrorCardProps {
  title?: string;
  message: string;
  errorType?: 'network' | 'server' | 'validation' | 'generic';
  onRetry?: () => void;
  onDismiss?: () => void;
  showIcon?: boolean;
  containerStyle?: ViewStyle;
  testID?: string;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  message,
  errorType = 'generic',
  onRetry,
  onDismiss,
  showIcon = true,
  containerStyle,
  testID = 'error-card',
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();

  const getIconName = () => {
    switch (errorType) {
      case 'network':
        return 'wifi-off';
      case 'server':
        return 'server-off';
      case 'validation':
        return 'alert-circle-outline';
      default:
        return 'alert-outline';
    }
  };

  const getDefaultTitle = () => {
    switch (errorType) {
      case 'network':
        return t('errors.networkError');
      case 'server':
        return t('errors.serverError');
      case 'validation':
        return t('errors.validationError');
      default:
        return t('errors.somethingWentWrong');
    }
  };

  return (
    <View testID={testID}>
      <Card containerStyle={[styles.container, containerStyle]}>
      {showIcon && (
        <View style={[styles.iconContainer, { marginBottom: spacing.md }]}>
          <Icon
            name={getIconName()}
            type="material-community"
            size={48}
            color={colors.danger}
            testID={`${testID}-icon`}
          />
        </View>
      )}
      
      <Text
        h2
        style={[
          typography.h2,
          styles.title,
          { color: colors.dark, marginBottom: spacing.sm }
        ]}
        testID={`${testID}-title`}
      >
        {title || getDefaultTitle()}
      </Text>
      
      <Text
        style={[
          typography.body,
          styles.message,
          { color: colors.textSecondary, marginBottom: spacing.lg }
        ]}
        testID={`${testID}-message`}
      >
        {message}
      </Text>
      
      <View style={styles.buttonContainer}>
        {onRetry && (
          <Button
            title={t('errors.retry')}
            onPress={onRetry}
            buttonStyle={[
              styles.button,
              {
                backgroundColor: colors.primary,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                marginRight: onDismiss ? spacing.sm : 0,
              }
            ]}
            titleStyle={typography.body}
            icon={
              <Icon
                name="refresh"
                type="material-community"
                size={20}
                color={colors.white}
                style={{ marginRight: spacing.sm }}
              />
            }
            testID={`${testID}-retry-button`}
          />
        )}
        
        {onDismiss && (
          <Button
            title={t('errors.dismiss')}
            onPress={onDismiss}
            type="outline"
            buttonStyle={[
              styles.button,
              {
                borderColor: colors.border,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                marginLeft: onRetry ? spacing.sm : 0,
              }
            ]}
            titleStyle={[typography.body, { color: colors.textSecondary }]}
            testID={`${testID}-dismiss-button`}
          />
        )}
      </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    minWidth: 100,
  },
});