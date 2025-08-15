import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Overlay, Button, CheckBox, Text } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@rneui/themed';

export interface ExportOption {
  key: string;
  label: string;
  selected: boolean;
  disabled?: boolean;
}

interface ExportOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: string[]) => void;
  loading?: boolean;
  initialOptions?: ExportOption[];
}

const DEFAULT_OPTIONS: ExportOption[] = [
  { key: 'attendees', label: 'organizer.export.options.attendees', selected: true },
  { key: 'revenue', label: 'organizer.export.options.revenue', selected: true },
  { key: 'tickets', label: 'organizer.export.options.tickets', selected: true },
  { key: 'analytics', label: 'organizer.export.options.analytics', selected: false },
  { key: 'transactions', label: 'organizer.export.options.transactions', selected: false },
];

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  visible,
  onClose,
  onConfirm,
  loading = false,
  initialOptions = DEFAULT_OPTIONS,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [options, setOptions] = useState<ExportOption[]>(initialOptions);

  const handleToggleOption = useCallback((key: string) => {
    setOptions(prev =>
      prev.map(option =>
        option.key === key ? { ...option, selected: !option.selected } : option
      )
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setOptions(prev =>
      prev.map(option => ({ ...option, selected: !option.disabled }))
    );
  }, []);

  const handleDeselectAll = useCallback(() => {
    setOptions(prev =>
      prev.map(option => ({ ...option, selected: false }))
    );
  }, []);

  const handleConfirm = useCallback(() => {
    const selectedOptions = options
      .filter(option => option.selected)
      .map(option => option.key);

    if (selectedOptions.length === 0) {
      Alert.alert(
        t('common.error'),
        t('organizer.export.validation.selectAtLeastOne', '請至少選擇一項資料'),
        [{ text: t('common.ok'), style: 'default' }]
      );
      return;
    }

    onConfirm(selectedOptions);
  }, [options, onConfirm, t]);

  const selectedCount = options.filter(o => o.selected).length;
  const allSelected = selectedCount === options.filter(o => !o.disabled).length;
  const noneSelected = selectedCount === 0;

  return (
    <Overlay
      isVisible={visible}
      onBackdropPress={!loading ? onClose : undefined}
      overlayStyle={{
        backgroundColor: theme.colors.background,
        borderRadius: theme.spacing.md,
        padding: theme.spacing.lg,
        width: '90%',
        maxWidth: 400,
      }}
    >
      <View>
        <Text h4 style={{ marginBottom: theme.spacing.md, textAlign: 'center' }}>
          {t('organizer.export.title')}
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
          }}
        >
          <Button
            title={t('organizer.export.options.selectAll')}
            type="outline"
            size="sm"
            disabled={allSelected || loading}
            onPress={handleSelectAll}
            buttonStyle={{
              borderColor: allSelected ? theme.colors.disabled : theme.colors.primary,
            }}
            titleStyle={{
              color: allSelected ? theme.colors.grey3 : theme.colors.primary,
            }}
          />
          <Button
            title={t('organizer.export.options.deselectAll')}
            type="outline"
            size="sm"
            disabled={noneSelected || loading}
            onPress={handleDeselectAll}
            buttonStyle={{
              borderColor: noneSelected ? theme.colors.disabled : theme.colors.primary,
            }}
            titleStyle={{
              color: noneSelected ? theme.colors.grey3 : theme.colors.primary,
            }}
          />
        </View>

        <ScrollView
          style={{
            maxHeight: 300,
            marginBottom: theme.spacing.md,
          }}
        >
          {options.map(option => (
            <CheckBox
              key={option.key}
              title={t(option.label)}
              checked={option.selected}
              disabled={option.disabled || loading}
              onPress={() => handleToggleOption(option.key)}
              containerStyle={{
                backgroundColor: 'transparent',
                borderWidth: 0,
                marginLeft: 0,
                marginRight: 0,
                paddingLeft: 0,
                paddingVertical: theme.spacing.sm,
              }}
              textStyle={{
                color: option.disabled ? theme.colors.grey3 : theme.colors.black,
                fontWeight: 'normal',
              }}
              checkedIcon="check-square"
              uncheckedIcon="square-o"
              checkedColor={theme.colors.primary}
              uncheckedColor={theme.colors.grey3}
            />
          ))}
        </ScrollView>

        <Text
          style={{
            fontSize: 14,
            color: theme.colors.grey3,
            marginBottom: theme.spacing.md,
            textAlign: 'center',
          }}
        >
          {t('organizer.export.selectedCount', '已選擇 {{count}} 項', { count: selectedCount })}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Button
            title={t('common.cancel')}
            type="outline"
            onPress={onClose}
            disabled={loading}
            containerStyle={{ flex: 1, marginRight: theme.spacing.sm }}
            buttonStyle={{
              borderColor: theme.colors.grey3,
            }}
            titleStyle={{
              color: theme.colors.grey3,
            }}
          />
          <Button
            title={t('common.confirm')}
            onPress={handleConfirm}
            loading={loading}
            disabled={noneSelected}
            containerStyle={{ flex: 1, marginLeft: theme.spacing.sm }}
          />
        </View>
      </View>
    </Overlay>
  );
};