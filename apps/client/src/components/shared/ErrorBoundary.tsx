import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, Icon, Header } from 'react-native-elements';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'global' | 'screen' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorType: 'network' | 'component' | 'runtime' | 'unknown';
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorType: 'unknown',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorType = ErrorBoundary.determineErrorType(error);
    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to crash analytics service via errorService
    // Import will be added at top of file
    import('../../services/errorService').then(({ errorService }) => {
      errorService.logError(error, errorInfo);
    });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error info for display
    this.setState({
      errorInfo,
    });
  }

  static determineErrorType(error: Error): State['errorType'] {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('component') || message.includes('render')) {
      return 'component';
    }
    if (message.includes('runtime') || message.includes('undefined')) {
      return 'runtime';
    }
    
    return 'unknown';
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorType: 'unknown',
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorType={this.state.errorType}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleReset}
          level={this.props.level || 'component'}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorType: State['errorType'];
  errorInfo?: ErrorInfo;
  onRetry: () => void;
  level: 'global' | 'screen' | 'component';
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorType,
  errorInfo,
  onRetry,
  level,
}) => {
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return 'wifi-off';
      case 'component':
        return 'alert-triangle';
      case 'runtime':
        return 'cpu';
      default:
        return 'alert-circle';
    }
  };

  const getErrorTitle = () => {
    switch (errorType) {
      case 'network':
        return '網路連線錯誤';
      case 'component':
        return '畫面顯示錯誤';
      case 'runtime':
        return '執行時發生錯誤';
      default:
        return '發生未預期的錯誤';
    }
  };

  const getErrorDescription = () => {
    switch (errorType) {
      case 'network':
        return '無法連接到伺服器，請檢查您的網路連線後重試。';
      case 'component':
        return '畫面載入時發生問題，請重新整理頁面。';
      case 'runtime':
        return '應用程式執行時發生錯誤，請稍後再試。';
      default:
        return '很抱歉造成您的不便，請稍後再試或聯繫客服。';
    }
  };

  if (level === 'global') {
    return (
      <View style={styles.globalContainer}>
        <Header
          centerComponent={{ text: '錯誤', style: { color: '#fff', fontSize: 18 } }}
          backgroundColor="#FF6B6B"
        />
        <ScrollView contentContainerStyle={styles.globalContent}>
          <Icon
            name={getErrorIcon()}
            type="feather"
            size={80}
            color="#FF6B6B"
            containerStyle={styles.iconContainer}
          />
          <Text style={styles.globalTitle}>{getErrorTitle()}</Text>
          <Text style={styles.globalDescription}>{getErrorDescription()}</Text>
          
          {__DEV__ && error && (
            <View style={styles.debugCard}>
                <Text style={styles.debugTitle}>除錯資訊 (僅開發模式顯示)</Text>
                <Text style={styles.debugMessage}>{error.message}</Text>
                {errorInfo && (
                  <ScrollView horizontal style={styles.debugStack}>
                    <Text style={styles.debugStackText}>
                      {errorInfo.componentStack}
                    </Text>
                  </ScrollView>
                )}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="重試"
              onPress={onRetry}
              buttonStyle={styles.retryButton}
              titleStyle={styles.retryButtonText}
              icon={
                <Icon
                  name="refresh"
                  type="feather"
                  color="white"
                  size={20}
                  style={{ marginRight: 8 }}
                />
              }
            />
            <Button
              title="返回首頁"
              onPress={() => {
                // Navigate to home - implement navigation logic
                onRetry();
              }}
              type="outline"
              buttonStyle={styles.homeButton}
              titleStyle={styles.homeButtonText}
            />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.cardContainer, styles.cardContent]}>
        <Icon
          name={getErrorIcon()}
          type="feather"
          size={48}
          color="#FF6B6B"
          containerStyle={styles.cardIconContainer}
        />
        <Text style={styles.cardTitle}>{getErrorTitle()}</Text>
        <Text style={styles.cardDescription}>{getErrorDescription()}</Text>
        
        {__DEV__ && error && (
          <View style={styles.debugSection}>
            <Text style={styles.debugText} numberOfLines={2}>
              {error.message}
            </Text>
          </View>
        )}

        <Button
          title="重試"
          onPress={onRetry}
          buttonStyle={styles.cardRetryButton}
          icon={
            <Icon
              name="refresh"
              type="feather"
              color="white"
              size={16}
              style={{ marginRight: 4 }}
            />
          }
        />
    </View>
  );
};

const styles = StyleSheet.create({
  // Global error styles
  globalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  globalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  globalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  globalDescription: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    lineHeight: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 32,
    width: '100%',
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    borderColor: '#2196F3',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 12,
  },
  homeButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },

  // Card error styles
  cardContainer: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  cardContent: {
    alignItems: 'center',
    padding: 16,
  },
  cardIconContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  cardRetryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },

  // Debug info styles
  debugCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 16,
    width: '100%',
    maxWidth: 400,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  debugMessage: {
    fontSize: 12,
    color: '#856404',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  debugStack: {
    maxHeight: 100,
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
  },
  debugStackText: {
    fontSize: 10,
    color: '#6c757d',
    fontFamily: 'monospace',
  },
  debugSection: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    width: '100%',
  },
  debugText: {
    fontSize: 11,
    color: '#856404',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;