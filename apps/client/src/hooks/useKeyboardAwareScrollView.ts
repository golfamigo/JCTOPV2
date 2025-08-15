import { useEffect, useRef } from 'react';
import { Keyboard, ScrollView, Platform, KeyboardEvent } from 'react-native';
import { useResponsive } from './useResponsive';

interface UseKeyboardAwareScrollViewOptions {
  extraScrollHeight?: number;
  enableOnAndroid?: boolean;
  enableResetScrollToCoords?: boolean;
  keyboardOpeningTime?: number;
}

export const useKeyboardAwareScrollView = (
  options: UseKeyboardAwareScrollViewOptions = {}
) => {
  const {
    extraScrollHeight = 100,
    enableOnAndroid = true,
    enableResetScrollToCoords = true,
    keyboardOpeningTime = 250,
  } = options;

  const scrollViewRef = useRef<ScrollView>(null);
  const responsive = useResponsive();

  useEffect(() => {
    if (Platform.OS === 'ios' || enableOnAndroid) {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        handleKeyboardDidShow
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        handleKeyboardDidHide
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, [responsive.isLandscape]);

  const handleKeyboardDidShow = (event: KeyboardEvent) => {
    if (scrollViewRef.current && responsive.isLandscape) {
      // In landscape mode, we need extra scroll space to ensure input fields are visible
      const keyboardHeight = event.endCoordinates.height;
      const additionalScroll = responsive.isLandscape ? extraScrollHeight * 1.5 : extraScrollHeight;
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: keyboardHeight + additionalScroll,
          animated: true,
        });
      }, keyboardOpeningTime);
    }
  };

  const handleKeyboardDidHide = () => {
    if (scrollViewRef.current && enableResetScrollToCoords) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: 0,
          animated: true,
        });
      }, keyboardOpeningTime);
    }
  };

  const getScrollViewProps = () => ({
    ref: scrollViewRef,
    keyboardShouldPersistTaps: 'handled' as const,
    keyboardDismissMode: Platform.OS === 'ios' ? 'interactive' as const : 'on-drag' as const,
    contentInsetAdjustmentBehavior: 'automatic' as const,
    automaticallyAdjustKeyboardInsets: true,
    // Add extra bottom padding in landscape mode to account for keyboard
    contentContainerStyle: responsive.isLandscape 
      ? { paddingBottom: extraScrollHeight } 
      : undefined,
  });

  return {
    scrollViewRef,
    getScrollViewProps,
  };
};

export default useKeyboardAwareScrollView;