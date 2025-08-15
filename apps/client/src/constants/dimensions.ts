import { Platform } from 'react-native';

export const dimensions = {
  touchTarget: {
    minimum: Platform.OS === 'ios' ? 44 : 48,
    recommended: Platform.OS === 'ios' ? 48 : 56,
  },
  spacing: {
    betweenTouchTargets: 8,
  },
  modal: {
    mobile: {
      width: '90%',
      maxWidth: 380,
    },
    tablet: {
      width: '70%',
      maxWidth: 600,
    },
    desktop: {
      width: '50%',
      maxWidth: 800,
    },
  },
  form: {
    maxWidth: {
      mobile: '100%',
      tablet: 600,
      desktop: 800,
    },
  },
  list: {
    itemHeight: {
      mobile: 80,
      tablet: 100,
      desktop: 120,
    },
  },
  navigation: {
    tabBarHeight: {
      mobile: 56,
      tablet: 64,
    },
    headerHeight: {
      mobile: 56,
      tablet: 64,
    },
  },
  grid: {
    gap: {
      mobile: 8,
      tablet: 16,
      desktop: 24,
    },
  },
} as const;

export default dimensions;