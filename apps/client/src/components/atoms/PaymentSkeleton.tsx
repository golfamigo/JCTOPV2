import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@rneui/themed';
import { useAppTheme } from '@/theme';

interface PaymentSkeletonProps {
  variant?: 'form' | 'summary' | 'methods' | 'status';
}

// Constants for skeleton dimensions and counts
const SKELETON_CONSTANTS = {
  PAYMENT_METHODS_COUNT: 4,
  SUMMARY_ROWS_COUNT: 4,
  ICON_SIZE: 64,
  FORM_HEIGHT: 48,
  TITLE_HEIGHT: 24,
  LABEL_HEIGHT: 16,
  BADGE_HEIGHT: 32,
} as const;

const PaymentSkeleton: React.FC<PaymentSkeletonProps> = ({
  variant = 'form',
}) => {
  const { colors, spacing } = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.md,
    },
    row: {
      flexDirection: 'row',
      marginVertical: spacing.sm,
      alignItems: 'center',
    },
    section: {
      marginVertical: spacing.md,
    },
    methodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.lightGrey,
      borderRadius: 8,
    },
  });

  const renderFormSkeleton = () => (
    <View style={styles.container}>
      {/* Title skeleton */}
      <Skeleton animation="pulse" width={200} height={SKELETON_CONSTANTS.TITLE_HEIGHT} style={{ marginBottom: spacing.md }} />
      
      {/* Form fields skeleton */}
      <View style={styles.section}>
        <Skeleton animation="pulse" width={120} height={SKELETON_CONSTANTS.LABEL_HEIGHT} style={{ marginBottom: spacing.xs }} />
        <Skeleton animation="pulse" width={300} height={SKELETON_CONSTANTS.FORM_HEIGHT} style={{ marginBottom: spacing.md }} />
      </View>
      
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Skeleton animation="pulse" width={180} height={SKELETON_CONSTANTS.LABEL_HEIGHT} style={{ marginBottom: spacing.xs }} />
          <Skeleton animation="pulse" width={150} height={SKELETON_CONSTANTS.FORM_HEIGHT} />
        </View>
        <View style={{ flex: 0.4 }}>
          <Skeleton animation="pulse" width={200} height={SKELETON_CONSTANTS.LABEL_HEIGHT} style={{ marginBottom: spacing.xs }} />
          <Skeleton animation="pulse" width={150} height={SKELETON_CONSTANTS.FORM_HEIGHT} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Skeleton animation="pulse" width={150} height={SKELETON_CONSTANTS.LABEL_HEIGHT} style={{ marginBottom: spacing.xs }} />
        <Skeleton animation="pulse" width={280} height={SKELETON_CONSTANTS.FORM_HEIGHT} />
      </View>
    </View>
  );

  const renderSummarySkeleton = () => (
    <View style={styles.container}>
      <Skeleton animation="pulse" width={150} height={20} style={{ marginBottom: spacing.md }} />
      
      {/* Summary rows */}
      {Array.from({ length: SKELETON_CONSTANTS.SUMMARY_ROWS_COUNT }, (_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton animation="pulse" width={100} height={SKELETON_CONSTANTS.LABEL_HEIGHT} />
          <View style={{ flex: 1 }} />
          <Skeleton animation="pulse" width={80} height={SKELETON_CONSTANTS.LABEL_HEIGHT} />
        </View>
      ))}
      
      <View style={{ height: 1, backgroundColor: colors.midGrey, marginVertical: spacing.md }} />
      
      {/* Total row */}
      <View style={styles.row}>
        <Skeleton animation="pulse" width={100} height={20} />
        <View style={{ flex: 1 }} />
        <Skeleton animation="pulse" width={100} height={20} />
      </View>
    </View>
  );

  const renderMethodsSkeleton = () => (
    <View style={styles.container}>
      <Skeleton animation="pulse" width={180} height={20} style={{ marginBottom: spacing.md }} />
      
      {Array.from({ length: SKELETON_CONSTANTS.PAYMENT_METHODS_COUNT }, (_, i) => (
        <View key={i} style={styles.methodItem}>
          <Skeleton animation="pulse" width={SKELETON_CONSTANTS.TITLE_HEIGHT} height={SKELETON_CONSTANTS.TITLE_HEIGHT} style={{ marginRight: spacing.sm }} />
          <Skeleton animation="pulse" width={20} height={20} style={{ marginRight: spacing.md }} />
          <Skeleton animation="pulse" width={120} height={SKELETON_CONSTANTS.LABEL_HEIGHT} style={{ flex: 1 }} />
          <Skeleton animation="pulse" width={40} height={20} />
        </View>
      ))}
    </View>
  );

  const renderStatusSkeleton = () => (
    <View style={[styles.container, { alignItems: 'center' }]}>
      <Skeleton animation="pulse" width={SKELETON_CONSTANTS.ICON_SIZE} height={SKELETON_CONSTANTS.ICON_SIZE} style={{ borderRadius: SKELETON_CONSTANTS.ICON_SIZE / 2, marginBottom: spacing.lg }} />
      <Skeleton animation="pulse" width={210} height={SKELETON_CONSTANTS.TITLE_HEIGHT} style={{ marginBottom: spacing.sm }} />
      <Skeleton animation="pulse" width={270} height={SKELETON_CONSTANTS.LABEL_HEIGHT} style={{ marginBottom: spacing.md }} />
      <Skeleton animation="pulse" width={150} height={SKELETON_CONSTANTS.BADGE_HEIGHT} style={{ borderRadius: SKELETON_CONSTANTS.BADGE_HEIGHT / 2 }} />
    </View>
  );

  switch (variant) {
    case 'summary':
      return renderSummarySkeleton();
    case 'methods':
      return renderMethodsSkeleton();
    case 'status':
      return renderStatusSkeleton();
    default:
      return renderFormSkeleton();
  }
};

export default PaymentSkeleton;