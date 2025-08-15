import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useAppTheme } from '@/theme';
import { ERROR_MESSAGES } from '../../constants/errorMessages';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  showWhenOnline?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  variant?: 'banner' | 'toast' | 'minimal';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  showWhenOnline = false,
  autoHide = true,
  autoHideDelay = 3000,
  variant = 'banner',
}) => {
  const theme = useAppTheme();
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const [visible, setVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (showWhenOnline) {
      // Show online status briefly
      setVisible(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (autoHide) {
          setTimeout(() => {
            animateOut();
          }, autoHideDelay);
        }
      });
    } else {
      animateOut();
    }
  }, [isOffline, showWhenOnline]);

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  if (!visible) {
    return null;
  }

  const getBackgroundColor = () => {
    if (isOffline) {
      return theme.colors.error;
    }
    return theme.colors.success;
  };

  const getMessage = () => {
    if (!isConnected) {
      return ERROR_MESSAGES.network.offline;
    }
    if (isInternetReachable === false) {
      return ERROR_MESSAGES.network.noInternet;
    }
    return '已連線';
  };

  const getIcon = () => {
    return isOffline ? 'wifi-off' : 'wifi';
  };

  const renderContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <View style={styles.minimalContent}>
            <Icon
              name={getIcon()}
              type="feather"
              size={16}
              color="white"
              containerStyle={styles.minimalIcon}
            />
          </View>
        );
      case 'toast':
        return (
          <View style={styles.toastContent}>
            <Icon
              name={getIcon()}
              type="feather"
              size={20}
              color="white"
              containerStyle={styles.toastIcon}
            />
            <Text style={styles.toastText}>{getMessage()}</Text>
          </View>
        );
      default:
        return (
          <View style={styles.bannerContent}>
            <Icon
              name={getIcon()}
              type="feather"
              size={20}
              color="white"
              containerStyle={styles.bannerIcon}
            />
            <Text style={styles.bannerText}>{getMessage()}</Text>
          </View>
        );
    }
  };

  const containerStyle = [
    styles.container,
    position === 'top' ? styles.top : styles.bottom,
    variant === 'minimal' && styles.minimalContainer,
    variant === 'toast' && styles.toastContainer,
    { backgroundColor: getBackgroundColor() },
  ];

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {renderContent()}
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
  top: {
    top: 0,
    paddingTop: 44, // Account for status bar
  },
  bottom: {
    bottom: 0,
    paddingBottom: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerIcon: {
    marginRight: 8,
  },
  bannerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  toastContainer: {
    left: 20,
    right: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  toastIcon: {
    marginRight: 8,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  minimalContainer: {
    left: 'auto',
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  minimalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minimalIcon: {
    margin: 0,
  },
});

export default OfflineIndicator;