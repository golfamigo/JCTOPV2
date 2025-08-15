import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import {
  Text,
  Input,
  Button,
  Card,
  Avatar,
  Badge,
  Divider,
} from '@rneui/themed';
import { useAuthStore } from '../../../stores/authStore';
import { useAppTheme } from '@/theme';
import { useTranslation } from '../../../localization';
import { LoadingOverlay, FullScreenLoading } from '../../organisms/LoadingOverlay';
import { ErrorCard } from '../../molecules/ErrorCard';
import { useNetworkStatus } from '../../../utils/networkStatus';

interface UpdateProfileData {
  name?: string;
  phone?: string;
}

// Validation constants for better maintainability
const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PHONE_REGEX: /^\+?[\d\s\-\(\)]{8,20}$/,
} as const;

// UI constants
const UI_CONSTANTS = {
  AVATAR_SIZE: 80,
  MIN_BUTTON_WIDTH: 80,
  SHADOW_ELEVATION: 3,
  OPACITY_SUFFIX: '20', // For transparent backgrounds
} as const;

const ProfilePage = () => {
  const { user, getProfile, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Partial<UpdateProfileData>>({});
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const { colors, spacing, typography } = useAppTheme();
  const { t } = useTranslation();
  const networkStatus = useNetworkStatus();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsFetching(true);
        try {
          await getProfile();
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        } finally {
          setIsFetching(false);
        }
      }
    };

    fetchProfile();
  }, [user, getProfile]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UpdateProfileData> = {};
    const trimmedName = name?.trim() || '';
    const trimmedPhone = phone?.trim() || '';

    // Name validation
    if (trimmedName.length > 0) {
      if (trimmedName.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
        newErrors.name = t('validation.minLength', { count: VALIDATION_RULES.NAME_MIN_LENGTH });
      } else if (trimmedName.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
        newErrors.name = t('validation.maxLength', { count: VALIDATION_RULES.NAME_MAX_LENGTH });
      }
    }

    // Phone validation
    if (trimmedPhone.length > 0 && !VALIDATION_RULES.PHONE_REGEX.test(trimmedPhone)) {
      newErrors.phone = t('validation.invalidPhoneNumber');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setErrors({});
    setUpdateError(null);
    setUpdateSuccess(null);
    // Reset form to current user data
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!networkStatus.isConnected) {
      setUpdateError(t('errors.offline'));
      return;
    }

    setIsLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const updateData: UpdateProfileData = {};
      const trimmedName = name?.trim() || '';
      const trimmedPhone = phone?.trim() || '';
      
      // Only include changed fields in update
      if (trimmedName !== (user?.name || '')) {
        updateData.name = trimmedName || undefined;
      }
      
      if (trimmedPhone !== (user?.phone || '')) {
        updateData.phone = trimmedPhone || undefined;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setUpdateSuccess(t('profile.profileUpdated'));
        setIsEditing(false);
      } else {
        // No changes detected, just exit edit mode
        setIsEditing(false);
      }
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : t('messages.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
    },
    scrollContent: {
      paddingVertical: spacing.lg,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      marginHorizontal: 0,
      borderRadius: spacing.sm,
      elevation: UI_CONSTANTS.SHADOW_ELEVATION,
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
      flexWrap: 'wrap',
    },
    title: {
      ...typography.h1,
      marginBottom: spacing.xs,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    formField: {
      marginBottom: spacing.md,
    },
    fieldLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    readOnlyField: {
      backgroundColor: colors.lightGrey,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 48,
      justifyContent: 'center',
    },
    readOnlyText: {
      ...typography.body,
      color: colors.text,
    },
    emailContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    emailField: {
      flex: 1,
    },
    sectionTitle: {
      ...typography.h2,
      fontSize: 18,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    infoLabel: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
    },
    infoValue: {
      ...typography.body,
      color: colors.text,
      fontWeight: '500',
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: spacing.lg,
      gap: spacing.md,
    },
    button: {
      flex: 1,
      borderRadius: spacing.sm,
    },
    alertCard: {
      marginBottom: spacing.md,
    },
    alertTitle: {
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
  });

  if (isFetching) {
    return <FullScreenLoading visible={true} />;
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ErrorCard
          message={t('messages.somethingWentWrong')}
          errorType="generic"
          containerStyle={{ width: '90%' }}
        />
      </View>
    );
  }

  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Card containerStyle={styles.card}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.profile')}</Text>
          {!isEditing && (
            <Button
              title={t('common.edit')}
              onPress={handleEdit}
              type="outline"
              buttonStyle={[styles.button, { flex: 0, minWidth: UI_CONSTANTS.MIN_BUTTON_WIDTH }]}
            />
          )}
        </View>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Avatar
            size={UI_CONSTANTS.AVATAR_SIZE}
            rounded
            title={user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            containerStyle={{ backgroundColor: colors.primary }}
          />
        </View>

        {/* Success Alert */}
        {updateSuccess && (
          <Card containerStyle={[styles.alertCard, { backgroundColor: colors.success + UI_CONSTANTS.OPACITY_SUFFIX, borderColor: colors.success }]}>
            <Text style={[styles.alertTitle, { color: colors.success }]}>{t('common.success')}</Text>
            <Text style={{ color: colors.success }}>{updateSuccess}</Text>
          </Card>
        )}

        {/* Error Alert */}
        {updateError && (
          <ErrorCard
            message={updateError}
            errorType={!networkStatus.isConnected ? 'network' : 'generic'}
            onDismiss={() => setUpdateError(null)}
            containerStyle={{ marginBottom: spacing.md }}
          />
        )}

        {/* Name Field */}
        <View style={styles.formField}>
          <Input
            label={t('auth.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('auth.enterName')}
            disabled={!isEditing}
            errorMessage={errors.name}
            renderErrorMessage={!!errors.name}
            inputStyle={!isEditing ? { color: colors.textSecondary } : undefined}
            inputContainerStyle={!isEditing ? { backgroundColor: colors.lightGrey } : undefined}
          />
        </View>

        {/* Email Field (Read-only) */}
        <View style={styles.formField}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
            {t('auth.email')}
          </Text>
          <View style={styles.emailContainer}>
            <View style={[styles.readOnlyField, styles.emailField]}>
              <Text style={styles.readOnlyText}>{user.email}</Text>
            </View>
            <Badge
              value={t('profile.cannotBeChanged') || 'Cannot be changed'}
              status="primary"
              badgeStyle={{ backgroundColor: colors.midGrey }}
            />
          </View>
        </View>

        {/* Phone Field */}
        <View style={styles.formField}>
          <Input
            label={t('auth.phone')}
            value={phone}
            onChangeText={setPhone}
            placeholder={phone || t('profile.notProvided') || 'Not provided'}
            disabled={!isEditing}
            errorMessage={errors.phone}
            renderErrorMessage={!!errors.phone}
            inputStyle={!isEditing ? { color: colors.textSecondary } : undefined}
            inputContainerStyle={!isEditing ? { backgroundColor: colors.lightGrey } : undefined}
          />
        </View>

        <Divider style={{ marginVertical: spacing.lg }} />

        {/* Account Information */}
        <Text style={styles.sectionTitle}>{t('profile.accountInformation') || 'Account Information'}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('profile.authProvider') || 'Authentication Provider'}:</Text>
          <Badge
            value={user.authProvider}
            status="primary"
            badgeStyle={{ backgroundColor: colors.primary }}
          />
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('profile.memberSince') || 'Member Since'}:</Text>
          <Text style={styles.infoValue}>{formatDate(user.createdAt)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('profile.lastUpdated') || 'Last Updated'}:</Text>
          <Text style={styles.infoValue}>{formatDate(user.updatedAt)}</Text>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.buttonContainer}>
            <Button
              title={t('common.cancel')}
              onPress={handleCancel}
              type="outline"
              buttonStyle={styles.button}
            />
            <Button
              title={t('common.save')}
              onPress={handleSave}
              loading={isLoading}
              buttonStyle={[styles.button, { backgroundColor: colors.primary }]}
            />
          </View>
        )}
      </Card>
    </ScrollView>
    <LoadingOverlay
      visible={isLoading}
      message={t('loading.updating')}
      variant="spinner"
    />
    </>
  );
};

export default ProfilePage;