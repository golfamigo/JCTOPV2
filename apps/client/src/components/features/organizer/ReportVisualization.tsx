import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Divider, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { EventReport } from '@jctop-event/shared-types';
import { useAppTheme } from '../../../theme';

interface ReportVisualizationProps {
  report: EventReport;
}

const ReportVisualization: React.FC<ReportVisualizationProps> = ({ report }) => {
  const { colors } = useAppTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return colors.success;
      case 'checkedIn':
        return colors.primary;
      case 'pending':
        return colors.warning;
      case 'cancelled':
        return colors.error;
      default:
        return colors.grey2;
    }
  };

  const totalPaidRegistrations = report.registrationStats.byStatus.paid + 
                                 report.registrationStats.byStatus.checkedIn;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Registration Status Breakdown */}
        <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
          <Text h4 style={[styles.cardTitle, { color: colors.primary }]}>
            Registration Status Breakdown
          </Text>
          
          <View style={styles.statsGrid}>
            {/* Registration Distribution */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Registration Distribution
              </Text>
              
              {Object.entries(report.registrationStats.byStatus).map(([status, count]) => {
                const percentage = report.registrationStats.total > 0 
                  ? (count / report.registrationStats.total) * 100 
                  : 0;
                
                return (
                  <View key={status} style={styles.statItem}>
                    <View style={styles.statHeader}>
                      <Text style={[styles.statLabel, { color: colors.grey2 }]}>
                        {status === 'checkedIn' ? 'Checked In' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                      <Text style={[styles.statValue, { color: colors.text }]}>
                        {count} ({percentage.toFixed(1)}%)
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.grey5 }]}>
                      <View 
                        style={[
                          styles.progressFill,
                          { 
                            backgroundColor: getStatusColor(status),
                            width: `${Math.min(percentage, 100)}%`
                          }
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Quick Stats */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Quick Stats
              </Text>
              
              <View style={styles.quickStatsGrid}>
                <View style={styles.quickStatBox}>
                  <Text style={[styles.bigNumber, { color: colors.success }]}>
                    {totalPaidRegistrations}
                  </Text>
                  <Text style={[styles.quickStatLabel, { color: colors.grey2 }]}>
                    Paid Registrations
                  </Text>
                </View>
                
                <View style={styles.quickStatBox}>
                  <Text style={[styles.bigNumber, { color: colors.primary }]}>
                    {report.attendanceStats.rate}%
                  </Text>
                  <Text style={[styles.quickStatLabel, { color: colors.grey2 }]}>
                    Show-up Rate
                  </Text>
                </View>
                
                <View style={styles.quickStatBox}>
                  <Text style={[styles.bigNumber, { color: colors.warning }]}>
                    {report.registrationStats.byStatus.pending}
                  </Text>
                  <Text style={[styles.quickStatLabel, { color: colors.grey2 }]}>
                    Pending
                  </Text>
                </View>
                
                <View style={styles.quickStatBox}>
                  <Text style={[styles.bigNumber, { color: colors.error }]}>
                    {report.registrationStats.byStatus.cancelled}
                  </Text>
                  <Text style={[styles.quickStatLabel, { color: colors.grey2 }]}>
                    Cancelled
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Ticket Type Performance */}
        {report.registrationStats.byTicketType.length > 0 && (
          <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
            <Text h4 style={[styles.cardTitle, { color: colors.primary }]}>
              Ticket Type Performance
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.grey5 }]}>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.text }]}>
                    Ticket Type
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellRight, { color: colors.text }]}>
                    Sold
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellRight, { color: colors.text }]}>
                    Revenue
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellRight, { color: colors.text }]}>
                    Avg. Price
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.text, minWidth: 120 }]}>
                    Performance
                  </Text>
                </View>
                
                {/* Table Body */}
                {report.registrationStats.byTicketType.map((ticketType) => {
                  const avgPrice = ticketType.quantitySold > 0 
                    ? ticketType.revenue / ticketType.quantitySold 
                    : 0;
                  const revenuePercentage = report.revenue.gross > 0
                    ? (ticketType.revenue / report.revenue.gross) * 100
                    : 0;

                  return (
                    <View key={ticketType.ticketTypeId} style={styles.tableRow}>
                      <Text style={[styles.tableCell, { color: colors.text }]}>
                        {ticketType.ticketTypeName}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight, { color: colors.text }]}>
                        {ticketType.quantitySold}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight, { color: colors.success, fontWeight: '600' }]}>
                        {formatCurrency(ticketType.revenue)}
                      </Text>
                      <Text style={[styles.tableCell, styles.tableCellRight, { color: colors.text }]}>
                        {formatCurrency(avgPrice)}
                      </Text>
                      <View style={[styles.tableCell, { minWidth: 120 }]}>
                        <Text style={[styles.performanceText, { color: colors.grey2 }]}>
                          {revenuePercentage.toFixed(1)}% of total
                        </Text>
                        <View style={[styles.progressBar, { backgroundColor: colors.grey5, marginTop: 4 }]}>
                          <View 
                            style={[
                              styles.progressFill,
                              { 
                                backgroundColor: colors.primary,
                                width: `${Math.min(revenuePercentage, 100)}%`
                              }
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </Card>
        )}

        {/* Revenue Analysis */}
        <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
          <Text h4 style={[styles.cardTitle, { color: colors.primary }]}>
            Revenue Analysis
          </Text>
          
          <View style={styles.revenueGrid}>
            <View style={[styles.revenueBox, { backgroundColor: colors.grey5 }]}>
              <Text style={[styles.revenueAmount, { color: colors.success }]}>
                {formatCurrency(report.revenue.gross)}
              </Text>
              <Text style={[styles.revenueLabel, { color: colors.grey2 }]}>
                Gross Revenue
              </Text>
            </View>
            
            <View style={[styles.revenueBox, { backgroundColor: colors.grey5 }]}>
              <Text style={[styles.revenueAmount, { color: colors.warning }]}>
                -{formatCurrency(report.revenue.discountAmount)}
              </Text>
              <Text style={[styles.revenueLabel, { color: colors.grey2 }]}>
                Total Discounts
              </Text>
            </View>
            
            <View style={[styles.revenueBox, { backgroundColor: colors.grey5 }]}>
              <Text style={[styles.revenueAmount, { color: colors.primary }]}>
                {formatCurrency(report.revenue.net)}
              </Text>
              <Text style={[styles.revenueLabel, { color: colors.grey2 }]}>
                Net Revenue
              </Text>
            </View>
          </View>

          {report.revenue.discountAmount > 0 && (
            <View style={[styles.discountImpact, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
              <Icon
                name="info"
                type="material"
                color={colors.warning}
                size={16}
                containerStyle={styles.discountIcon}
              />
              <Text style={[styles.discountText, { color: colors.warning }]}>
                <Text style={{ fontWeight: '600' }}>Discount Impact:</Text> Discounts reduced revenue by{' '}
                {((report.revenue.discountAmount / report.revenue.gross) * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </Card>

        {/* Registration Timeline */}
        {report.timeline.length > 0 ? (
          <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
            <Text h4 style={[styles.cardTitle, { color: colors.primary }]}>
              Registration Timeline
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: colors.grey5 }]}>
                  <Text style={[styles.tableCell, styles.tableCellHeader, { color: colors.text, minWidth: 80 }]}>
                    Date
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellRight, { color: colors.text }]}>
                    Daily Reg.
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellRight, { color: colors.text }]}>
                    Daily Rev.
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellRight, { color: colors.text }]}>
                    Total Reg.
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellHeader, styles.tableCellRight, { color: colors.text }]}>
                    Total Rev.
                  </Text>
                </View>
                
                {/* Table Body */}
                {report.timeline.slice(-10).map((point) => (
                  <View key={point.date} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { color: colors.text, minWidth: 80 }]}>
                      {formatDate(point.date)}
                    </Text>
                    <Text style={[
                      styles.tableCell, 
                      styles.tableCellRight,
                      { color: point.registrations > 0 ? colors.success : colors.grey3 }
                    ]}>
                      {point.registrations}
                    </Text>
                    <Text style={[
                      styles.tableCell,
                      styles.tableCellRight,
                      { color: point.revenue > 0 ? colors.success : colors.grey3 }
                    ]}>
                      {formatCurrency(point.revenue)}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellRight, { color: colors.text, fontWeight: '500' }]}>
                      {point.cumulativeRegistrations}
                    </Text>
                    <Text style={[styles.tableCell, styles.tableCellRight, { color: colors.primary, fontWeight: '600' }]}>
                      {formatCurrency(point.cumulativeRevenue)}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
            
            {report.timeline.length > 10 && (
              <Text style={[styles.timelineNote, { color: colors.grey2 }]}>
                Showing last 10 days. Full timeline available in exported reports.
              </Text>
            )}
          </Card>
        ) : (
          <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary }]}>
            <Icon
              name="info"
              type="material"
              color={colors.primary}
              size={20}
              containerStyle={styles.infoIcon}
            />
            <Text style={[styles.infoText, { color: colors.primary }]}>
              No timeline data available - this typically means no registrations have been recorded yet.
            </Text>
          </View>
        )}

        {/* Summary Insights */}
        <Card containerStyle={[styles.card, { backgroundColor: colors.card }]}>
          <Text h4 style={[styles.cardTitle, { color: colors.primary }]}>
            Event Insights
          </Text>
          
          <View style={styles.insightsList}>
            {report.attendanceStats.rate >= 70 && (
              <View style={styles.insightItem}>
                <Icon
                  name="check-circle"
                  type="material"
                  color={colors.success}
                  size={20}
                  containerStyle={styles.insightIcon}
                />
                <Text style={[styles.insightText, { color: colors.text }]}>
                  Great attendance rate! {report.attendanceStats.rate}% of paid registrants showed up.
                </Text>
              </View>
            )}
            
            {report.revenue.discountAmount > report.revenue.gross * 0.2 && (
              <View style={styles.insightItem}>
                <Icon
                  name="warning"
                  type="material"
                  color={colors.warning}
                  size={20}
                  containerStyle={styles.insightIcon}
                />
                <Text style={[styles.insightText, { color: colors.text }]}>
                  Consider reviewing discount strategy - discounts account for more than 20% of gross revenue.
                </Text>
              </View>
            )}
            
            {report.registrationStats.byStatus.pending > totalPaidRegistrations * 0.1 && (
              <View style={styles.insightItem}>
                <Icon
                  name="info"
                  type="material"
                  color={colors.primary}
                  size={20}
                  containerStyle={styles.insightIcon}
                />
                <Text style={[styles.insightText, { color: colors.text }]}>
                  {report.registrationStats.byStatus.pending} registrations are still pending payment.
                </Text>
              </View>
            )}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  card: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  statItem: {
    marginBottom: 12,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    textTransform: 'capitalize',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickStatBox: {
    width: '47%',
  },
  bigNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  table: {
    minWidth: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tableHeader: {
    paddingVertical: 12,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 13,
    minWidth: 100,
  },
  tableCellHeader: {
    fontWeight: '600',
    fontSize: 12,
  },
  tableCellRight: {
    textAlign: 'right',
  },
  performanceText: {
    fontSize: 11,
  },
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  revenueBox: {
    flex: 1,
    minWidth: '30%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  revenueAmount: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  revenueLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  discountImpact: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  discountIcon: {
    marginRight: 8,
  },
  discountText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  timelineNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  insightsList: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export { ReportVisualization };
export default ReportVisualization;