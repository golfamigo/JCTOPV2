import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearProgress, Text } from '@rneui/themed';
import { useTheme } from '@rneui/themed';

interface ExportProgressBarProps {
  progress: number; // 0-100
  indeterminate?: boolean;
  color?: string;
  trackColor?: string;
  height?: number;
  showPercentage?: boolean;
}

export const ExportProgressBar: React.FC<ExportProgressBarProps> = ({
  progress,
  indeterminate = false,
  color,
  trackColor,
  height = 8,
  showPercentage = true,
}) => {
  const { theme } = useTheme();

  const progressColor = color || theme.colors.primary;
  const trackColorValue = trackColor || theme.colors.grey5;

  return (
    <View style={styles.container}>
      <LinearProgress
        value={indeterminate ? undefined : progress / 100}
        variant={indeterminate ? 'indeterminate' : 'determinate'}
        color={progressColor}
        trackColor={trackColorValue}
        style={{ height }}
      />
      {showPercentage && !indeterminate && (
        <Text style={[styles.percentageText, { color: theme.colors.grey3 }]}>
          {Math.round(progress)}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  percentageText: {
    position: 'absolute',
    right: 0,
    top: -20,
    fontSize: 12,
    fontWeight: '500',
  },
});