/**
 * Accessible modal wrapper component with focus management
 */

import React, { useEffect, useRef, useCallback, ReactNode } from 'react';
import { Modal, ModalProps, View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { Overlay, OverlayProps, Icon } from '@rneui/themed';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { useScreenReader } from '../hooks/useScreenReader';
import { useAccessibility } from '../hooks/useAccessibility';
import { accessibilityLabels } from '../../constants/accessibilityLabels';
import { WCAG_STANDARDS } from '../constants';

export interface AccessibleModalProps extends Partial<OverlayProps> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  announceOnOpen?: string;
  announceOnClose?: string;
  trapFocus?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  closeButtonLabel?: string;
  testID?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  visible,
  onClose,
  title,
  children,
  accessibilityLabel,
  accessibilityHint,
  announceOnOpen,
  announceOnClose,
  trapFocus = true,
  closeOnEscape = true,
  showCloseButton = true,
  closeButtonLabel = accessibilityLabels.buttons.close,
  testID,
  overlayStyle,
  ...overlayProps
}) => {
  const { trapRef, setFocus, trapFocus: initTrapFocus, releaseFocus } = useFocusManagement();
  const { announce, announcePageChange } = useScreenReader();
  const { screenReaderEnabled } = useAccessibility();
  const closeButtonRef = useRef<any>(null);
  const firstFocusableRef = useRef<any>(null);

  // Handle modal open
  useEffect(() => {
    if (visible) {
      // Announce modal opening
      if (screenReaderEnabled) {
        const announcement = announceOnOpen || title || accessibilityLabel || '彈出視窗已開啟';
        announcePageChange(announcement);
      }

      // Set up focus trap
      if (trapFocus && trapRef.current) {
        initTrapFocus(trapRef.current);
      }

      // Focus first element or close button
      setTimeout(() => {
        if (firstFocusableRef.current) {
          setFocus(firstFocusableRef.current);
        } else if (closeButtonRef.current) {
          setFocus(closeButtonRef.current);
        }
      }, WCAG_STANDARDS.timing.focusDelay);
    } else {
      // Release focus trap when closing
      releaseFocus();

      // Announce modal closing
      if (screenReaderEnabled && announceOnClose) {
        announce(announceOnClose);
      }
    }
  }, [
    visible,
    trapFocus,
    screenReaderEnabled,
    announceOnOpen,
    announceOnClose,
    title,
    accessibilityLabel,
    initTrapFocus,
    releaseFocus,
    setFocus,
    announce,
    announcePageChange,
  ]);

  // Handle escape key
  useEffect(() => {
    if (!visible || !closeOnEscape || Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible, closeOnEscape, onClose]);

  const styles = StyleSheet.create({
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: 20,
    },
    container: {
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 20,
      maxWidth: 500,
      width: '100%',
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      flex: 1,
    },
    closeButton: {
      padding: 8,
      minWidth: WCAG_STANDARDS.targetSizes.minimum,
      minHeight: WCAG_STANDARDS.targetSizes.minimum,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
    },
  });

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={onClose}
      overlayStyle={[styles.overlay, overlayStyle]}
      animationType="fade"
      testID={testID}
      {...overlayProps}
    >
      <View
        ref={trapRef}
        style={styles.container}
        accessibilityRole="none"
        accessibilityLabel={accessibilityLabel || accessibilityLabels.modals.modal_container}
        accessibilityHint={accessibilityHint}
        accessibilityViewIsModal={true}
        importantForAccessibility="yes"
      >
        {/* Header with title and close button */}
        {(title || showCloseButton) && (
          <View style={styles.header}>
            {title && (
              <Text
                style={styles.title}
                accessibilityRole="header"
                accessibilityLabel={title}
                ref={firstFocusableRef}
              >
                {title}
              </Text>
            )}
            
            {showCloseButton && (
              <Pressable
                ref={closeButtonRef}
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel={closeButtonLabel}
                accessibilityHint={accessibilityLabels.hints.double_tap_to_activate}
                testID={`${testID}-close-button`}
              >
                <Icon
                  name="close"
                  type="material"
                  size={24}
                  color="#000000"
                />
              </Pressable>
            )}
          </View>
        )}

        {/* Modal content */}
        <View 
          style={styles.content}
          accessibilityRole="none"
        >
          {children}
        </View>
      </View>
    </Overlay>
  );
};

// Confirmation dialog variant
export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  dangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmLabel = accessibilityLabels.buttons.confirm,
  cancelLabel = accessibilityLabels.buttons.cancel,
  onConfirm,
  onCancel,
  dangerous = false,
}) => {
  const confirmButtonRef = useRef<any>(null);

  // Focus confirm button when opened
  useEffect(() => {
    if (visible && confirmButtonRef.current) {
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, WCAG_STANDARDS.timing.focusDelay);
    }
  }, [visible]);

  return (
    <AccessibleModal
      visible={visible}
      onClose={onCancel}
      title={title}
      accessibilityLabel={accessibilityLabels.modals.confirmation_dialog}
      announceOnOpen={`確認對話框：${title}`}
      showCloseButton={false}
    >
      <View>
        <Text
          style={{ marginBottom: 20, fontSize: 16 }}
          accessibilityRole="text"
        >
          {message}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
          <Pressable
            onPress={onCancel}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: '#ccc',
              minWidth: WCAG_STANDARDS.targetSizes.minimum,
              minHeight: WCAG_STANDARDS.targetSizes.minimum,
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
          >
            <Text>{cancelLabel}</Text>
          </Pressable>
          
          <Pressable
            ref={confirmButtonRef}
            onPress={onConfirm}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 4,
              backgroundColor: dangerous ? '#DC3545' : '#007BFF',
              minWidth: WCAG_STANDARDS.targetSizes.minimum,
              minHeight: WCAG_STANDARDS.targetSizes.minimum,
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            accessibilityHint={dangerous ? '警告：此操作無法復原' : undefined}
          >
            <Text style={{ color: 'white' }}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </AccessibleModal>
  );
};

export default AccessibleModal;