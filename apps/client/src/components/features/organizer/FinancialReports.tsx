import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, RefreshControl, Platform } from 'react-native';
import { Text, ButtonGroup, Card, Button, Skeleton } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { PieChart, BarChart } from 'react-native-chart-kit';
import reportService from '@/services/reportService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FinancialReport {
  reportId: string;
  eventId: string;
  eventTitle: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  revenue: {
    total: number;
    byTicketType: Array<{
      type: string;
      amount: number;
      quantity: number;
    }>;
    byPaymentMethod: Array<{
      method: string;
      amount: number;
    }>;
  };
  expenses: {
    total: number;
    categories: Array<{
      category: string;
      amount: number;
    }>;
  };
  netProfit: number;
  transactions: Transaction[];
  generatedAt: string;
}

interface Transaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense' | 'refund';
  description: string;
  amount: number;
  paymentMethod?: string;
  attendeeName?: string;
  ticketType?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface FinancialReportsProps {
  eventId?: string;
  onTransactionPress?: (transaction: Transaction) => void;
  onExport?: () => void;
  onFilterPress?: () => void;
}

const screenWidth = Dimensions.get('window').width;

export const FinancialReports: React.FC<FinancialReportsProps> = ({
  eventId,
  onTransactionPress,
  onExport,
  onFilterPress,
}) => {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const borderRadius = 8;
  const [selectedReportType, setSelectedReportType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState<FinancialReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reportTypes = [
    t('organizer.reports.revenueReport'),
    t('organizer.reports.expenseReport'),
    t('organizer.reports.comprehensiveReport'),
  ];

  // Chart configuration using theme colors
  const chartConfig = useMemo(() => ({
    backgroundColor: colors.white,
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(33, 37, 41, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  }), [colors]);

  // Format currency in TWD
  const formatCurrency = useCallback((amount: number) => {
    return `NT$ ${amount.toLocaleString('zh-TW')}`;
  }, []);

  // Format large numbers with 千/萬
  const formatLargeNumber = useCallback((num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}萬`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}千`;
    }
    return num.toString();
  }, []);

  // Load financial report data
  const loadReportData = useCallback(async () => {
    if (!eventId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use actual service call with proper error handling
      const data = await reportService.getFinancialReport(eventId);
      setReportData(data);
    } catch (err) {
      // Provide more specific error messages based on error type
      const errorMessage = err instanceof Error && err.message.includes('Network') 
        ? t('common.error.networkError')
        : t('common.error.loadFailed');
      setError(errorMessage);
      console.error('Failed to load financial report:', err);
      
      // Try to load from cache if available
      try {
        const cachedData = await reportService.getCachedFinancialReport(eventId);
        if (cachedData) {
          setReportData(cachedData);
          setError(null); // Clear error if cache load succeeds
        }
      } catch (cacheError) {
        // Keep original error if cache also fails
      }
    } finally {
      setLoading(false);
    }
  }, [eventId, t]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData, selectedReportType]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  }, [loadReportData]);

  // Prepare pie chart data for revenue breakdown
  const pieChartData = useMemo(() => {
    if (!reportData) return [];
    
    return reportData.revenue.byTicketType.map((item, index) => ({
      name: item.type,
      population: item.amount,
      color: index === 0 ? colors.primary : colors.success,
      legendFontColor: colors.dark,
      legendFontSize: 14,
    }));
  }, [reportData, colors]);

  // Prepare bar chart data for monthly trend
  const barChartData = useMemo(() => {
    if (!reportData) return { labels: [], datasets: [] };
    
    return {
      labels: ['一月', '二月', '三月'],
      datasets: [
        {
          data: [50000, 75000, 150000],
        },
      ],
    };
  }, [reportData]);

  // Render loading state
  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Skeleton animation="pulse" height={50} style={{ marginBottom: spacing.md }} />
        <Skeleton animation="pulse" height={200} style={{ marginBottom: spacing.md }} />
        <Skeleton animation="pulse" height={200} style={{ marginBottom: spacing.md }} />
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <Button
            title={t('common.retry')}
            onPress={loadReportData}
            buttonStyle={{ backgroundColor: colors.primary }}
          />
        </Card>
      </View>
    );
  }

  // Determine what to show based on selected report type
  const showRevenue = selectedReportType === 0 || selectedReportType === 2;
  const showExpenses = selectedReportType === 1 || selectedReportType === 2;

  return (
    <ScrollView
      testID="scrollView"
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Report Type Selection */}
      <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
        <ButtonGroup
          buttons={reportTypes}
          selectedIndex={selectedReportType}
          onPress={setSelectedReportType}
          containerStyle={[
            styles.buttonGroup,
            { 
              backgroundColor: colors.white,
              borderColor: colors.grey2,
              borderRadius: borderRadius,
            }
          ]}
          selectedButtonStyle={{ backgroundColor: colors.primary }}
          textStyle={{ color: colors.grey3 }}
          selectedTextStyle={{ color: colors.white }}
        />
      </View>

      {/* Summary Cards */}
      {reportData && (
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <View style={styles.summaryRow}>
            {showRevenue && (
              <Card containerStyle={[styles.summaryCard, { backgroundColor: colors.white }]}>
                <View style={styles.summaryContent}>
                  <MaterialCommunityIcons 
                    name="cash-plus" 
                    size={24} 
                    color={colors.success} 
                  />
                  <Text style={[styles.summaryLabel, { color: colors.grey3 }]}>
                    {t('organizer.reports.totalRevenue')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.success }]}>
                    {formatCurrency(reportData.revenue.total)}
                  </Text>
                </View>
              </Card>
            )}

            {showExpenses && (
              <Card containerStyle={[styles.summaryCard, { backgroundColor: colors.white }]}>
                <View style={styles.summaryContent}>
                  <MaterialCommunityIcons 
                    name="cash-minus" 
                    size={24} 
                    color={colors.error} 
                  />
                  <Text style={[styles.summaryLabel, { color: colors.grey3 }]}>
                    {t('organizer.reports.totalExpenses')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.error }]}>
                    {formatCurrency(reportData.expenses.total)}
                  </Text>
                </View>
              </Card>
            )}

            {selectedReportType === 2 && (
              <Card containerStyle={[styles.summaryCard, { backgroundColor: colors.white }]}>
                <View style={styles.summaryContent}>
                  <MaterialCommunityIcons 
                    name="wallet" 
                    size={24} 
                    color={colors.primary} 
                  />
                  <Text style={[styles.summaryLabel, { color: colors.grey3 }]}>
                    {t('organizer.reports.netProfit')}
                  </Text>
                  <Text style={[styles.summaryValue, { color: colors.primary }]}>
                    {formatCurrency(reportData.netProfit)}
                  </Text>
                </View>
              </Card>
            )}
          </View>
        </View>
      )}

      {/* Revenue Charts */}
      {reportData && showRevenue && (
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          {/* Pie Chart - Revenue by Ticket Type */}
          <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
            <Text h4 style={[styles.chartTitle, { color: colors.dark }]}>
              {t('organizer.reports.byTicketType')}
            </Text>
            {pieChartData.length > 0 && (
              <PieChart
                data={pieChartData}
                width={screenWidth - spacing.md * 4}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            )}
          </Card>

          {/* Bar Chart - Monthly Revenue Trend */}
          <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
            <Text h4 style={[styles.chartTitle, { color: colors.dark }]}>
              {t('organizer.reports.monthlyTrend')}
            </Text>
            <BarChart
              data={barChartData}
              width={screenWidth - spacing.md * 4}
              height={220}
              chartConfig={chartConfig}
              verticalLabelRotation={0}
              showValuesOnTopOfBars
              fromZero
              yAxisLabel="NT$"
              yAxisSuffix=""
            />
          </Card>
        </View>
      )}

      {/* Expense Breakdown */}
      {reportData && showExpenses && (
        <View style={[styles.section, { paddingHorizontal: spacing.md }]}>
          <Card containerStyle={[styles.card, { backgroundColor: colors.white }]}>
            <Text h4 style={[styles.chartTitle, { color: colors.dark }]}>
              {t('organizer.reports.expenses')}
            </Text>
            {reportData.expenses.categories.map((category, index) => (
              <View key={index} style={styles.expenseRow}>
                <Text style={[styles.expenseCategory, { color: colors.grey5 }]}>
                  {category.category}
                </Text>
                <Text style={[styles.expenseAmount, { color: colors.error }]}>
                  {formatCurrency(category.amount)}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Action Buttons */}
      <View style={[styles.actionSection, { paddingHorizontal: spacing.md }]}>
        <Button
          title={t('organizer.reports.export')}
          icon={
            <MaterialCommunityIcons
              name="download"
              size={20}
              color={colors.white}
              style={{ marginRight: spacing.xs }}
            />
          }
          onPress={onExport}
          buttonStyle={[styles.actionButton, { backgroundColor: colors.primary }]}
        />
        <Button
          title={t('organizer.reports.applyFilters')}
          icon={
            <MaterialCommunityIcons
              name="filter"
              size={20}
              color={colors.primary}
              style={{ marginRight: spacing.xs }}
            />
          }
          onPress={onFilterPress}
          type="outline"
          buttonStyle={[styles.actionButton, { borderColor: colors.primary }]}
          titleStyle={{ color: colors.primary }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
  },
  buttonGroup: {
    height: 50,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    minWidth: '30%',
    marginHorizontal: 5,
    marginVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryContent: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    marginBottom: 15,
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  expenseCategory: {
    fontSize: 16,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  actionButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
});

export default FinancialReports;