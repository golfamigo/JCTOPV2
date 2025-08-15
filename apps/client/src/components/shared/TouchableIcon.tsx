import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View, StyleProp, ViewStyle } from 'react-native';
import { Icon, IconProps } from '@rneui/themed';
import { getTouchTargetSize, ensureTouchTarget } from '../../utils/responsive';
import { useAppTheme } from '@/theme';

interface TouchableIconProps extends Omit<TouchableOpacityProps, 'style'> {
  name: string;
  type?: IconProps['type'];
  size?: number;
  color?: string;
  backgroundColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ViewStyle>;
}

export const TouchableIcon: React.FC<TouchableIconProps> = ({
  name,
  type = 'material',
  size = 24,
  color,
  backgroundColor,
  containerStyle,
  iconStyle,
  disabled,
  onPress,
  ...touchableProps
}) => {
  const { colors } = useAppTheme();
  const touchTargetSize = ensureTouchTarget(size);

  return (
    <TouchableOpacity
      {...touchableProps}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          minHeight: touchTargetSize.minHeight,
          minWidth: touchTargetSize.minWidth,
          padding: touchTargetSize.padding,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: backgroundColor || 'transparent',
          borderRadius: touchTargetSize.minHeight / 2,
          opacity: disabled ? 0.5 : 1,
        },
        containerStyle,
      ]}
      activeOpacity={0.7}
    >
      <Icon
        name={name}
        type={type}
        size={size}
        color={color || colors.primary}
        style={iconStyle as any}
      />
    </TouchableOpacity>
  );
};

export default TouchableIcon;