import React from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Icon,
  HStack,
  Text,
} from '@chakra-ui/react';
import {
  DownloadIcon,
  ChevronDownIcon,
  AttachmentIcon,
} from '@chakra-ui/icons';
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
  const toast = useToast();
  const { isExporting, setExporting, setExportError } = useReportStore();

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setExporting(true);
    setExportError(null);

    try {
      // Show immediate feedback
      toast({
        title: 'Generating Report',
        description: `Preparing ${format.toUpperCase()} export...`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });

      // Export the report
      const blob = await reportService.exportEventReport(eventId, format);
      const filename = reportService.generateFilename(eventTitle, format);
      
      // Download the file
      reportService.downloadFile(blob, filename);

      // Success feedback
      toast({
        title: 'Export Complete',
        description: `${format.toUpperCase()} report downloaded successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to export ${format.toUpperCase()} report`;
      setExportError(errorMessage);
      
      toast({
        title: 'Export Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        leftIcon={<DownloadIcon />}
        colorScheme="primary"
        isLoading={isExporting}
        loadingText="Exporting..."
      >
        Export Report
      </MenuButton>
      <MenuList>
        {EXPORT_FORMATS.map((exportFormat) => (
          <MenuItem
            key={exportFormat.format}
            onClick={() => handleExport(exportFormat.format)}
            isDisabled={isExporting}
          >
            <HStack spacing={3}>
              <Text fontSize="lg">{getFormatIcon(exportFormat.format)}</Text>
              <Text>{exportFormat.label}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};