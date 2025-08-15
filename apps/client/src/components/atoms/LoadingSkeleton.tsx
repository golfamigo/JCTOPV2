import React from 'react';
import { Skeleton } from '@rneui/themed';
import { useAppTheme } from '@/theme';

export interface LoadingSkeletonProps {
  /**
   * Width of the skeleton (number for pixels, string for percentage)
   */
  width?: number | string;
  /**
   * Height of the skeleton (number for pixels, string for percentage)
   */
  height?: number | string;
  /**
   * Animation style for the skeleton
   */
  animation?: 'pulse' | 'wave' | 'none';
  /**
   * Border radius for the skeleton
   */
  borderRadius?: number;
  /**
   * Margin bottom for spacing
   */
  marginBottom?: number;
  /**
   * Custom style overrides
   */
  style?: any;
  /**
   * Test ID for testing
   */
  testID?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  animation = 'pulse',
  borderRadius = 4,
  marginBottom = 8,
  style,
  testID,
}) => {
  const { spacing } = useAppTheme();

  return (
    <Skeleton
      animation={animation}
      width={typeof width === 'string' ? undefined : width}
      height={typeof height === 'string' ? undefined : height}
      testID={testID}
      style={[
        {
          borderRadius,
          marginBottom: marginBottom,
        },
        style,
      ]}
    />
  );
};

// Predefined skeleton variations
export const SkeletonCard: React.FC<{ marginBottom?: number }> = ({ marginBottom = 16 }) => {
  const { spacing } = useAppTheme();
  
  return (
    <>
      <LoadingSkeleton height={120} marginBottom={spacing.sm} borderRadius={8} />
      <LoadingSkeleton width="80%" height={18} marginBottom={spacing.xs} />
      <LoadingSkeleton width="60%" height={14} marginBottom={marginBottom} />
    </>
  );
};

export const SkeletonList: React.FC<{ items?: number; marginBottom?: number }> = ({ 
  items = 3,
  marginBottom = 8 
}) => {
  const { spacing } = useAppTheme();
  
  return (
    <>
      {Array.from({ length: items }).map((_, index) => (
        <LoadingSkeleton
          key={index}
          height={48}
          marginBottom={spacing.sm}
          borderRadius={8}
        />
      ))}
    </>
  );
};

export const SkeletonAvatar: React.FC<{ size?: number; marginBottom?: number }> = ({ 
  size = 40,
  marginBottom = 8 
}) => {
  return (
    <LoadingSkeleton
      width={size}
      height={size}
      borderRadius={size / 2}
      marginBottom={marginBottom}
    />
  );
};