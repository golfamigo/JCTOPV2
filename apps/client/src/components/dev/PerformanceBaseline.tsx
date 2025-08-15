import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Card, Text, Button, ListItem, Divider } from '@rneui/themed';
import performanceService, { PerformanceBaseline } from '../../services/performanceService';
import { useAppTheme } from '@/theme';

/**
 * Development component for capturing and viewing performance baselines
 * Only available in __DEV__ mode
 */
export const PerformanceBaselineComponent: React.FC = () => {
  const { colors, spacing } = useAppTheme();
  const [baseline, setBaseline] = useState<PerformanceBaseline | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!__DEV__) {
    return null; // Only show in development
  }

  const handleCaptureBaseline = async () => {
    setIsCapturing(true);
    try {
      Alert.alert(
        'Capture Baseline',
        'This will measure current performance metrics. Make sure the app is in a typical state.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsCapturing(false),
          },
          {
            text: 'Start',
            onPress: async () => {
              const capturedBaseline = await performanceService.captureBaseline();
              setBaseline(capturedBaseline);
              setIsCapturing(false);
              Alert.alert('Success', 'Performance baseline captured!');
            },
          },
        ]
      );
    } catch (error) {
      setIsCapturing(false);
      Alert.alert('Error', 'Failed to capture baseline');
    }
  };

  const handleLoadBaseline = async () => {
    setIsLoading(true);
    try {
      const loadedBaseline = await performanceService.loadBaseline();
      if (loadedBaseline) {
        setBaseline(loadedBaseline);
        Alert.alert('Success', 'Baseline loaded from storage');
      } else {
        Alert.alert('Info', 'No baseline found in storage');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load baseline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompare = async () => {
    try {
      const comparison = await performanceService.compareWithBaseline();
      if (comparison) {
        Alert.alert(
          'Performance Comparison',
          `Bundle Size: ${comparison.bundleSize.change.toFixed(1)}%\n` +
          `Launch Time: ${comparison.launchTime.change.toFixed(1)}%\n` +
          `Memory: ${comparison.memory.change.toFixed(1)}%\n` +
          `Frame Rate: ${comparison.frameRate.change.toFixed(1)}fps`
        );
      } else {
        Alert.alert('Info', 'No baseline to compare against');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to compare performance');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: spacing.md,
      backgroundColor: colors.primary,
    },
    headerText: {
      color: colors.white,
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      padding: spacing.md,
      backgroundColor: colors.white,
    },
    card: {
      margin: spacing.md,
      borderRadius: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    metric: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    metricLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    metricValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Performance Baseline Tool</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Capture"
          onPress={handleCaptureBaseline}
          loading={isCapturing}
          disabled={isCapturing || isLoading}
          buttonStyle={{ backgroundColor: colors.success }}
        />
        <Button
          title="Load"
          onPress={handleLoadBaseline}
          loading={isLoading}
          disabled={isCapturing || isLoading}
          buttonStyle={{ backgroundColor: colors.primary }}
        />
        <Button
          title="Compare"
          onPress={handleCompare}
          disabled={!baseline || isCapturing || isLoading}
          buttonStyle={{ backgroundColor: colors.warning }}
        />
      </View>

      {baseline && (
        <>
          <Card containerStyle={styles.card}>
            <Text style={styles.sectionTitle}>Bundle Size</Text>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Total Size</Text>
              <Text style={styles.metricValue}>
                {formatBytes(baseline.bundleSize?.totalSize || 0)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>JS Bundle</Text>
              <Text style={styles.metricValue}>
                {formatBytes(baseline.bundleSize?.jsBundle || 0)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Assets</Text>
              <Text style={styles.metricValue}>
                {formatBytes(baseline.bundleSize?.assets || 0)}
              </Text>
            </View>
          </Card>

          <Card containerStyle={styles.card}>
            <Text style={styles.sectionTitle}>Launch Performance</Text>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Cold Start</Text>
              <Text style={styles.metricValue}>
                {baseline.launchTime?.coldStart.toFixed(0)}ms
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Warm Start</Text>
              <Text style={styles.metricValue}>
                {baseline.launchTime?.warmStart.toFixed(0)}ms
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Time to Interactive</Text>
              <Text style={styles.metricValue}>
                {baseline.launchTime?.timeToInteractive.toFixed(0)}ms
              </Text>
            </View>
          </Card>

          <Card containerStyle={styles.card}>
            <Text style={styles.sectionTitle}>Memory Usage</Text>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Initial</Text>
              <Text style={styles.metricValue}>
                {formatBytes(baseline.memoryUsage?.initial || 0)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Peak</Text>
              <Text style={styles.metricValue}>
                {formatBytes(baseline.memoryUsage?.peak || 0)}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Average</Text>
              <Text style={styles.metricValue}>
                {formatBytes(baseline.memoryUsage?.average || 0)}
              </Text>
            </View>
          </Card>

          <Card containerStyle={styles.card}>
            <Text style={styles.sectionTitle}>Frame Rates</Text>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Scrolling Average</Text>
              <Text style={styles.metricValue}>
                {baseline.frameRates?.scrolling.average.toFixed(1)}fps
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Dropped Frames</Text>
              <Text style={styles.metricValue}>
                {baseline.frameRates?.scrolling.droppedFrames || 0}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Animation Smoothness</Text>
              <Text style={styles.metricValue}>
                {((baseline.frameRates?.animations.smoothness || 0) * 100).toFixed(0)}%
              </Text>
            </View>
          </Card>

          <Card containerStyle={styles.card}>
            <Text style={styles.sectionTitle}>Device Info</Text>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Platform</Text>
              <Text style={styles.metricValue}>
                {baseline.deviceInfo.platform} {baseline.deviceInfo.osVersion}
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Timestamp</Text>
              <Text style={styles.metricValue}>
                {new Date(baseline.timestamp).toLocaleString()}
              </Text>
            </View>
          </Card>
        </>
      )}

      {isCapturing && (
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>
            Capturing performance metrics...
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default PerformanceBaselineComponent;