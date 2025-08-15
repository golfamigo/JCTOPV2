import React from 'react';
import { Overlay, OverlayProps, Text, Divider } from '@rneui/themed';
import { View, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { useAppTheme } from '@/theme';
import { useResponsive } from '../../hooks/useResponsive';
import { SharedButton } from './SharedButton';
import { MaterialIcons } from '@expo/vector-icons';

interface SharedModalProps extends Omit<OverlayProps, 'children'> {
  title?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  footer?: React.ReactNode;
  scrollable?: boolean;
  children?: React.ReactNode;
}

export const SharedModal: React.FC<SharedModalProps> = ({
  title,
  showCloseButton = true,
  onClose,
  size = 'medium',
  footer,
  scrollable = false,
  isVisible,
  overlayStyle,
  children,
  ...props
}) => {
  const { colors, typography } = useAppTheme();
  const responsive = useResponsive();

  const getSizeStyles = (): any => {
    const baseStyles = {
      small: {
        mobile: { width: '90%', maxWidth: 320, maxHeight: '70%' },
        tablet: { width: '60%', maxWidth: 400, maxHeight: '60%' },
        desktop: { width: '40%', maxWidth: 480, maxHeight: '60%' },
      },
      medium: {
        mobile: { width: '95%', maxWidth: 480, maxHeight: '85%' },
        tablet: { width: '70%', maxWidth: 600, maxHeight: '80%' },
        desktop: { width: '50%', maxWidth: 720, maxHeight: '80%' },
      },
      large: {
        mobile: { width: '100%', maxHeight: '95%' },
        tablet: { width: '85%', maxWidth: 800, maxHeight: '90%' },
        desktop: { width: '70%', maxWidth: 1000, maxHeight: '90%' },
      },
      fullscreen: {
        mobile: { width: '100%', height: '100%', margin: 0, borderRadius: 0 },
        tablet: { width: '100%', height: '100%', margin: 0, borderRadius: 0 },
        desktop: { width: '100%', height: '100%', margin: 0, borderRadius: 0 },
      }
    };

    const deviceType = responsive.isDesktop ? 'desktop' : responsive.isTablet ? 'tablet' : 'mobile';
    return baseStyles[size][deviceType];
  };

  const sizeStyles = getSizeStyles();
  const ContentWrapper = scrollable ? ScrollView : View;

  return (
    <Overlay
      {...props}
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={[
        {
          backgroundColor: colors.white,
          borderRadius: size === 'fullscreen' ? 0 : 16,
          padding: 0,
          overflow: 'hidden'
        },
        sizeStyles,
        overlayStyle
      ]}
    >
      <View style={{ flex: 1 }}>
        {(title || showCloseButton) && (
          <>
            <View 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16
              }}
            >
              {title && (
                <Text style={[typography.h3, { flex: 1, marginRight: 8 }]}>
                  {title}
                </Text>
              )}
              {showCloseButton && onClose && (
                <MaterialIcons
                  name="close"
                  size={24}
                  color={colors.midGrey}
                  onPress={onClose}
                  style={{ padding: 4 }}
                />
              )}
            </View>
            <Divider color={colors.border} />
          </>
        )}
        
        <ContentWrapper 
          style={{ flex: 1 }}
          contentContainerStyle={scrollable ? { padding: 20 } : undefined}
        >
          {!scrollable ? (
            <View style={{ flex: 1, padding: 20 }}>
              {children}
            </View>
          ) : (
            children
          )}
        </ContentWrapper>

        {footer && (
          <>
            <Divider color={colors.border} />
            <View 
              style={{
                padding: 20,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                gap: 12
              }}
            >
              {footer}
            </View>
          </>
        )}
      </View>
    </Overlay>
  );
};