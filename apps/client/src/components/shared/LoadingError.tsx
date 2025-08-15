import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, Button, Icon } from 'react-native-elements';
import { useAppTheme } from '@/theme';
import { ERROR_MESSAGES } from '../../constants/errorMessages';

interface LoadingErrorProps {
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  loadingMessage?: string;
  errorMessage?: string;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingError: React.FC<LoadingErrorProps> = ({
  isLoading = false,
  error = null,
  onRetry,
  loadingMessage = '載入中...',
  errorMessage,
  showIcon = true,
  size = 'medium',
}) => {
  const theme = useAppTheme();

  const getSize = () => {
    switch (size) {
      case 'small':
        return { indicator: 24, icon: 32, fontSize: 14 };
      case 'large':
        return { indicator: 48, icon: 64, fontSize: 18 };
      default:
        return { indicator: 36, icon: 48, fontSize: 16 };
    }
  };

  const sizes = getSize();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size={sizes.indicator}
          color={theme.colors.primary}
          style={styles.indicator}
        />
        <Text style={[styles.text, { fontSize: sizes.fontSize, color: theme.colors.grey3 }]}>
          {loadingMessage}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        {showIcon && (
          <Icon
            name="alert-circle"
            type="feather"
            size={sizes.icon}
            color={theme.colors.error}
            containerStyle={styles.iconContainer}
          />
        )}
        <Text style={[styles.errorText, { fontSize: sizes.fontSize, color: theme.colors.error }]}>
          {errorMessage || error.message || ERROR_MESSAGES.general.somethingWrong}
        </Text>
        {onRetry && (
          <Button
            title="重試"
            onPress={onRetry}
            buttonStyle={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            titleStyle={{ fontSize: sizes.fontSize }}
            icon={
              <Icon
                name="refresh"
                type="feather"
                size={sizes.fontSize}
                color="white"
                style={{ marginRight: 4 }}
              />
            }
          />
        )}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 100,
  },
  indicator: {
    marginBottom: 12,
  },
  iconContainer: {
    marginBottom: 12,
  },
  text: {
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
});

export default LoadingError;