import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Button, Icon, Text } from 'react-native-elements';
import { useAppTheme } from '@/theme';
import { retryService } from '../../services/retryService';

interface RetryButtonProps {
  onRetry: () => Promise<any>;
  title?: string;
  retryingTitle?: string;
  successTitle?: string;
  errorTitle?: string;
  maxAttempts?: number;
  showAttemptCount?: boolean;
  variant?: 'default' | 'outline' | 'clear';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  title = '重試',
  retryingTitle = '重試中...',
  successTitle = '成功',
  errorTitle = '失敗，請再試',
  maxAttempts = 3,
  showAttemptCount = false,
  variant = 'default',
  size = 'medium',
  disabled = false,
  onSuccess,
  onError,
}) => {
  const theme = useAppTheme();
  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [status, setStatus] = useState<'idle' | 'retrying' | 'success' | 'error'>('idle');

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return { padding: 8, fontSize: 14, iconSize: 16 };
      case 'large':
        return { padding: 16, fontSize: 18, iconSize: 24 };
      default:
        return { padding: 12, fontSize: 16, iconSize: 20 };
    }
  };

  const buttonSize = getButtonSize();

  const handleRetry = async () => {
    setIsRetrying(true);
    setStatus('retrying');
    setAttemptCount(prev => prev + 1);

    try {
      const result = await retryService.executeWithRetry(onRetry, {
        maxAttempts,
        onRetry: (attempt) => {
          setAttemptCount(attempt);
        },
      });

      if (result.success) {
        setStatus('success');
        if (onSuccess) {
          onSuccess(result.data);
        }
        // Reset after success
        setTimeout(() => {
          setStatus('idle');
          setAttemptCount(0);
        }, 2000);
      } else {
        throw result.error;
      }
    } catch (error) {
      setStatus('error');
      if (onError) {
        onError(error);
      }
      // Reset after error
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } finally {
      setIsRetrying(false);
    }
  };

  const getButtonTitle = () => {
    switch (status) {
      case 'retrying':
        return showAttemptCount ? `${retryingTitle} (${attemptCount}/${maxAttempts})` : retryingTitle;
      case 'success':
        return successTitle;
      case 'error':
        return errorTitle;
      default:
        return showAttemptCount && attemptCount > 0 ? `${title} (${attemptCount})` : title;
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'retrying':
        return null; // Show loading indicator instead
      case 'success':
        return (
          <Icon
            name="check"
            type="feather"
            size={buttonSize.iconSize}
            color="white"
            style={{ marginRight: 4 }}
          />
        );
      case 'error':
        return (
          <Icon
            name="x"
            type="feather"
            size={buttonSize.iconSize}
            color="white"
            style={{ marginRight: 4 }}
          />
        );
      default:
        return (
          <Icon
            name="refresh-cw"
            type="feather"
            size={buttonSize.iconSize}
            color={variant === 'outline' ? theme.colors.primary : 'white'}
            style={{ marginRight: 4 }}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={getButtonTitle()}
        onPress={handleRetry}
        disabled={disabled || isRetrying}
        type={variant === 'outline' ? 'outline' : variant === 'clear' ? 'clear' : 'solid'}
        buttonStyle={[
          styles.button,
          {
            backgroundColor: variant === 'default' ? getButtonColor() : 'transparent',
            borderColor: variant === 'outline' ? getButtonColor() : 'transparent',
            paddingHorizontal: buttonSize.padding * 1.5,
            paddingVertical: buttonSize.padding,
          },
        ]}
        titleStyle={{
          fontSize: buttonSize.fontSize,
          color: variant === 'outline' || variant === 'clear' ? getButtonColor() : 'white',
        }}
        loading={isRetrying}
        loadingProps={{
          size: buttonSize.iconSize,
          color: variant === 'outline' || variant === 'clear' ? getButtonColor() : 'white',
        }}
        icon={!isRetrying ? (getIcon() || undefined) : undefined}
      />
      {showAttemptCount && attemptCount > 0 && status === 'idle' && (
        <Text style={[styles.attemptText, { color: theme.colors.grey3 }]}>
          嘗試次數: {attemptCount}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    minWidth: 100,
  },
  attemptText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default RetryButton;