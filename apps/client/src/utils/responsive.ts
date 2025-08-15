import { Dimensions, Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1200,
} as const;

export type Breakpoint = keyof typeof breakpoints;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const getDeviceType = (width: number = screenWidth): Breakpoint => {
  if (width >= breakpoints.desktop) return 'desktop';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'mobile';
};

export const isTablet = (width: number = screenWidth): boolean => {
  return width >= breakpoints.tablet;
};

export const isPhone = (width: number = screenWidth): boolean => {
  return width < breakpoints.tablet;
};

export const isDesktop = (width: number = screenWidth): boolean => {
  return width >= breakpoints.desktop;
};

export const isLandscape = (width: number = screenWidth, height: number = screenHeight): boolean => {
  return width > height;
};

export const isPortrait = (width: number = screenWidth, height: number = screenHeight): boolean => {
  return height >= width;
};

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const isIPad = (): boolean => {
  if (!isIOS) return false;
  return DeviceInfo.isTablet();
};

export const isIPhone = (): boolean => {
  if (!isIOS) return false;
  return !DeviceInfo.isTablet();
};

export const getResponsiveValue = <T>(
  values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
  },
  width: number = screenWidth
): T | undefined => {
  const deviceType = getDeviceType(width);
  
  if (deviceType === 'desktop' && values.desktop !== undefined) {
    return values.desktop;
  }
  if (deviceType === 'tablet' && values.tablet !== undefined) {
    return values.tablet;
  }
  if (deviceType === 'mobile' && values.mobile !== undefined) {
    return values.mobile;
  }
  
  return values.tablet ?? values.mobile;
};

export const responsiveSize = (
  baseSize: number,
  scaleFactor: { mobile: number; tablet: number; desktop: number } = { mobile: 1, tablet: 1.2, desktop: 1.5 },
  width: number = screenWidth
): number => {
  const deviceType = getDeviceType(width);
  return Math.round(baseSize * scaleFactor[deviceType]);
};

export const getTouchTargetSize = (): number => {
  return Platform.OS === 'ios' ? 44 : 48;
};

export const ensureTouchTarget = (size: number): { minHeight: number; minWidth: number; padding?: number } => {
  const minSize = getTouchTargetSize();
  if (size >= minSize) {
    return { minHeight: size, minWidth: size };
  }
  
  const padding = Math.max(0, (minSize - size) / 2);
  return {
    minHeight: minSize,
    minWidth: minSize,
    padding,
  };
};

const gridColumns = {
  mobile: 1,
  tablet: 2,
  desktop: 3,
} as const;

export const getGridColumns = (
  customColumns?: Partial<typeof gridColumns>,
  width: number = screenWidth
): number => {
  const deviceType = getDeviceType(width);
  const columns = { ...gridColumns, ...customColumns };
  return columns[deviceType];
};

export const responsiveHelpers = {
  breakpoints,
  getDeviceType,
  isTablet,
  isPhone,
  isDesktop,
  isLandscape,
  isPortrait,
  isIOS,
  isAndroid,
  isIPad,
  isIPhone,
  getResponsiveValue,
  responsiveSize,
  getTouchTargetSize,
  ensureTouchTarget,
  getGridColumns,
};

export default responsiveHelpers;