import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  testID?: string;
  level?: 'global' | 'screen' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showErrorDetails: boolean;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error service for crash analytics
    import('../../services/errorService').then(({ errorService }) => {
      errorService.logError(error, errorInfo);
    }).catch(err => {
      // Fallback to console if errorService fails to load
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    });
    
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (__DEV__) {
      console.error('Component Stack:', errorInfo.componentStack);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showErrorDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showErrorDetails: !prevState.showErrorDetails,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          showDetails={this.props.showDetails ?? __DEV__}
          showErrorDetails={this.state.showErrorDetails}
          onToggleDetails={this.toggleDetails}
          testID={this.props.testID}
          level={this.props.level || 'component'}
        />
      );
    }

    return this.props.children;
  }
}

interface FallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
  showDetails: boolean;
  showErrorDetails: boolean;
  onToggleDetails: () => void;
  testID?: string;
  level?: 'global' | 'screen' | 'component';
}

const ErrorBoundaryFallback: React.FC<FallbackProps> = ({
  error,
  errorInfo,
  onReset,
  showDetails,
  showErrorDetails,
  onToggleDetails,
  testID = 'error-boundary',
  level = 'component',
}) => {
  // Note: We can't use hooks in a component rendered from a class component error boundary
  // We'll create a wrapper component to handle this
  return (
    <ErrorBoundaryFallbackWithHooks
      error={error}
      errorInfo={errorInfo}
      onReset={onReset}
      showDetails={showDetails}
      showErrorDetails={showErrorDetails}
      onToggleDetails={onToggleDetails}
      testID={testID}
      level={level}
    />
  );
};

const ErrorBoundaryFallbackWithHooks: React.FC<FallbackProps> = ({
  error,
  errorInfo,
  onReset,
  showDetails,
  showErrorDetails,
  onToggleDetails,
  testID = 'error-boundary',
  level = 'component',
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();

  // Adjust styling based on error level
  const isGlobal = level === 'global';
  const containerStyle = isGlobal ? styles.globalContainer : styles.container;

  return (
    <View style={[containerStyle, { backgroundColor: colors.background }]} testID={testID}>
      <Card containerStyle={[styles.card, { padding: spacing.lg }]}>
        <View style={styles.iconContainer}>
          <Icon
            name="alert-circle-outline"
            type="material-community"
            size={64}
            color={colors.danger}
            testID={`${testID}-icon`}
          />
        </View>

        <Text h2 style={[typography.h2, styles.title, { color: colors.dark, marginBottom: spacing.sm }]}>
          {t('errors.somethingWentWrong')}
        </Text>

        <Text style={[typography.body, styles.message, { color: colors.textSecondary, marginBottom: spacing.lg }]}>
          {error?.message || t('errors.unknownError')}
        </Text>

        {showDetails && (
          <View style={[styles.detailsSection, { marginBottom: spacing.lg }]}>
            <Button
              title={showErrorDetails ? t('errors.hideDetails') : t('errors.showDetails')}
              type="clear"
              onPress={onToggleDetails}
              titleStyle={[typography.small, { color: colors.primary }]}
              icon={
                <Icon
                  name={showErrorDetails ? 'chevron-up' : 'chevron-down'}
                  type="material-community"
                  size={16}
                  color={colors.primary}
                />
              }
              iconRight
              testID={`${testID}-toggle-details`}
            />

            {showErrorDetails && errorInfo && (
              <ScrollView
                style={[
                  styles.errorDetails,
                  {
                    backgroundColor: colors.lightGrey,
                    padding: spacing.md,
                    marginTop: spacing.sm,
                  },
                ]}
                testID={`${testID}-details`}
              >
                <Text style={[typography.small, { color: colors.textSecondary, fontFamily: 'monospace' }]}>
                  {errorInfo.componentStack}
                </Text>
              </ScrollView>
            )}
          </View>
        )}

        <Button
          title={t('errors.retry')}
          onPress={onReset}
          buttonStyle={[
            styles.button,
            {
              backgroundColor: colors.primary,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            },
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
          testID={`${testID}-retry`}
        />
      </Card>
    </View>
  );
};

export const ErrorBoundary: React.FC<Props> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} ref={ref} />
    </ErrorBoundary>
  ));

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  globalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
  },
  detailsSection: {
    width: '100%',
  },
  errorDetails: {
    maxHeight: 200,
    borderRadius: 8,
  },
  button: {
    borderRadius: 8,
    minWidth: 120,
  },
});