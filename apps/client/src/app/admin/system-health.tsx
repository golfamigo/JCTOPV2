import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { 
  Text, 
  Button,
  Card,
  Skeleton,
  Icon,
} from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import { adminService } from '@/services/adminService';
import SystemHealthIndicator from '@/components/features/admin/SystemHealthIndicator';

interface SystemHealth {
  api: {
    status: 'healthy' | 'warning' | 'critical';
    responseTime: number;
  };
  database: {
    status: 'healthy' | 'warning' | 'critical';
    connections: number;
    maxConnections: number;
  };
  server: {
    status: 'healthy' | 'warning' | 'critical';
    cpuUsage: number;
    memoryUsage: number;
  };
  lastChecked: Date;
}

const POLLING_INTERVAL = 30000; // 30 seconds

export default function SystemHealth() {
  const { t } = useTranslation();
  const { colors, spacing } = useAppTheme();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout>();

  const loadSystemHealth = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const healthData = await adminService.getSystemHealth();
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSystemHealth();

    // Start polling
    pollingRef.current = setInterval(() => {
      loadSystemHealth();
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const onRefresh = useCallback(() => {
    loadSystemHealth(true);
  }, [loadSystemHealth]);

  const getOverallStatus = (): 'healthy' | 'warning' | 'critical' => {
    if (!health) return 'healthy';
    
    const statuses = [health.api.status, health.database.status, health.server.status];
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'critical':
        return colors.danger;
    }
  };

  if (loading && !health) {
    return (
      <ScrollView style={styles.container}>
        <View style={[styles.content, { padding: spacing.md }]}>
          <Skeleton animation="pulse" height={40} style={{ marginBottom: spacing.md }} />
          {[1, 2, 3].map((item) => (
            <Card key={item} containerStyle={styles.card}>
              <Skeleton animation="pulse" height={80} />
            </Card>
          ))}
        </View>
      </ScrollView>
    );
  }

  const overallStatus = getOverallStatus();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={[styles.content, { padding: spacing.md }]}>
        <Text h3 style={styles.title}>{t('admin.systemHealth')}</Text>

        <Card containerStyle={[styles.overallCard, { borderLeftColor: getStatusColor(overallStatus) }]}>
          <View style={styles.overallHeader}>
            <View style={styles.overallInfo}>
              <Text style={styles.overallTitle}>{t('admin.systemStatus.overallHealth')}</Text>
              <Text style={[styles.overallStatus, { color: getStatusColor(overallStatus) }]}>
                {t(`admin.systemStatus.status.${overallStatus}`)}
              </Text>
            </View>
            <Icon
              name={overallStatus === 'healthy' ? 'check-circle' : overallStatus === 'warning' ? 'alert-circle' : 'close-circle'}
              type="material-community"
              size={48}
              color={getStatusColor(overallStatus)}
            />
          </View>
          <View style={styles.lastCheckedContainer}>
            <Icon name="clock-outline" type="material-community" size={14} color={colors.grey3} />
            <Text style={styles.lastChecked}>
              {t('admin.systemStatus.lastChecked')}: {health ? new Date(health.lastChecked).toLocaleTimeString('zh-TW') : ''}
            </Text>
          </View>
        </Card>

        <Card containerStyle={styles.card}>
          <Card.Title>{t('admin.systemStatus.services')}</Card.Title>
          <Card.Divider />
          
          <SystemHealthIndicator
            title={t('admin.systemStatus.api')}
            status={health?.api.status || 'healthy'}
            metric={{
              value: health?.api.responseTime || 0,
              unit: 'ms',
            }}
            details={`Response time: ${health?.api.responseTime || 0}ms`}
            icon="api"
          />

          <SystemHealthIndicator
            title={t('admin.systemStatus.database')}
            status={health?.database.status || 'healthy'}
            metric={{
              value: health?.database.connections || 0,
              max: health?.database.maxConnections || 100,
              unit: '',
            }}
            details={`Connections: ${health?.database.connections || 0}/${health?.database.maxConnections || 100}`}
            icon="database"
          />

          <SystemHealthIndicator
            title={t('admin.systemStatus.server')}
            status={health?.server.status || 'healthy'}
            metric={{
              value: health?.server.cpuUsage || 0,
              max: 100,
              unit: '%',
            }}
            details={`CPU: ${health?.server.cpuUsage || 0}% | Memory: ${health?.server.memoryUsage || 0}%`}
            icon="server"
          />
        </Card>

        <View style={styles.actionContainer}>
          <Button
            title={t('admin.systemStatus.refresh')}
            onPress={() => loadSystemHealth(true)}
            icon={
              <Icon
                name="refresh"
                type="material-community"
                size={20}
                color={colors.white}
                style={{ marginRight: 8 }}
              />
            }
            buttonStyle={styles.refreshButton}
          />
          <Text style={styles.pollingText}>
            {t('admin.systemStatus.autoRefresh')}: 30s
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 16,
  },
  overallCard: {
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overallInfo: {
    flex: 1,
  },
  overallTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  overallStatus: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  lastCheckedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastChecked: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
  },
  actionContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  pollingText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
});