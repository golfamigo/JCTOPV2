import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Text, Button, Card, Divider } from '@rneui/themed';
import performanceService from '../../services/performanceService';
import { useAppTheme } from '@/theme';

interface BaselineMetrics {
  bundleSize?: {
    total: string;
    js: string;
    assets: string;
    native: string;
  };
  launchTime?: {
    cold: string;
    warm: string;
    interactive: string;
    splash: string;
  };
  memory?: {
    initial: string;
    current: string;
    peak: string;
    average: string;
  };
  frameRates?: {
    scrolling: string;
    navigation: string;
    animations: string;
  };
  device?: {
    platform: string;
    version: string;
    model: string;
    memory: string;
  };
}

export const PerformanceBaselineCapture: React.FC = () => {
  const { colors, spacing } = useAppTheme();
  const [isCapturing, setIsCapturing] = useState(false);
  const [metrics, setMetrics] = useState<BaselineMetrics>({});
  const [report, setReport] = useState<string>('');

  const formatBytes = (bytes: number): string => {
    if (bytes < 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatMilliseconds = (ms: number): string => {
    if (ms < 0) return 'N/A';
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  const captureBaseline = async () => {
    setIsCapturing(true);
    
    try {
      // Initialize performance service
      await performanceService.initialize();
      
      // Capture baseline
      const baseline = await performanceService.captureBaseline();
      
      // Format metrics for display
      const formattedMetrics: BaselineMetrics = {
        bundleSize: baseline.bundleSize ? {
          total: formatBytes(baseline.bundleSize.totalSize || 0),
          js: formatBytes(baseline.bundleSize.jsBundle || 0),
          assets: formatBytes(baseline.bundleSize.assets || 0),
          native: formatBytes(baseline.bundleSize.nativeModules || 0),
        } : undefined,
        launchTime: baseline.launchTime ? {
          cold: formatMilliseconds(baseline.launchTime.coldStart || 0),
          warm: formatMilliseconds(baseline.launchTime.warmStart || 0),
          interactive: formatMilliseconds(baseline.launchTime.timeToInteractive || 0),
          splash: formatMilliseconds(baseline.launchTime.splashScreenDuration || 0),
        } : undefined,
        memory: baseline.memoryUsage ? {
          initial: formatBytes(baseline.memoryUsage.initial || 0),
          current: formatBytes(baseline.memoryUsage.afterLoad || 0),
          peak: formatBytes(baseline.memoryUsage.peak || 0),
          average: formatBytes(baseline.memoryUsage.average || 0),
        } : undefined,
        frameRates: baseline.frameRates ? {
          scrolling: `${baseline.frameRates.scrolling.average.toFixed(1)} fps`,
          navigation: `${baseline.frameRates.navigation.average.toFixed(1)} fps`,
          animations: `${baseline.frameRates.animations.average.toFixed(1)} fps`,
        } : undefined,
        device: baseline.deviceInfo ? {
          platform: baseline.deviceInfo.platform,
          version: baseline.deviceInfo.osVersion,
          model: baseline.deviceInfo.deviceModel,
          memory: baseline.deviceInfo.totalMemory ? 
            formatBytes(baseline.deviceInfo.totalMemory) : 'N/A',
        } : undefined,
      };
      
      setMetrics(formattedMetrics);
      
      // Generate report
      const reportText = performanceService.generateReport();
      setReport(reportText);
      
      Alert.alert(
        '✅ Success',
        'Performance baseline captured successfully!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to capture baseline:', error);
      Alert.alert(
        '❌ Error',
        'Failed to capture performance baseline. Check console for details.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const compareWithBaseline = async () => {
    try {
      const comparison = await performanceService.compareWithBaseline();
      
      if (!comparison) {
        Alert.alert(
          '⚠️ No Baseline',
          'No baseline found. Please capture a baseline first.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const formatChange = (value: number): string => {
        const sign = value > 0 ? '+' : '';
        const color = value > 0 ? '🔴' : '🟢';
        return `${color} ${sign}${value.toFixed(1)}%`;
      };
      
      const message = `
Bundle Size: ${formatChange(comparison.bundleSize.change)}
Launch Time: ${formatChange(comparison.launchTime.change)}
Memory Usage: ${formatChange(comparison.memory.change)}
Frame Rate: ${comparison.frameRate.change > 0 ? '🟢' : '🔴'} ${comparison.frameRate.change.toFixed(1)} fps
      `.trim();
      
      Alert.alert('📊 Performance Comparison', message, [{ text: 'OK' }]);
    } catch (error) {
      console.error('Failed to compare with baseline:', error);
      Alert.alert(
        '❌ Error',
        'Failed to compare with baseline. Check console for details.',
        [{ text: 'OK' }]
      );
    }
  };

  const measureFrameRate = (type: 'scrolling' | 'navigation' | 'animations') => {
    performanceService.startFrameRateMeasurement(type);
    
    Alert.alert(
      '🎬 Measuring Frame Rate',
      `Measuring ${type} frame rate for 5 seconds. Please ${
        type === 'scrolling' ? 'scroll the screen' :
        type === 'navigation' ? 'navigate between screens' :
        'trigger animations'
      }.`,
      [{ text: 'OK' }]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.md,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.black,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: 14,
      color: colors.grey3,
    },
    card: {
      marginBottom: spacing.md,
      borderRadius: 8,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.black,
      marginBottom: spacing.sm,
    },
    metricsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing.xs,
    },
    metricLabel: {
      fontSize: 14,
      color: colors.grey3,
    },
    metricValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.black,
    },
    buttonContainer: {
      marginTop: spacing.lg,
    },
    button: {
      marginBottom: spacing.md,
    },
    frameRateButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.sm,
    },
    frameRateButton: {
      flex: 1,
      marginHorizontal: spacing.xs,
    },
    reportContainer: {
      marginTop: spacing.lg,
      padding: spacing.md,
      backgroundColor: colors.grey5,
      borderRadius: 8,
    },
    reportText: {
      fontSize: 12,
      fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
      color: colors.black,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Performance Baseline</Text>
          <Text style={styles.subtitle}>
            Capture and monitor app performance metrics
          </Text>
        </View>

        {metrics.bundleSize && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>📦 Bundle Size</Text>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Total Size:</Text>
              <Text style={styles.metricValue}>{metrics.bundleSize.total}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>JS Bundle:</Text>
              <Text style={styles.metricValue}>{metrics.bundleSize.js}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Assets:</Text>
              <Text style={styles.metricValue}>{metrics.bundleSize.assets}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Native Modules:</Text>
              <Text style={styles.metricValue}>{metrics.bundleSize.native}</Text>
            </View>
          </Card>
        )}

        {metrics.launchTime && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>🚀 Launch Performance</Text>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Cold Start:</Text>
              <Text style={styles.metricValue}>{metrics.launchTime.cold}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Warm Start:</Text>
              <Text style={styles.metricValue}>{metrics.launchTime.warm}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Time to Interactive:</Text>
              <Text style={styles.metricValue}>{metrics.launchTime.interactive}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Splash Screen:</Text>
              <Text style={styles.metricValue}>{metrics.launchTime.splash}</Text>
            </View>
          </Card>
        )}

        {metrics.memory && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>💾 Memory Usage</Text>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Initial:</Text>
              <Text style={styles.metricValue}>{metrics.memory.initial}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Current:</Text>
              <Text style={styles.metricValue}>{metrics.memory.current}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Peak:</Text>
              <Text style={styles.metricValue}>{metrics.memory.peak}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Average:</Text>
              <Text style={styles.metricValue}>{metrics.memory.average}</Text>
            </View>
          </Card>
        )}

        {metrics.frameRates && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>🎬 Frame Rates</Text>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Scrolling:</Text>
              <Text style={styles.metricValue}>{metrics.frameRates.scrolling}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Navigation:</Text>
              <Text style={styles.metricValue}>{metrics.frameRates.navigation}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Animations:</Text>
              <Text style={styles.metricValue}>{metrics.frameRates.animations}</Text>
            </View>
          </Card>
        )}

        {metrics.device && (
          <Card containerStyle={styles.card}>
            <Text style={styles.cardTitle}>📱 Device Info</Text>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Platform:</Text>
              <Text style={styles.metricValue}>{metrics.device.platform}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>OS Version:</Text>
              <Text style={styles.metricValue}>{metrics.device.version}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Device Model:</Text>
              <Text style={styles.metricValue}>{metrics.device.model}</Text>
            </View>
            <View style={styles.metricsRow}>
              <Text style={styles.metricLabel}>Total Memory:</Text>
              <Text style={styles.metricValue}>{metrics.device.memory}</Text>
            </View>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Capture Baseline"
            onPress={captureBaseline}
            loading={isCapturing}
            disabled={isCapturing}
            buttonStyle={styles.button}
          />
          
          <Button
            title="Compare with Baseline"
            onPress={compareWithBaseline}
            buttonStyle={[styles.button, { backgroundColor: colors.secondary }]}
          />
          
          <Divider style={{ marginVertical: spacing.md }} />
          
          <Text style={[styles.cardTitle, { marginBottom: spacing.sm }]}>
            Measure Frame Rates
          </Text>
          <View style={styles.frameRateButtons}>
            <Button
              title="Scrolling"
              onPress={() => measureFrameRate('scrolling')}
              buttonStyle={styles.frameRateButton}
              size="sm"
            />
            <Button
              title="Navigation"
              onPress={() => measureFrameRate('navigation')}
              buttonStyle={styles.frameRateButton}
              size="sm"
            />
            <Button
              title="Animations"
              onPress={() => measureFrameRate('animations')}
              buttonStyle={styles.frameRateButton}
              size="sm"
            />
          </View>
        </View>

        {report && (
          <View style={styles.reportContainer}>
            <Text style={styles.reportText}>{report}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default PerformanceBaselineCapture;