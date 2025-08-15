import React, { useState, useEffect } from 'react';
import {
  Button,
  Text,
  Input,
  Switch,
  Card,
  Badge,
  Icon,
  Divider,
  Tab,
  TabView
} from '@rneui/themed';
import { View, ScrollView, Alert, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { PaymentProvider, PaymentProviderDto, UpdatePaymentProviderDto } from '@jctop-event/shared-types';
import paymentService from '../../../services/paymentService';

interface PaymentProviderCredentialsFormProps {
  provider?: PaymentProvider;
  providerId: string;
  onSave: (provider: PaymentProvider) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ECPayCredentials {
  merchantId: string;
  hashKey: string;
  hashIV: string;
  useSandbox: boolean;
  returnUrl?: string;
}

interface StripeCredentials {
  publishableKey: string;
  secretKey: string;
  webhookSecret?: string;
  useSandbox: boolean;
}

type ProviderCredentials = ECPayCredentials | StripeCredentials;

const PaymentProviderCredentialsForm: React.FC<PaymentProviderCredentialsFormProps> = ({
  provider,
  providerId,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [credentials, setCredentials] = useState<ProviderCredentials>(() => {
    const initial = provider?.credentials || (providerId === 'ecpay' ? {
      merchantId: '',
      hashKey: '',
      hashIV: '',
      useSandbox: true,
      returnUrl: ''
    } : {
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      useSandbox: true
    });
    return typeof initial === 'string' ? {} as ProviderCredentials : initial;
  });

  const [isActive, setIsActive] = useState(provider?.isActive || false);
  const [isDefault, setIsDefault] = useState(provider?.isDefault || false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const validateECPayCredentials = (creds: ECPayCredentials): boolean => {
    const newErrors: Record<string, string> = {};

    if (!creds.merchantId) {
      newErrors.merchantId = '請輸入商店代號';
    } else if (creds.merchantId.length < 7) {
      newErrors.merchantId = '商店代號格式不正確';
    }

    if (!creds.hashKey) {
      newErrors.hashKey = '請輸入 HashKey';
    }

    if (!creds.hashIV) {
      newErrors.hashIV = '請輸入 HashIV';
    }

    if (creds.returnUrl && !creds.returnUrl.startsWith('https://')) {
      newErrors.returnUrl = '回傳網址必須使用 HTTPS';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStripeCredentials = (creds: StripeCredentials): boolean => {
    const newErrors: Record<string, string> = {};

    if (!creds.publishableKey) {
      newErrors.publishableKey = '請輸入 Publishable Key';
    } else if (!creds.publishableKey.startsWith('pk_')) {
      newErrors.publishableKey = 'Publishable Key 格式不正確';
    }

    if (!creds.secretKey) {
      newErrors.secretKey = '請輸入 Secret Key';
    } else if (!creds.secretKey.startsWith('sk_')) {
      newErrors.secretKey = 'Secret Key 格式不正確';
    }

    if (creds.webhookSecret && !creds.webhookSecret.startsWith('whsec_')) {
      newErrors.webhookSecret = 'Webhook Secret 格式不正確';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    let isValid = false;
    
    if (providerId === 'ecpay') {
      isValid = validateECPayCredentials(credentials as ECPayCredentials);
    } else if (providerId === 'stripe') {
      isValid = validateStripeCredentials(credentials as StripeCredentials);
    }

    if (!isValid) {
      Alert.alert('驗證失敗', '請修正錯誤後再試');
      return;
    }

    try {
      setIsSaving(true);

      const providerData: PaymentProviderDto = {
        providerId,
        providerName: providerId === 'ecpay' ? 'ECPay 綠界科技' : 'Stripe',
        credentials,
        isActive,
        isDefault,
      };

      let savedProvider: PaymentProvider;
      
      if (provider) {
        const updateData: UpdatePaymentProviderDto = {
          credentials,
          isActive,
          isDefault,
        };
        savedProvider = await paymentService.updatePaymentProvider(provider.id, updateData);
      } else {
        savedProvider = await paymentService.createPaymentProvider(providerData);
      }

      Alert.alert('成功', '付款設定已儲存');
      onSave(savedProvider);
    } catch (error: any) {
      Alert.alert('儲存失敗', error.message || '無法儲存付款設定');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestCredentials = async () => {
    try {
      const result = await paymentService.testCredentials(providerId, credentials);
      setTestResult({
        success: result.success,
        message: result.success ? '憑證驗證成功' : result.message || '憑證驗證失敗'
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || '測試失敗'
      });
    }
  };

  const renderECPayForm = () => (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.formControl}>
          <Text style={styles.label}>商店代號 (MerchantID)</Text>
          <Input
            value={(credentials as ECPayCredentials).merchantId}
            onChangeText={(text) => setCredentials({ ...credentials, merchantId: text })}
            placeholder="例如：2000132"
            maxLength={10}
          />
          {errors.merchantId ? <Text style={styles.errorText}>{errors.merchantId}</Text> : null}
          <Text style={styles.helperText}>ECPay 提供的商店代號，通常為 7 位數字</Text>
        </View>

        <View style={styles.formControl}>
          <Text style={styles.label}>HashKey</Text>
          <Input
            value={(credentials as ECPayCredentials).hashKey}
            onChangeText={(text) => setCredentials({ ...credentials, hashKey: text })}
            placeholder="請輸入 HashKey"
            secureTextEntry
          />
          {errors.hashKey ? <Text style={styles.errorText}>{errors.hashKey}</Text> : null}
          <Text style={styles.helperText}>用於加密驗證的金鑰</Text>
        </View>

        <View style={styles.formControl}>
          <Text style={styles.label}>HashIV</Text>
          <Input
            value={(credentials as ECPayCredentials).hashIV}
            onChangeText={(text) => setCredentials({ ...credentials, hashIV: text })}
            placeholder="請輸入 HashIV"
            secureTextEntry
          />
          {errors.hashIV ? <Text style={styles.errorText}>{errors.hashIV}</Text> : null}
          <Text style={styles.helperText}>用於加密驗證的向量值</Text>
        </View>

        <View style={styles.formControl}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>測試模式</Text>
              <Text style={styles.helperText}>
                {(credentials as ECPayCredentials).useSandbox 
                  ? '使用 ECPay 測試環境，不會實際收款'
                  : '使用 ECPay 正式環境，實際收款'}
              </Text>
            </View>
            <Switch
              value={(credentials as ECPayCredentials).useSandbox}
              onValueChange={(value) => setCredentials({ ...credentials, useSandbox: value })}
            />
          </View>
        </View>

        <View style={styles.formControl}>
          <Text style={styles.label}>自訂回傳網址 (選填)</Text>
          <Input
            value={(credentials as ECPayCredentials).returnUrl}
            onChangeText={(text) => setCredentials({ ...credentials, returnUrl: text })}
            placeholder="https://your-domain.com/payment/callback"
          />
          {errors.returnUrl ? <Text style={styles.errorText}>{errors.returnUrl}</Text> : null}
          <Text style={styles.helperText}>自訂付款完成後的回傳網址，留空使用系統預設</Text>
        </View>
      </View>

      <View style={styles.testCredentialsBox}>
        <View style={styles.testCredentialsContent}>
          <View style={styles.testCredentialsHeader}>
            <Icon name="info" type="material" color="#3182ce" size={20} />
            <Text style={styles.testCredentialsTitle}>憑證測試</Text>
          </View>
          <Text style={styles.testCredentialsDescription}>
            在儲存前，建議先測試憑證格式是否正確
          </Text>
          <Button
            title="測試憑證"
            type="outline"
            onPress={handleTestCredentials}
          />
          
          {testResult && (
            <View style={[styles.alert, testResult.success ? styles.alertSuccess : styles.alertError]}>
              <Icon 
                name={testResult.success ? 'check-circle' : 'error'} 
                type="material" 
                color={testResult.success ? '#48bb78' : '#f56565'} 
                size={16} 
              />
              <Text style={styles.alertText}>{testResult.message}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderStripeForm = () => (
    <View style={styles.container}>
      <View style={styles.section}>
        <View style={styles.formControl}>
          <Text style={styles.label}>Publishable Key</Text>
          <Input
            value={(credentials as StripeCredentials).publishableKey}
            onChangeText={(text) => setCredentials({ ...credentials, publishableKey: text })}
            placeholder="pk_test_..."
          />
          {errors.publishableKey ? <Text style={styles.errorText}>{errors.publishableKey}</Text> : null}
          <Text style={styles.helperText}>用於前端的公開金鑰</Text>
        </View>

        <View style={styles.formControl}>
          <Text style={styles.label}>Secret Key</Text>
          <Input
            value={(credentials as StripeCredentials).secretKey}
            onChangeText={(text) => setCredentials({ ...credentials, secretKey: text })}
            placeholder="sk_test_..."
            secureTextEntry
          />
          {errors.secretKey ? <Text style={styles.errorText}>{errors.secretKey}</Text> : null}
          <Text style={styles.helperText}>用於後端的私密金鑰</Text>
        </View>

        <View style={styles.formControl}>
          <Text style={styles.label}>Webhook Secret (選填)</Text>
          <Input
            value={(credentials as StripeCredentials).webhookSecret}
            onChangeText={(text) => setCredentials({ ...credentials, webhookSecret: text })}
            placeholder="whsec_..."
            secureTextEntry
          />
          {errors.webhookSecret ? <Text style={styles.errorText}>{errors.webhookSecret}</Text> : null}
          <Text style={styles.helperText}>用於驗證 Webhook 請求</Text>
        </View>

        <View style={styles.formControl}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>測試模式</Text>
              <Text style={styles.helperText}>
                {(credentials as StripeCredentials).useSandbox 
                  ? '使用 Stripe 測試環境'
                  : '使用 Stripe 正式環境'}
              </Text>
            </View>
            <Switch
              value={(credentials as StripeCredentials).useSandbox}
              onValueChange={(value) => setCredentials({ ...credentials, useSandbox: value })}
            />
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Card containerStyle={styles.card}>
      <ScrollView>
        <Text h4 style={styles.title}>
          {provider ? '編輯' : '新增'} {providerId === 'ecpay' ? 'ECPay' : 'Stripe'} 付款設定
        </Text>
        <Divider style={styles.divider} />

        {providerId === 'ecpay' ? renderECPayForm() : renderStripeForm()}

        <View style={styles.settingsSection}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>啟用此付款方式</Text>
              <Text style={styles.helperText}>啟用後，活動可以使用此付款方式收款</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Text style={styles.label}>設為預設付款方式</Text>
              <Text style={styles.helperText}>新活動將預設使用此付款方式</Text>
            </View>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.buttonRow}>
          <Button
            title="取消"
            type="outline"
            onPress={onCancel}
            disabled={isSaving || isLoading}
            containerStyle={styles.button}
          />
          <Button
            title={provider ? '更新' : '新增'}
            onPress={handleSave}
            loading={isSaving || isLoading}
            disabled={isSaving || isLoading}
            containerStyle={styles.button}
          />
        </View>
      </ScrollView>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 0,
    padding: 0,
    borderRadius: 8,
  },
  title: {
    padding: 16,
    paddingBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  formControl: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#2D3748',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: '#718096',
    fontSize: 14,
    marginTop: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    flex: 1,
    marginRight: 16,
  },
  testCredentialsBox: {
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3182CE',
  },
  testCredentialsContent: {
    flex: 1,
  },
  testCredentialsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCredentialsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C5282',
    marginLeft: 8,
  },
  testCredentialsDescription: {
    fontSize: 14,
    color: '#2A4E7C',
    marginBottom: 12,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  alertSuccess: {
    backgroundColor: '#C6F6D5',
  },
  alertError: {
    backgroundColor: '#FED7D7',
  },
  alertText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  settingsSection: {
    padding: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
  },
  button: {
    minWidth: 100,
  },
});

export default PaymentProviderCredentialsForm;