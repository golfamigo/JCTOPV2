import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Overlay, Text, Button, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { ErrorCard } from '../molecules/ErrorCard';

export interface ErrorOverlayProps {
  visible: boolean;
  title?: string;
  message: string;
  details?: string;
  errorType?: 'network' | 'server' | 'validation' | 'generic';
  onRetry?: () => void;
  onDismiss?: () => void;
  onGoBack?: () => void;
  fullScreen?: boolean;
  showDetails?: boolean;
  testID?: string;
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({
  visible,
  title,
  message,
  details,
  errorType = 'generic',
  onRetry,
  onDismiss,
  onGoBack,
  fullScreen = false,
  showDetails = false,
  testID = 'error-overlay',
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const [detailsVisible, setDetailsVisible] = React.useState(false);

  const renderErrorContent = () => (
    <View style={styles.contentContainer}>
      <ErrorCard
        title={title}
        message={message}
        errorType={errorType}
        showIcon={true}
        onRetry={undefined}
        onDismiss={undefined}
        testID={`${testID}-card`}
      />
      
      {showDetails && details && (
        <View style={[styles.detailsContainer, { marginTop: spacing.md }]}>
          <Button
            title={detailsVisible ? t('errors.hideDetails') : t('errors.showDetails')}
            type="clear"
            onPress={() => setDetailsVisible(!detailsVisible)}
            titleStyle={[typography.small, { color: colors.primary }]}
            icon={
              <Icon
                name={detailsVisible ? 'chevron-up' : 'chevron-down'}
                type="material-community"
                size={16}
                color={colors.primary}
              />
            }
            iconRight
            testID={`${testID}-details-toggle`}
          />
          
          {detailsVisible && (
            <ScrollView
              style={[
                styles.detailsText,
                {
                  backgroundColor: colors.lightGrey,
                  padding: spacing.md,
                  marginTop: spacing.sm,
                }
              ]}
              testID={`${testID}-details-content`}
            >
              <Text style={[typography.small, { color: colors.textSecondary }]}>
                {details}
              </Text>
            </ScrollView>
          )}
        </View>
      )}
      
      <View style={[styles.buttonContainer, { marginTop: spacing.xl }]}>
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
        
        {onGoBack && (
          <Button
            title={t('errors.goBack')}
            onPress={onGoBack}
            type="outline"
            buttonStyle={[
              styles.button,
              {
                borderColor: colors.border,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
              }
            ]}
            titleStyle={[typography.body, { color: colors.textSecondary }]}
            icon={
              <Icon
                name="arrow-left"
                type="material-community"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: spacing.sm }}
              />
            }
            testID={`${testID}-back-button`}
          />
        )}
        
        {onDismiss && (
          <Button
            title={t('errors.dismiss')}
            onPress={onDismiss}
            type="clear"
            buttonStyle={[
              styles.button,
              {
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
              }
            ]}
            titleStyle={[typography.body, { color: colors.textSecondary }]}
            testID={`${testID}-dismiss-button`}
          />
        )}
      </View>
    </View>
  );

  if (fullScreen) {
    return visible ? (
      <View
        style={[
          styles.fullScreenContainer,
          { backgroundColor: colors.background }
        ]}
        testID={`${testID}-fullscreen`}
      >
        {renderErrorContent()}
      </View>
    ) : null;
  }

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onDismiss}
      overlayStyle={[
        styles.overlayContainer,
        {
          backgroundColor: colors.white,
          borderRadius: 8,
          padding: spacing.lg,
        }
      ]}
      testID={testID}
    >
      {renderErrorContent()}
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    maxWidth: 400,
    width: '90%',
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  contentContainer: {
    width: '100%',
  },
  detailsContainer: {
    width: '100%',
  },
  detailsText: {
    maxHeight: 120,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    borderRadius: 8,
    minWidth: 100,
  },
});