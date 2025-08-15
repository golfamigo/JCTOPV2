import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Modal, Platform, ScrollView } from 'react-native';
import { Text, Button, FAB, Tab, TabView } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { FinancialReports } from '@/components/features/organizer/FinancialReports';
import { TransactionList } from '@/components/features/organizer/TransactionList';
import { ReportFiltersComponent, ReportFilters } from '@/components/features/organizer/ReportFilters';
import reportService, { ExportOptions, ExportProgress } from '@/services/reportService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ExportOptionsModal } from '@/components/features/organizer/ExportOptionsModal';
import { ExportFormatSelector } from '@/components/molecules/ExportFormatSelector';
import { ExportProgressModal } from '@/components/features/organizer/ExportProgressModal';
import { ExportHistoryList } from '@/components/features/organizer/ExportHistoryList';
import { useExportToast } from '@/components/molecules/ExportToast';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showExportProgress, setShowExportProgress] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedExportOptions, setSelectedExportOptions] = useState<string[]>(['attendees', 'revenue', 'tickets']);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [exportProgress, setExportProgress] = useState<ExportProgress>({
    stage: 'preparing',
    progress: 0,
  });
  const exportIdRef = useRef<string | null>(null);
  const { show: showToast } = useExportToast();
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end: new Date(),
    },
    transactionTypes: [] as ('revenue' | 'expense' | 'refund')[],
    paymentMethods: [] as string[],
    eventIds: [] as string[],
  });

  // Mock transactions for demonstration
  const mockTransactions = [
    {
      id: '1',
      date: new Date().toISOString(),
      type: 'revenue' as const,
      description: '普通票銷售',
      amount: 500,
      paymentMethod: '信用卡',
      attendeeName: '王小明',
      ticketType: '普通票',
      status: 'completed' as const,
    },
    {
      id: '2',
      date: new Date().toISOString(),
      type: 'expense' as const,
      description: '場地租金',
      amount: 20000,
      status: 'completed' as const,
    },
    {
      id: '3',
      date: new Date().toISOString(),
      type: 'refund' as const,
      description: '票券退款',
      amount: 500,
      paymentMethod: '信用卡',
      attendeeName: '李小華',
      ticketType: 'VIP票',
      status: 'pending' as const,
    },
  ];

  const handleExport = useCallback(() => {
    setShowExportOptions(true);
  }, []);

  const handleConfirmExportOptions = useCallback(async (options: string[]) => {
    setSelectedExportOptions(options);
    setShowExportOptions(false);
    
    // Start export with progress tracking
    setShowExportProgress(true);
    
    const exportOptions: ExportOptions = {
      dataTypes: options,
      format: selectedFormat,
      eventName: 'Financial Report',
    };
    
    try {
      const exportId = await reportService.exportWithProgress(
        exportOptions,
        (progress) => setExportProgress(progress)
      );
      exportIdRef.current = exportId;
    } catch (error) {
      console.error('Export failed:', error);
      setShowExportProgress(false);
      showToast({
        variant: 'error',
        title: t('organizer.export.error.title'),
        message: t('organizer.export.error.message'),
      });
    }
  }, [selectedFormat, t, showToast]);

  const handleCancelExport = useCallback(() => {
    if (exportIdRef.current) {
      reportService.cancelExport(exportIdRef.current);
      exportIdRef.current = null;
    }
    setShowExportProgress(false);
  }, []);

  const handleRedownload = useCallback(async (item: any) => {
    setShowExportProgress(true);
    
    const exportOptions: ExportOptions = {
      dataTypes: item.dataTypes,
      format: item.format,
      eventName: item.eventName,
    };
    
    try {
      await reportService.exportWithProgress(
        exportOptions,
        (progress) => setExportProgress(progress)
      );
    } catch (error) {
      console.error('Redownload failed:', error);
      setShowExportProgress(false);
    }
  }, []);

  const handleFilterPress = useCallback(() => {
    setShowFilters(true);
  }, []);

  const handleApplyFilters = useCallback((newFilters: ReportFilters) => {
    setFilters({
      ...newFilters,
      transactionTypes: newFilters.transactionTypes || [],
      paymentMethods: newFilters.paymentMethods || [],
      eventIds: newFilters.eventIds || [],
    });
    setShowFilters(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      dateRange: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
      },
      transactionTypes: [],
      paymentMethods: [],
      eventIds: [],
    });
    setShowFilters(false);
  }, []);

  const handleTransactionPress = useCallback((transaction: any) => {
    // Handle transaction detail view
    console.log('Transaction pressed:', transaction);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <Text h2 style={[styles.title, { color: colors.dark }]}>
          {t('organizer.reports.title')}
        </Text>
      </View>

      <Tab
        value={activeTab}
        onChange={setActiveTab}
        indicatorStyle={{ backgroundColor: colors.primary }}
        variant="primary"
      >
        <Tab.Item
          title={t('organizer.reports.revenueReport')}
          titleStyle={{ fontSize: 12 }}
          icon={{ name: 'chart-line', type: 'material-community', color: colors.primary }}
        />
        <Tab.Item
          title={t('organizer.reports.transactionDetails')}
          titleStyle={{ fontSize: 12 }}
          icon={{ name: 'format-list-bulleted', type: 'material-community', color: colors.primary }}
        />
        <Tab.Item
          title={t('organizer.export.history.title')}
          titleStyle={{ fontSize: 12 }}
          icon={{ name: 'history', type: 'material-community', color: colors.primary }}
        />
      </Tab>

      <TabView value={activeTab} onChange={setActiveTab} animationType="spring">
        <TabView.Item style={{ width: '100%' }}>
          <FinancialReports
            eventId="demo-event-1"
            onExport={handleExport}
            onFilterPress={handleFilterPress}
            onTransactionPress={() => setActiveTab(1)}
          />
        </TabView.Item>
        <TabView.Item style={{ width: '100%' }}>
          <TransactionList
            transactions={mockTransactions}
            onTransactionPress={handleTransactionPress}
          />
        </TabView.Item>
        <TabView.Item style={{ width: '100%' }}>
          <ExportHistoryList
            maxItems={20}
            onRedownload={handleRedownload}
          />
        </TabView.Item>
      </TabView>

      {activeTab !== 2 && (
        <FAB
          placement="right"
          size="large"
          color={colors.primary}
          icon={{ name: 'download', type: 'material-community', color: colors.white }}
          onPress={handleExport}
        />
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
          <Text h3 style={[styles.modalTitle, { color: colors.white }]}>
            {t('organizer.reports.applyFilters')}
          </Text>
        </View>
        <ReportFiltersComponent
          filters={filters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </Modal>

      {/* Export Options Modal */}
      <ExportOptionsModal
        visible={showExportOptions}
        onClose={() => setShowExportOptions(false)}
        onConfirm={handleConfirmExportOptions}
        initialOptions={[
          { key: 'attendees', label: 'organizer.export.options.attendees', selected: true },
          { key: 'revenue', label: 'organizer.export.options.revenue', selected: true },
          { key: 'tickets', label: 'organizer.export.options.tickets', selected: true },
          { key: 'analytics', label: 'organizer.export.options.analytics', selected: false },
          { key: 'transactions', label: 'organizer.export.options.transactions', selected: false },
        ]}
      />

      {/* Export Progress Modal */}
      <ExportProgressModal
        visible={showExportProgress}
        progress={exportProgress.progress}
        stage={exportProgress.stage}
        estimatedTimeRemaining={exportProgress.estimatedTime}
        onCancel={handleCancelExport}
        fileName={`Financial_Report_${new Date().toISOString().split('T')[0]}.${selectedFormat}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    textAlign: 'center',
  },
  actionSheetContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionSheetTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  exportOption: {
    justifyContent: 'flex-start',
    paddingVertical: 15,
  },
  cancelButton: {
    marginTop: 10,
  },
  transactionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});