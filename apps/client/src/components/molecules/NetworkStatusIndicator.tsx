import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { useNetworkStatus } from '@/utils/networkStatus';

export interface NetworkStatusIndicatorProps {
  showWhenConnected?: boolean;
  autoHideDelay?: number;
  position?: 'top' | 'bottom';
  testID?: string;
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  showWhenConnected = false,
  autoHideDelay = 3000,
  position = 'top',
  testID = 'network-status-indicator',
}) => {
  const { t } = useTranslation();
  const { colors, spacing, typography } = useAppTheme();
  const networkStatus = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;

  useEffect(() => {
    const isOffline = !networkStatus.isConnected;
    const isBackOnline = wasOffline && networkStatus.isConnected;

    if (isOffline) {
      setWasOffline(true);
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isBackOnline || (showWhenConnected && networkStatus.isConnected)) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (networkStatus.isConnected && autoHideDelay > 0) {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: position === 'top' ? -100 : 100,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setVisible(false);
            setWasOffline(false);
          });
        }, autoHideDelay);
      }
    }
  }, [networkStatus.isConnected, wasOffline, showWhenConnected, autoHideDelay, fadeAnim, translateY, position]);

  if (!visible && !wasOffline && (!showWhenConnected || networkStatus.isConnected)) {
    return null;
  }

  const isOffline = !networkStatus.isConnected;
  const backgroundColor = isOffline ? colors.danger : colors.success;
  const message = isOffline ? t('errors.offline') : t('errors.connectionRestored');
  const iconName = isOffline ? 'wifi-off' : 'wifi';

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          backgroundColor,
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
      testID={testID}
    >
      <View style={[styles.content, { paddingHorizontal: spacing.md, paddingVertical: spacing.sm }]}>
        <Icon
          name={iconName}
          type="material-community"
          size={20}
          color={colors.white}
          style={{ marginRight: spacing.sm }}
          testID={`${testID}-icon`}
        />
        <Text style={[typography.body, { color: colors.white }]} testID={`${testID}-message`}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 999,
  },
  topPosition: {
    top: 0,
  },
  bottomPosition: {
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});