import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';

export default function EventsScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { paddingHorizontal: spacing.md }]}>
        <Text h1 style={[styles.title, { color: colors.dark, marginVertical: spacing.lg }]}>
          {t('organizer.myEvents')}
        </Text>
        <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
          {t('common.comingSoon', { defaultValue: 'Coming Soon' })}
        </Text>
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
  title: {
    textAlign: 'center',
  },
  placeholder: {
    textAlign: 'center',
    fontSize: 16,
  },
});