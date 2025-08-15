import React, { useState, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, Card, Badge, Icon, Divider } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { PaymentResponse, PaymentStatusResponse } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';
import { useAppTheme } from '../../../theme';

interface ECPayPaymentFormProps {
  paymentId: string;
  amount: number;
  currency?: string;
  description: string;
  onSuccess: (paymentResponse: PaymentResponse) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const ECPayPaymentForm: React.FC<ECPayPaymentFormProps> = ({
  paymentId,
  amount,
  currency = 'TWD',
  description,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const { colors } = useAppTheme();

  const paymentMethods = paymentService.getECPayPaymentMethods();

  useEffect(() => {
    // Start polling payment status when component mounts
    startPaymentStatusPolling();

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [paymentId]);

  const startPaymentStatusPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const poll = () => {
      paymentService.getPaymentStatus(paymentId)
        .then((status) => {
          setPaymentStatus(status);
          
          if (status.status === 'completed') {
            Alert.alert('付款成功', '您的付款已成功處理');
            onSuccess({ 
              paymentId, 
              status: 'completed', 
              amount, 
              currency 
            } as PaymentResponse);
            if (pollingInterval) clearInterval(pollingInterval);
          } else if (status.status === 'failed') {
            setError('付款失敗，請重試');
            onError('付款失敗，請重試');
            if (pollingInterval) clearInterval(pollingInterval);
          } else if (status.status === 'cancelled') {
            setError('付款已取消');
            if (onCancel) onCancel();
            if (pollingInterval) clearInterval(pollingInterval);
          }
        })
        .catch((err) => {
          console.error('Error polling payment status:', err);
        });
    };

    // Poll immediately and then every 3 seconds
    poll();
    const interval = setInterval(poll, 3000);
    setPollingInterval(interval);
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setError(null);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Credit':
      case 'ApplePay':
      case 'GooglePay':
        return 'credit-card';
      case 'ATM':
        return 'account-balance';
      case 'CVS':
      case 'BARCODE':
        return 'store';
      default:
        return 'payment';
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Credit':
        return colors.primary;
      case 'ATM':
        return colors.success;
      case 'CVS':
      case 'BARCODE':
        return colors.warning;
      case 'ApplePay':
        return colors.grey2;
      case 'GooglePay':
        return colors.error;
      default:
        return colors.secondary;
    }
  };

  const getPaymentMethodDescription = (method: string) => {
    switch (method) {
      case 'Credit':
        return '支援 Visa、MasterCard、JCB 等信用卡';
      case 'ATM':
        return '透過 ATM 轉帳付款，需 1-3 個工作天入帳';
      case 'CVS':
        return '7-11、全家、萊爾富、OK 超商代碼繳費';
      case 'BARCODE':
        return '7-11、全家、萊爾富、OK 超商條碼繳費';
      case 'ApplePay':
        return '使用 Apple Pay 快速付款';
      case 'GooglePay':
        return '使用 Google Pay 快速付款';
      default:
        return '系統自動選擇最適合的付款方式';
    }
  };

  const getStatusText = (status: string) => {
    return paymentService.getPaymentStatusText(status);
  };

  const getStatusColor = (status: string) => {
    return paymentService.getPaymentStatusColor(status);
  };

  // If payment is processing or completed, show status
  if (paymentStatus && ['processing', 'completed', 'failed'].includes(paymentStatus.status)) {
    return (
      <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.statusContainer}>
          <Icon 
            name={paymentStatus.status === 'completed' ? 'check-circle' : 'info'} 
            type="material" 
            size={48} 
            color={paymentStatus.status === 'completed' ? colors.success : colors.primary} 
          />
          
          <Text h3 style={[styles.statusTitle, { color: colors.text }]}>
            {paymentStatus.status === 'completed' ? '付款成功' : '付款處理中'}
          </Text>
          
          <Text style={[styles.statusDescription, { color: colors.grey2 }]}>
            {paymentStatus.status === 'completed' 
              ? '您的付款已成功處理，請等待系統確認。' 
              : '正在處理您的付款，請稍候...'}
          </Text>
          
          <Badge 
            value={getStatusText(paymentStatus.status)}
            badgeStyle={[
              styles.statusBadge, 
              { backgroundColor: paymentStatus.status === 'completed' ? colors.success : colors.primary }
            ]}
            textStyle={styles.statusBadgeText}
          />
          
          {paymentStatus.status === 'processing' && (
            <View style={[styles.progressBar, { backgroundColor: colors.grey5 }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
            </View>
          )}
        </View>
      </Card>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
        <Text h2 style={[styles.title, { color: colors.text }]}>
          ECPay 綠界支付
        </Text>
        
        {/* Payment Summary */}
        <View style={[styles.summaryBox, { backgroundColor: colors.grey5 }]}>
          <Text style={[styles.summaryLabel, { color: colors.grey2 }]}>
            付款金額
          </Text>
          <Text style={[styles.summaryAmount, { color: colors.primary }]}>
            {paymentService.formatAmount(amount, currency)}
          </Text>
          <Text style={[styles.summaryDescription, { color: colors.grey2 }]}>
            {description}
          </Text>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.methodSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            選擇付款方式
          </Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.code}
              onPress={() => handlePaymentMethodChange(method.code)}
              activeOpacity={0.7}
            >
              <View 
                style={[
                  styles.methodCard,
                  { 
                    borderColor: selectedPaymentMethod === method.code ? colors.primary : colors.grey4,
                    backgroundColor: selectedPaymentMethod === method.code ? colors.primary + '10' : colors.card
                  }
                ]}
              >
                <View style={styles.methodHeader}>
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radioOuter,
                      { borderColor: selectedPaymentMethod === method.code ? colors.primary : colors.grey3 }
                    ]}>
                      {selectedPaymentMethod === method.code && (
                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                      )}
                    </View>
                  </View>
                  
                  <Icon 
                    name={getPaymentMethodIcon(method.code)} 
                    type="material" 
                    color={colors.grey2} 
                    size={20}
                    containerStyle={styles.methodIcon}
                  />
                  
                  <Text style={[styles.methodName, { color: colors.text }]}>
                    {method.name}
                  </Text>
                  
                  <Badge 
                    value={method.code}
                    badgeStyle={[
                      styles.methodBadge,
                      { backgroundColor: getPaymentMethodColor(method.code) + '20' }
                    ]}
                    textStyle={[styles.methodBadgeText, { color: getPaymentMethodColor(method.code) }]}
                  />
                </View>
                
                <Text style={[styles.methodDescription, { color: colors.grey2 }]}>
                  {getPaymentMethodDescription(method.code)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Error Alert */}
        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.error + '10', borderColor: colors.error }]}>
            <Icon
              name="error"
              type="material"
              color={colors.error}
              size={20}
              containerStyle={styles.errorIcon}
            />
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Security Notice */}
        <View style={[styles.securityNotice, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
          <Icon 
            name="lock" 
            type="material" 
            color={colors.success} 
            size={16}
            containerStyle={styles.securityIcon}
          />
          <Text style={[styles.securityText, { color: colors.success }]}>
            SSL 安全加密傳輸，您的付款資訊受到完整保護
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <Button
              title="取消"
              type="outline"
              onPress={onCancel}
              disabled={isProcessing}
              buttonStyle={[styles.cancelButton, { borderColor: colors.grey3 }]}
              titleStyle={{ color: colors.text }}
            />
          )}
          
          <Button
            title={isProcessing ? '準備中...' : '確認付款'}
            loading={isProcessing}
            onPress={() => {
              setIsProcessing(true);
              Alert.alert('前往付款頁面', '正在為您準備付款頁面...');
            }}
            buttonStyle={[
              styles.confirmButton,
              { backgroundColor: colors.primary },
              onCancel ? { flex: 2 } : { flex: 1 }
            ]}
            icon={
              !isProcessing && (
                <Icon
                  name="credit-card"
                  type="material"
                  color={colors.white}
                  size={20}
                  containerStyle={{ marginRight: 8 }}
                />
              )
            }
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusContainer: {
    alignItems: 'center',
    padding: 24,
  },
  statusTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  summaryBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  methodSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  methodCard: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  methodIcon: {
    marginRight: 8,
  },
  methodName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  methodBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  methodBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  methodDescription: {
    fontSize: 13,
    marginLeft: 44,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 24,
  },
  securityIcon: {
    marginRight: 8,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 2,
  },
  confirmButton: {
    borderRadius: 8,
  },
});

export default ECPayPaymentForm;