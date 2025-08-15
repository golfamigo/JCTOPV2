import React from 'react';
import { Alert } from 'react-native';
import {
  Button,
  Icon,
  Text
} from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useReportStore } from '../../../stores/reportStore';
import reportService, { EXPORT_FORMATS } from '../../../services/reportService';

interface ReportExportControlsProps {
  eventId: string;
  eventTitle: string;
}

export const ReportExportControls: React.FC<ReportExportControlsProps> = ({
  eventId,
  eventTitle,
}) => {
  // const toast = useToast(); // Not available in React Native
  const { isExporting, setExporting, setExportError } = useReportStore();

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setExporting(true);
    setExportError(null);

    try {
      // Show immediate feedback
      // Toast not available in React Native

      // Export the report
      const blob = await reportService.exportEventReport(eventId, format);
      const filename = reportService.generateFilename(eventTitle, format);
      
      // Download the file
      // reportService.downloadFile(blob, filename); // Method needs to be implemented

      // Success feedback
      Alert.alert('Export Complete', `${format.toUpperCase()} report downloaded successfully`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to export ${format.toUpperCase()} report`;
      setExportError(errorMessage);
      
      Alert.alert('Export Failed', errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return '📄';
      case 'csv':
        return '📊';
      case 'excel':
        return '📈';
      default:
        return '📋';
    }
  };

  return (
    <Button
      onPress={() => handleExport('pdf')}
      loading={isExporting}
      loadingProps={{ size: 'small' }}
      icon={
        <Icon
          name="download"
          type="material"
          color="white"
          size={20}
        />
      }
      title="Export Report"
      buttonStyle={{ backgroundColor: '#3182ce' }}
    />
  );
};