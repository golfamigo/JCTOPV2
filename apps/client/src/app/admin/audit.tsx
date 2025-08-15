import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

export default function AuditLog() {
  const { t } = useTranslation();
  const { spacing } = useAppTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.content, { padding: spacing.md }]}>
        <Text h3>{t('admin.audit')}</Text>
        <Text>{t('common.comingSoon')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});