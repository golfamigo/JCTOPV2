import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ListItem, Badge, Text, Icon, Button } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '@/theme';
import ConfirmationDialog from './ConfirmationDialog';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'suspended' | 'deleted';
  createdAt: Date;
  role?: 'user' | 'organizer' | 'admin';
}

interface UserManagementTableProps {
  user: User;
  onAction: (userId: string, action: 'suspend' | 'activate' | 'delete') => Promise<void>;
}

export default function UserManagementTable({ user, onAction }: UserManagementTableProps) {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'delete' | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'suspended':
        return colors.warning;
      case 'deleted':
        return colors.danger;
      default:
        return colors.grey;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return colors.danger;
      case 'organizer':
        return colors.primary;
      default:
        return colors.grey;
    }
  };

  const handleConfirmAction = async () => {
    if (confirmAction) {
      await onAction(user.id, confirmAction);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <ListItem.Accordion
        content={
          <>
            <ListItem.Content style={styles.mainContent}>
              <View style={styles.userInfo}>
                <ListItem.Title style={styles.name}>{user.name}</ListItem.Title>
                <ListItem.Subtitle style={styles.email}>{user.email}</ListItem.Subtitle>
              </View>
              <View style={styles.badges}>
                <Badge
                  value={t(`admin.userManagement.status.${user.status}`)}
                  badgeStyle={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}
                  textStyle={styles.badgeText}
                />
                {user.role && user.role !== 'user' && (
                  <Badge
                    value={user.role.toUpperCase()}
                    badgeStyle={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) }]}
                    textStyle={styles.badgeText}
                  />
                )}
              </View>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded}
        onPress={() => setExpanded(!expanded)}
        bottomDivider
      >
        <View style={styles.expandedContent}>
          <View style={styles.detailsSection}>
            <Text style={styles.detailLabel}>{t('common.phone')}:</Text>
            <Text style={styles.detailValue}>{user.phone || t('common.notProvided')}</Text>
          </View>
          <View style={styles.detailsSection}>
            <Text style={styles.detailLabel}>{t('profile.memberSince')}:</Text>
            <Text style={styles.detailValue}>
              {new Date(user.createdAt).toLocaleDateString('zh-TW')}
            </Text>
          </View>
          <View style={styles.actionsContainer}>
            {user.status === 'active' && (
              <Button
                title={t('admin.userManagement.actions.suspend')}
                onPress={() => setConfirmAction('suspend')}
                type="outline"
                size="sm"
                buttonStyle={[styles.actionButton, { borderColor: colors.warning }]}
                titleStyle={{ color: colors.warning }}
                icon={
                  <Icon
                    name="account-cancel"
                    type="material-community"
                    size={16}
                    color={colors.warning}
                    style={{ marginRight: 4 }}
                  />
                }
              />
            )}
            {user.status === 'suspended' && (
              <Button
                title={t('admin.userManagement.actions.activate')}
                onPress={() => onAction(user.id, 'activate')}
                type="outline"
                size="sm"
                buttonStyle={[styles.actionButton, { borderColor: colors.success }]}
                titleStyle={{ color: colors.success }}
                icon={
                  <Icon
                    name="account-check"
                    type="material-community"
                    size={16}
                    color={colors.success}
                    style={{ marginRight: 4 }}
                  />
                }
              />
            )}
            {user.status !== 'deleted' && (
              <Button
                title={t('admin.userManagement.actions.delete')}
                onPress={() => setConfirmAction('delete')}
                type="outline"
                size="sm"
                buttonStyle={[styles.actionButton, { borderColor: colors.danger }]}
                titleStyle={{ color: colors.danger }}
                icon={
                  <Icon
                    name="account-remove"
                    type="material-community"
                    size={16}
                    color={colors.danger}
                    style={{ marginRight: 4 }}
                  />
                }
              />
            )}
            <Button
              title={t('admin.userManagement.actions.viewDetails')}
              onPress={() => console.log('View details:', user.id)}
              type="clear"
              size="sm"
              titleStyle={{ color: colors.primary }}
              icon={
                <Icon
                  name="information"
                  type="material-community"
                  size={16}
                  color={colors.primary}
                  style={{ marginRight: 4 }}
                />
              }
            />
          </View>
        </View>
      </ListItem.Accordion>

      {confirmAction && (
        <ConfirmationDialog
          visible={!!confirmAction}
          title={t(`admin.confirmations.${confirmAction}Title`)}
          message={t(`admin.confirmations.${confirmAction}User`)}
          confirmText={t('admin.confirmations.confirm')}
          cancelText={t('admin.confirmations.cancel')}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
  },
  email: {
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandedContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  detailsSection: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '500',
    color: '#666',
    minWidth: 100,
  },
  detailValue: {
    flex: 1,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});