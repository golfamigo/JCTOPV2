import { ViewStyle } from 'react-native';
import { getTouchTargetSize } from './responsive';

const MIN_SPACING_BETWEEN_TARGETS = 8;

export const getTouchTargetSpacing = (position: 'all' | 'horizontal' | 'vertical' | 'top' | 'bottom' | 'left' | 'right'): ViewStyle => {
  switch (position) {
    case 'all':
      return {
        margin: MIN_SPACING_BETWEEN_TARGETS / 2,
      };
    case 'horizontal':
      return {
        marginHorizontal: MIN_SPACING_BETWEEN_TARGETS / 2,
      };
    case 'vertical':
      return {
        marginVertical: MIN_SPACING_BETWEEN_TARGETS / 2,
      };
    case 'top':
      return {
        marginTop: MIN_SPACING_BETWEEN_TARGETS,
      };
    case 'bottom':
      return {
        marginBottom: MIN_SPACING_BETWEEN_TARGETS,
      };
    case 'left':
      return {
        marginLeft: MIN_SPACING_BETWEEN_TARGETS,
      };
    case 'right':
      return {
        marginRight: MIN_SPACING_BETWEEN_TARGETS,
      };
    default:
      return {};
  }
};

export const getButtonGroupSpacing = (): ViewStyle => {
  return {
    gap: MIN_SPACING_BETWEEN_TARGETS,
  };
};

export const ensureAccessibleLayout = (elements: number, orientation: 'horizontal' | 'vertical' = 'horizontal'): ViewStyle => {
  const touchTargetSize = getTouchTargetSize();
  
  if (orientation === 'horizontal') {
    return {
      flexDirection: 'row',
      gap: MIN_SPACING_BETWEEN_TARGETS,
      minHeight: touchTargetSize,
      alignItems: 'center',
    };
  } else {
    return {
      flexDirection: 'column',
      gap: MIN_SPACING_BETWEEN_TARGETS,
      minWidth: touchTargetSize,
      justifyContent: 'center',
    };
  }
};

export const touchTargetSpacingUtils = {
  getTouchTargetSpacing,
  getButtonGroupSpacing,
  ensureAccessibleLayout,
  MIN_SPACING_BETWEEN_TARGETS,
};

export default touchTargetSpacingUtils;