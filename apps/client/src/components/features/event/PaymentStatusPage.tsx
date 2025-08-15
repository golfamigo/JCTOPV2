import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, StyleSheet, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Icon, Badge, LinearProgress } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { PaymentStatusResponse } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';
import { useAppTheme } from '@/theme';

interface PaymentStatusPageProps {
  paymentId: string;
  eventId?: string;
  onSuccess?: () => void;
  onFailure?: () => void;
  onCancel?: () => void;
}

const PaymentStatusPage: React.FC<PaymentStatusPageProps> = ({
  paymentId,
  eventId,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const router = useRouter();
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;

  useEffect(() => {
    if (paymentId) {
      startStatusPolling();
    }

    return () => {
      // Cleanup timeout on unmount
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [paymentId]);

  const startStatusPolling = () => {
    let pollCount = 0;
    const maxPolls = 60; // 3 minutes with 3-second intervals

    const poll = async () => {
      try {
        const status = await paymentService.getPaymentStatus(paymentId);
        setPaymentStatus(status);
        setIsLoading(false);
        setPollingCount(pollCount);

        // Check if payment is in a final state
        if (['completed', 'failed', 'cancelled', 'refunded'].includes(status.status)) {
          handleFinalStatus(status);
          return; // Stop polling
        }

        // Continue polling if not in final state and under max polls
        pollCount++;
        if (pollCount < maxPolls) {
          pollTimeoutRef.current = setTimeout(poll, 3000); // Poll every 3 seconds
        } else {
          // Timeout reached
          setError(t('payment.statusCheckTimeout'));
        }
      } catch (err: any) {
        console.error('Error polling payment status:', err);
        setError(err.message || t('payment.cannotGetStatus'));
        setIsLoading(false);
      }
    };

    poll();
  };

  const handleFinalStatus = (status: PaymentStatusResponse) => {
    switch (status.status) {
      case 'completed':
        Alert.alert(
          t('payment.paymentSuccessful'),
          t('payment.paymentSuccessDescription'),
          [{ text: t('common.confirm'), style: 'default' }]
        );
        // Redirect to confirmation page if payment is for an event registration
        if (status.payment.resourceType === 'event') {
          router.push(`/registration/confirmation/${status.payment.id}`);
        } else if (onSuccess) {
          onSuccess();
        }
        break;
      
      case 'failed':
        Alert.alert(
          t('payment.paymentFailed'),
          t('payment.paymentFailedDescription'),
          [{ text: t('common.confirm'), style: 'default' }]
        );
        if (onFailure) onFailure();
        break;
      
      case 'cancelled':
        Alert.alert(
          t('payment.paymentCancelled'),
          t('payment.paymentCancelledDescription'),
          [{ text: t('common.confirm'), style: 'default' }]
        );
        if (onCancel) onCancel();
        break;
      
      case 'refunded':
        Alert.alert(
          t('payment.paymentRefunded'),
          t('payment.paymentRefundedDescription'),
          [{ text: t('common.confirm'), style: 'default' }]
        );
        break;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return { name: 'check-circle', type: 'material-community' };
      case 'failed':
        return { name: 'alert-circle', type: 'material-community' };
      case 'cancelled':
        return { name: 'information', type: 'material-community' };
      case 'refunded':
        return { name: 'cash-refund', type: 'material-community' };
      case 'processing':
      case 'pending':
      default:
        return { name: 'clock-outline', type: 'material-community' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'failed':
        return colors.danger;
      case 'cancelled':
        return colors.warning;
      case 'refunded':
        return colors.primary;
      case 'processing':
      case 'pending':
      default:
        return colors.primary;
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status) {
      case 'completed':
        return t('payment.statusCompleted');
      case 'failed':
        return t('payment.statusFailed');
      case 'cancelled':
        return t('payment.statusCancelled');
      case 'refunded':
        return t('payment.statusRefunded');
      case 'processing':
        return t('payment.statusProcessing');
      case 'pending':
        return t('payment.statusPending');
      default:
        return t('payment.statusUnknown');
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'completed':
        return t('payment.statusCompletedDesc');
      case 'failed':
        return t('payment.statusFailedDesc');
      case 'cancelled':
        return t('payment.statusCancelledDesc');
      case 'refunded':
        return t('payment.statusRefundedDesc');
      case 'processing':
        return t('payment.statusProcessingDesc');
      case 'pending':
        return t('payment.statusPendingDesc');
      default:
        return t('payment.statusUnknownDesc');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRetryPayment = () => {
    if (eventId) {
      router.push(`/event/${eventId}/register`);
    } else {
      router.back();
    }
  };

  const handleGoToEvent = () => {
    if (eventId) {
      router.push(`/event/${eventId}`);
    } else {
      router.push('/events');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: spacing.md,
      paddingBottom: spacing.xl,
      maxWidth: isTablet ? 600 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
    centerCard: {
      marginVertical: spacing.lg,
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusIcon: {
      marginBottom: spacing.lg,
    },
    statusTitle: {
      ...typography.h1,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    statusDescription: {
      ...typography.body,
      color: colors.midGrey,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: spacing.md,
    },
    badge: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      marginVertical: spacing.md,
    },
    badgeText: {
      ...typography.body,
      color: colors.white,
      fontWeight: '600',
    },
    progressContainer: {
      width: '100%',
      marginVertical: spacing.md,
    },
    progressText: {
      ...typography.small,
      color: colors.midGrey,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    detailsCard: {
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
      padding: spacing.md,
      marginVertical: spacing.md,
      width: '100%',
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: spacing.xs,
    },
    detailLabel: {
      ...typography.small,
      color: colors.midGrey,
    },
    detailValue: {
      ...typography.small,
      fontWeight: '500',
      color: colors.text,
    },
    actionContainer: {
      width: '100%',
      marginTop: spacing.lg,
    },
    actionButton: {
      marginVertical: spacing.xs,
    },
    successButton: {
      backgroundColor: colors.success,
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    loadingContainer: {
      padding: spacing.xl * 2,
    },
    loadingText: {
      ...typography.body,
      color: colors.midGrey,
      marginTop: spacing.md,
    },
    loadingSubtext: {
      ...typography.small,
      color: colors.midGrey,
      marginTop: spacing.sm,
    },
    errorIcon: {
      marginBottom: spacing.md,
    },
    errorTitle: {
      ...typography.h2,
      color: colors.danger,
      marginBottom: spacing.sm,
    },
    errorText: {
      ...typography.body,
      color: colors.midGrey,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
  });

  if (isLoading) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Card containerStyle={styles.centerCard}>
            <View style={[styles.centerContent, styles.loadingContainer]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>{t('payment.checkingStatus')}</Text>
              <Text style={styles.loadingSubtext}>{t('payment.pleaseWait')}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Card containerStyle={styles.centerCard}>
            <View style={styles.centerContent}>
              <Icon
                name="alert-circle"
                type="material-community"
                size={64}
                color={colors.danger}
                containerStyle={styles.errorIcon}
              />
              <Text style={styles.errorTitle}>{t('common.error')}</Text>
              <Text style={styles.errorText}>{error}</Text>
              
              <View style={styles.actionContainer}>
                <Button
                  title={t('common.tryAgain')}
                  onPress={() => {
                    setError(null);
                    setIsLoading(true);
                    startStatusPolling();
                  }}
                  buttonStyle={[styles.actionButton, styles.primaryButton]}
                />
                <Button
                  title={t('payment.retryPayment')}
                  type="outline"
                  onPress={handleRetryPayment}
                  buttonStyle={styles.actionButton}
                  titleStyle={{ color: colors.primary }}
                />
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }

  if (!paymentStatus) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <Card containerStyle={styles.centerCard}>
            <View style={styles.centerContent}>
              <Text style={styles.statusDescription}>{t('payment.noPaymentInfo')}</Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }

  const isProcessing = ['pending', 'processing'].includes(paymentStatus.status);
  const isSuccess = paymentStatus.status === 'completed';
  const isFailed = paymentStatus.status === 'failed';
  const statusIcon = getStatusIcon(paymentStatus.status);
  const statusColor = getStatusColor(paymentStatus.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Card containerStyle={styles.centerCard}>
          <View style={styles.centerContent}>
            <Icon
              name={statusIcon.name}
              type={statusIcon.type}
              size={64}
              color={statusColor}
              containerStyle={styles.statusIcon}
            />
            
            <Text style={[styles.statusTitle, { color: statusColor }]}>
              {getStatusTitle(paymentStatus.status)}
            </Text>
            
            <Text style={styles.statusDescription}>
              {getStatusDescription(paymentStatus.status)}
            </Text>

            <View style={[styles.badge, { backgroundColor: statusColor }]}>
              <Text style={styles.badgeText}>
                {paymentService.getPaymentStatusText(paymentStatus.status)}
              </Text>
            </View>

            {isProcessing && (
              <View style={styles.progressContainer}>
                <LinearProgress
                  color={colors.primary}
                  variant="indeterminate"
                  style={{ height: 4, borderRadius: 2 }}
                />
                <Text style={styles.progressText}>
                  {t('payment.pollingStatus', { count: pollingCount })}
                </Text>
              </View>
            )}

            {/* Payment Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('payment.paymentId')}:</Text>
                <Text style={styles.detailValue}>
                  {paymentStatus.payment.id.substring(0, 8)}...
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('payment.amount')}:</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(paymentStatus.payment.finalAmount)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('payment.paymentMethod')}:</Text>
                <Text style={styles.detailValue}>
                  {paymentService.getPaymentMethodName(paymentStatus.payment.paymentMethod)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('payment.processTime')}:</Text>
                <Text style={styles.detailValue}>
                  {new Date(paymentStatus.payment.updatedAt).toLocaleString('zh-TW')}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {isSuccess && (
                <Button
                  title={t('payment.viewEventDetails')}
                  icon={
                    <Icon
                      name="arrow-right"
                      type="material-community"
                      size={20}
                      color={colors.white}
                      style={{ marginLeft: spacing.xs }}
                    />
                  }
                  iconPosition="right"
                  onPress={handleGoToEvent}
                  buttonStyle={[styles.actionButton, styles.successButton]}
                />
              )}
              
              {isFailed && (
                <Button
                  title={t('payment.retryPayment')}
                  onPress={handleRetryPayment}
                  buttonStyle={[styles.actionButton, styles.primaryButton]}
                />
              )}
              
              {!isSuccess && (
                <Button
                  title={t('payment.backToEvent')}
                  type="outline"
                  onPress={handleGoToEvent}
                  buttonStyle={styles.actionButton}
                  titleStyle={{ color: colors.primary }}
                />
              )}
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

export default PaymentStatusPage;