import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ButtonGroup, Text, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@rneui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportFormatSelectorProps {
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  disabledFormats?: ExportFormat[];
  selectedDataTypes?: string[];
  showDescriptions?: boolean;
}

const FORMAT_ICONS: Record<ExportFormat, string> = {
  csv: 'file-delimited',
  excel: 'microsoft-excel',
  pdf: 'file-pdf-box',
};

const FORMAT_RESTRICTIONS: Record<string, ExportFormat[]> = {
  analytics: ['excel', 'pdf'], // Analytics data needs charts, not available in CSV
};

export const ExportFormatSelector: React.FC<ExportFormatSelectorProps> = ({
  selectedFormat,
  onFormatChange,
  disabledFormats = [],
  selectedDataTypes = [],
  showDescriptions = true,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const formats: ExportFormat[] = ['csv', 'excel', 'pdf'];

  // Calculate which formats are disabled based on selected data types
  const getDisabledFormats = (): ExportFormat[] => {
    const restrictedFormats = new Set(disabledFormats);
    
    selectedDataTypes.forEach(dataType => {
      const restrictions = FORMAT_RESTRICTIONS[dataType];
      if (restrictions) {
        formats.forEach(format => {
          if (!restrictions.includes(format)) {
            restrictedFormats.add(format);
          }
        });
      }
    });

    return Array.from(restrictedFormats);
  };

  const effectiveDisabledFormats = getDisabledFormats();

  useEffect(() => {
    const index = formats.indexOf(selectedFormat);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  }, [selectedFormat]);

  const handleFormatChange = (index: number) => {
    const format = formats[index];
    if (!effectiveDisabledFormats.includes(format)) {
      setSelectedIndex(index);
      onFormatChange(format);
    }
  };

  const getEstimatedSize = (format: ExportFormat): string => {
    switch (format) {
      case 'csv':
        return '~100 KB';
      case 'excel':
        return '~500 KB';
      case 'pdf':
        return '~1 MB';
      default:
        return '';
    }
  };

  const buttons = formats.map(format => ({
    element: () => (
      <View style={styles.buttonContent}>
        <Icon
          name={FORMAT_ICONS[format]}
          type="material-community"
          size={24}
          color={
            effectiveDisabledFormats.includes(format)
              ? theme.colors.grey3
              : selectedFormat === format
              ? theme.colors.white
              : theme.colors.primary
          }
        />
        <Text
          style={[
            styles.buttonText,
            {
              color: effectiveDisabledFormats.includes(format)
                ? theme.colors.grey3
                : selectedFormat === format
                ? theme.colors.white
                : theme.colors.black,
            },
          ]}
        >
          {t(`organizer.export.formats.${format}`)}
        </Text>
        <Text
          style={[
            styles.sizeText,
            {
              color: effectiveDisabledFormats.includes(format)
                ? theme.colors.grey3
                : selectedFormat === format
                ? theme.colors.white
                : theme.colors.grey5,
            },
          ]}
        >
          {getEstimatedSize(format)}
        </Text>
      </View>
    ),
  }));

  return (
    <View>
      <Text h4 style={{ marginBottom: theme.spacing.md }}>
        {t('organizer.export.formats.title')}
      </Text>

      <ButtonGroup
        buttons={buttons}
        selectedIndex={selectedIndex}
        onPress={handleFormatChange}
        disabled={effectiveDisabledFormats.map(f => formats.indexOf(f))}
        containerStyle={{
          marginBottom: showDescriptions ? theme.spacing.md : 0,
          borderRadius: theme.spacing.sm,
        }}
        selectedButtonStyle={{
          backgroundColor: theme.colors.primary,
        }}
        buttonStyle={{
          paddingVertical: theme.spacing.md,
        }}
      />

      {showDescriptions && (
        <View style={[styles.descriptionContainer, { padding: theme.spacing.md }]}>
          <Text style={[styles.descriptionText, { color: theme.colors.grey3 }]}>
            {t(`organizer.export.formats.description.${selectedFormat}`)}
          </Text>
          {effectiveDisabledFormats.includes(selectedFormat) && (
            <View style={[styles.warningContainer, { marginTop: theme.spacing.sm }]}>
              <Icon
                name="alert-circle"
                type="material-community"
                size={16}
                color={theme.colors.warning}
              />
              <Text style={[styles.warningText, { color: theme.colors.warning }]}>
                {t('organizer.export.formats.unavailable', '此格式不適用於所選資料類型')}
              </Text>
            </View>
          )}
        </View>
      )}

      {selectedDataTypes.includes('analytics') && selectedFormat === 'csv' && (
        <View style={[styles.infoContainer, { padding: theme.spacing.sm }]}>
          <Icon
            name="information"
            type="material-community"
            size={16}
            color={theme.colors.primary}
          />
          <Text style={[styles.infoText, { color: theme.colors.primary }]}>
            {t('organizer.export.formats.csvLimitation', '分析圖表僅在 Excel 或 PDF 格式中可用')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  sizeText: {
    fontSize: 10,
    marginTop: 2,
  },
  descriptionContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    fontSize: 12,
    marginLeft: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
});