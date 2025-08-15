import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import {
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
  Breakpoint,
} from '../utils/responsive';

interface ResponsiveHookReturn {
  width: number;
  height: number;
  deviceType: Breakpoint;
  isTablet: boolean;
  isPhone: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isIPad: boolean;
  isIPhone: boolean;
  getResponsiveValue: <T>(values: { mobile?: T; tablet?: T; desktop?: T }) => T | undefined;
  responsiveSize: (baseSize: number, scaleFactor?: { mobile: number; tablet: number; desktop: number }) => number;
}

export const useResponsive = (): ResponsiveHookReturn => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const { width, height } = dimensions;

  return {
    width,
    height,
    deviceType: getDeviceType(width),
    isTablet: isTablet(width),
    isPhone: isPhone(width),
    isDesktop: isDesktop(width),
    isLandscape: isLandscape(width, height),
    isPortrait: isPortrait(width, height),
    isIOS,
    isAndroid,
    isIPad: isIPad(),
    isIPhone: isIPhone(),
    getResponsiveValue: <T>(values: { mobile?: T; tablet?: T; desktop?: T }) => 
      getResponsiveValue(values, width),
    responsiveSize: (baseSize: number, scaleFactor?: { mobile: number; tablet: number; desktop: number }) =>
      responsiveSize(baseSize, scaleFactor, width),
  };
};

export default useResponsive;