import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, Easing } from 'react-native';
import { useAppTheme } from '@/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'text' | 'circle' | 'rect' | 'card';
  lines?: number; // For text variant
  spacing?: number;
  duration?: number;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  style,
  variant = 'rect',
  lines = 1,
  spacing = 8,
  duration = 1000,
  children,
}) => {
  const { colors } = useAppTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: duration,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    
    return () => {
      animation.stop();
    };
  }, [animatedValue, duration]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'circle':
        const size = typeof width === 'number' ? width : 50;
        return {
          width: size,
          height: size,
          borderRadius: size / 2,
        };
      case 'text':
        return {
          width: width as any,
          height: 16,
          borderRadius: 4,
        };
      case 'card':
        return {
          width: width as any,
          height: (height || 200) as any,
          borderRadius: 8,
        };
      default:
        return {
          width: width as any,
          height: height as any,
          borderRadius: borderRadius || 4,
        };
    }
  };

  const baseStyle: ViewStyle = {
    backgroundColor: colors.grey5,
    overflow: 'hidden',
    ...getVariantStyles(),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <View style={style}>
        {Array.from({ length: lines }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              baseStyle,
              {
                opacity,
                marginBottom: index < lines - 1 ? spacing : 0,
                width: index === lines - 1 ? '70%' : '100%', // Last line shorter
              },
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <Animated.View style={[baseStyle, style, { opacity }]}>
      {children}
    </Animated.View>
  );
};

// Skeleton container for complex layouts
interface SkeletonContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  fade?: boolean;
  fadeDuration?: number;
}

export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  isLoading,
  children,
  skeleton,
  fade = true,
  fadeDuration = 300,
}) => {
  const fadeAnim = useRef(new Animated.Value(isLoading ? 0 : 1)).current;

  useEffect(() => {
    if (!fade) return;

    Animated.timing(fadeAnim, {
      toValue: isLoading ? 0 : 1,
      duration: fadeDuration,
      useNativeDriver: true,
    }).start();
  }, [isLoading, fade, fadeDuration, fadeAnim]);

  if (isLoading) {
    return <>{skeleton || <DefaultSkeleton />}</>;
  }

  if (fade) {
    return (
      <Animated.View style={{ opacity: fadeAnim }}>
        {children}
      </Animated.View>
    );
  }

  return <>{children}</>;
};

// Default skeleton layouts
const DefaultSkeleton: React.FC = () => {
  const { spacing } = useAppTheme();
  
  return (
    <View style={{ padding: spacing.md }}>
      <SkeletonLoader variant="text" lines={3} />
    </View>
  );
};

// Card skeleton preset
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  const { spacing } = useAppTheme();
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.cardContainer}>
          <SkeletonLoader variant="rect" height={150} />
          <View style={{ padding: spacing.md }}>
            <SkeletonLoader variant="text" lines={2} spacing={spacing.sm} />
          </View>
        </View>
      ))}
    </>
  );
};

// List item skeleton preset
export const ListItemSkeleton: React.FC<{ count?: number; avatar?: boolean }> = ({
  count = 1,
  avatar = false,
}) => {
  const { spacing } = useAppTheme();
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.listItemContainer, { padding: spacing.md }]}>
          {avatar && (
            <SkeletonLoader
              variant="circle"
              width={40}
              style={{ marginRight: spacing.md }}
            />
          )}
          <View style={{ flex: 1 }}>
            <SkeletonLoader variant="text" width="60%" />
            <SkeletonLoader
              variant="text"
              width="40%"
              style={{ marginTop: spacing.xs }}
            />
          </View>
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});

export default SkeletonLoader;