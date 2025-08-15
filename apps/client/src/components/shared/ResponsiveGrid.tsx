import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive } from '../../hooks/useResponsive';
import { useSpacing } from '../../hooks/useSpacing';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
  style?: ViewStyle;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap,
  style,
}) => {
  const responsive = useResponsive();
  const spacing = useSpacing();
  
  const columnCount = responsive.getResponsiveValue(columns) || 1;
  const gridGap = gap ?? spacing.md;
  
  const childrenArray = React.Children.toArray(children);
  
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.grid, { gap: gridGap }]}>
        {childrenArray.map((child, index) => (
          <View
            key={index}
            style={[
              styles.gridItem,
              {
                width: `${100 / columnCount}%`,
                paddingHorizontal: gridGap / 2,
                paddingBottom: gridGap,
              },
            ]}
          >
            {child}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    flexShrink: 0,
  },
});

export default ResponsiveGrid;