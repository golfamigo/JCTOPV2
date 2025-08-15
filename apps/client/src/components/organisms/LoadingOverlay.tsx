import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Overlay, Text } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { LoadingSkeleton, SkeletonCard, SkeletonList } from '../atoms/LoadingSkeleton';

export interface LoadingOverlayProps {
  /**
   * Whether the loading overlay is visible
   */
  visible: boolean;
  /**
   * Loading message to display
   */
  message?: string;
  /**
   * Type of loading animation to show
   */
  variant?: 'spinner' | 'skeleton-cards' | 'skeleton-list' | 'full-screen';
  /**
   * Number of skeleton items to show (for skeleton variants)
   */
  skeletonItems?: number;
  /**
   * Whether to show backdrop
   */
  hasBackdrop?: boolean;
  /**
   * Custom overlay styles
   */
  overlayStyle?: any;
  /**
   * Callback when overlay is dismissed (if dismissible)
   */
  onBackdropPress?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  variant = 'spinner',
  skeletonItems = 3,
  hasBackdrop = true,
  overlayStyle,
  onBackdropPress,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();

  const renderLoadingContent = () => {
    switch (variant) {
      case 'skeleton-cards':
        return (
          <View style={styles.skeletonContainer}>
            {Array.from({ length: skeletonItems }).map((_, index) => (
              <View key={index} style={[styles.cardContainer, { marginBottom: spacing.md }]}>
                <SkeletonCard />
              </View>
            ))}
          </View>
        );

      case 'skeleton-list':
        return (
          <View style={styles.skeletonContainer}>
            <SkeletonList items={skeletonItems} />
          </View>
        );

      case 'full-screen':
        return (
          <View style={[styles.fullScreenContainer, { backgroundColor: colors.lightGrey }]}>
            <LoadingSkeleton height={200} marginBottom={spacing.lg} borderRadius={12} />
            <LoadingSkeleton width="80%" height={24} marginBottom={spacing.md} />
            <LoadingSkeleton width="60%" height={16} marginBottom={spacing.xl} />
            <SkeletonList items={4} />
          </View>
        );

      case 'spinner':
      default:
        return (
          <View style={styles.spinnerContainer}>
            <LoadingSkeleton
              width={40}
              height={40}
              borderRadius={20}
              marginBottom={spacing.md}
              animation="pulse"
            />
            {message && (
              <Text style={[typography.body, { color: colors.text, textAlign: 'center' }]}>
                {message}
              </Text>
            )}
          </View>
        );
    }
  };

  if (variant === 'full-screen') {
    return (
      <View style={[styles.fullScreenOverlay, { backgroundColor: colors.background }]}>
        {renderLoadingContent()}
      </View>
    );
  }

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onBackdropPress}
      overlayStyle={[
        styles.overlayContainer,
        {
          backgroundColor: colors.white,
          borderRadius: 8,
          padding: spacing.lg,
        },
        overlayStyle,
      ]}
      backdropStyle={hasBackdrop ? { backgroundColor: 'rgba(0, 0, 0, 0.5)' } : undefined}
    >
      {renderLoadingContent()}
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  skeletonContainer: {
    width: '100%',
    minWidth: 280,
  },
  cardContainer: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  fullScreenContainer: {
    flex: 1,
    padding: 16,
  },
});

// Convenient preset components
export const LoadingSpinner: React.FC<{
  visible: boolean;
  message?: string;
  onBackdropPress?: () => void;
}> = (props) => (
  <LoadingOverlay {...props} variant="spinner" />
);

export const LoadingCards: React.FC<{
  visible: boolean;
  items?: number;
  onBackdropPress?: () => void;
}> = (props) => (
  <LoadingOverlay {...props} variant="skeleton-cards" skeletonItems={props.items} />
);

export const LoadingList: React.FC<{
  visible: boolean;
  items?: number;
  onBackdropPress?: () => void;
}> = (props) => (
  <LoadingOverlay {...props} variant="skeleton-list" skeletonItems={props.items} />
);

export const FullScreenLoading: React.FC<{
  visible: boolean;
}> = (props) => (
  <LoadingOverlay {...props} variant="full-screen" hasBackdrop={false} />
);