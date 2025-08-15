import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Header, Button } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from '../localization';
import { useAppTheme } from '../theme';

/**
 * Placeholder terms and conditions content sections.
 * In a production app, this would be replaced with actual legal content.
 */
const TERMS_SECTIONS = [
  {
    title: '1. 服務使用條款 (Terms of Service)',
    content: '使用本服務即表示您同意遵守這些條款和條件。',
  },
  {
    title: '2. 隱私政策 (Privacy Policy)', 
    content: '我們重視您的隱私，並承諾保護您的個人資料。',
  },
] as const;

const DISCLAIMER_TEXT = {
  zh: '這是一個範例的服務條款頁面。在實際應用中，這裡應該包含完整的法律條文。',
  en: 'This is a placeholder Terms and Conditions page. In a production application, this would contain the complete legal terms.',
} as const;

/**
 * Terms and Conditions Page
 * 
 * Simple placeholder page for terms and conditions.
 * This would be replaced with actual legal content in production.
 */
export default function TermsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();

  const styles = createStyles(colors, spacing, typography);

  const handleGoBack = () => router.back();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Header
        centerComponent={{
          text: t('auth.termsAndConditions'),
          style: { color: colors.white, fontSize: 18, fontWeight: '600' }
        }}
        leftComponent={{
          icon: 'arrow-back',
          color: colors.white,
          onPress: handleGoBack,
        }}
        backgroundColor={colors.primary}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text h2 style={styles.title}>
          {t('auth.termsAndConditions')}
        </Text>
        
        <Text style={styles.paragraph}>
          {DISCLAIMER_TEXT.zh}
        </Text>
        
        <Text style={styles.paragraph}>
          {DISCLAIMER_TEXT.en}
        </Text>
        
        {TERMS_SECTIONS.map((section, index) => (
          <React.Fragment key={index}>
            <Text style={styles.sectionTitle}>
              {section.title}
            </Text>
            <Text style={styles.paragraph}>
              {section.content}
            </Text>
          </React.Fragment>
        ))}
        
        <Button
          title={t('common.back')}
          onPress={handleGoBack}
          buttonStyle={styles.backButton}
          titleStyle={styles.backButtonText}
        />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any, spacing: any, typography: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl,
    },
    title: {
      ...typography.h2,
      color: colors.text,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    paragraph: {
      ...typography.body,
      color: colors.text,
      marginBottom: spacing.md,
      lineHeight: 24,
    },
    backButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: spacing.md,
      marginTop: spacing.xl,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.white,
    },
  });