import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Overlay, Button, Text, Icon } from '@rneui/themed';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@rneui/themed';
import { ExportProgressBar } from '../../atoms/ExportProgressBar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type ExportStage = 'preparing' | 'generating' | 'downloading' | 'complete';

interface ExportProgressModalProps {
  visible: boolean;
  progress: number; // 0-100
  stage: ExportStage;
  estimatedTimeRemaining?: number; // in seconds
  onCancel?: () => void;
  indeterminate?: boolean;
  fileName?: string;
}

const STAGE_ICONS: Record<ExportStage, string> = {
  preparing: 'database-search',
  generating: 'file-document-edit',
  downloading: 'download',
  complete: 'check-circle',
};

const STAGE_PROGRESS_RANGES: Record<ExportStage, [number, number]> = {
  preparing: [0, 30],
  generating: [30, 70],
  downloading: [70, 100],
  complete: [100, 100],
};

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  visible,
  progress,
  stage,
  estimatedTimeRemaining,
  onCancel,
  indeterminate = false,
  fileName,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [displayProgress, setDisplayProgress] = useState(progress);

  useEffect(() => {
    if (!indeterminate) {
      // Smooth progress animation
      const diff = progress - displayProgress;
      if (Math.abs(diff) > 0.1) {
        const timer = setTimeout(() => {
          setDisplayProgress(prev => prev + diff * 0.1);
        }, 50);
        return () => clearTimeout(timer);
      } else {
        setDisplayProgress(progress);
      }
    }
  }, [progress, displayProgress, indeterminate]);

  const handleCancel = useCallback(() => {
    Alert.alert(
      t('organizer.export.progress.cancelTitle', '取消匯出'),
      t('organizer.export.progress.cancelMessage', '確定要取消匯出嗎？'),
      [
        {
          text: t('common.no', '否'),
          style: 'cancel',
        },
        {
          text: t('common.yes', '是'),
          style: 'destructive',
          onPress: onCancel,
        },
      ]
    );
  }, [onCancel, t]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return t('organizer.export.progress.seconds', '{{count}} 秒', { count: Math.round(seconds) });
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return t('organizer.export.progress.minutes', '{{count}} 分鐘', { count: minutes });
    }
    return t('organizer.export.progress.minutesSeconds', '{{minutes}} 分 {{seconds}} 秒', {
      minutes,
      seconds: Math.round(remainingSeconds),
    });
  };

  const getStageProgress = (): number => {
    if (indeterminate) return 0;
    
    const [min, max] = STAGE_PROGRESS_RANGES[stage];
    const stageRange = max - min;
    const stageProgress = (displayProgress - min) / stageRange * 100;
    return Math.max(0, Math.min(100, stageProgress));
  };

  return (
    <Overlay
      isVisible={visible}
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
          {t('organizer.export.progress.title')}
        </Text>

        <View style={[styles.stageContainer, { marginBottom: theme.spacing.lg }]}>
          <Icon
            name={STAGE_ICONS[stage]}
            type="material-community"
            size={48}
            color={theme.colors.primary}
          />
          <Text style={[styles.stageText, { color: theme.colors.black, marginTop: theme.spacing.sm }]}>
            {t(`organizer.export.progress.${stage}`)}
          </Text>
        </View>

        <View style={{ marginBottom: theme.spacing.lg }}>
          <ExportProgressBar
            progress={indeterminate ? 0 : displayProgress}
            indeterminate={indeterminate}
            showPercentage={!indeterminate}
          />
          
          {!indeterminate && (
            <View style={[styles.stageIndicators, { marginTop: theme.spacing.md }]}>
              {(['preparing', 'generating', 'downloading'] as ExportStage[]).map((s, index) => (
                <View key={s} style={styles.stageIndicator}>
                  <Icon
                    name={
                      displayProgress >= STAGE_PROGRESS_RANGES[s][1]
                        ? 'check-circle'
                        : stage === s
                        ? 'circle-slice-8'
                        : 'circle-outline'
                    }
                    type="material-community"
                    size={20}
                    color={
                      displayProgress >= STAGE_PROGRESS_RANGES[s][0]
                        ? theme.colors.primary
                        : theme.colors.grey3
                    }
                  />
                  <Text
                    style={[
                      styles.stageIndicatorText,
                      {
                        color:
                          displayProgress >= STAGE_PROGRESS_RANGES[s][0]
                            ? theme.colors.black
                            : theme.colors.grey3,
                      },
                    ]}
                  >
                    {t(`organizer.export.progress.${s}Short`, s)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {fileName && (
          <View style={[styles.fileNameContainer, { marginBottom: theme.spacing.md }]}>
            <Icon
              name="file-document"
              type="material-community"
              size={16}
              color={theme.colors.grey3}
            />
            <Text style={[styles.fileName, { color: theme.colors.grey3 }]} numberOfLines={1}>
              {fileName}
            </Text>
          </View>
        )}

        {estimatedTimeRemaining !== undefined && estimatedTimeRemaining > 0 && (
          <Text style={[styles.estimatedTime, { color: theme.colors.grey3, marginBottom: theme.spacing.md }]}>
            {t('organizer.export.progress.estimatedTime').replace('{{time}}', formatTime(estimatedTimeRemaining))}
          </Text>
        )}

        {onCancel && stage !== 'complete' && (
          <Button
            title={t('organizer.export.progress.cancel')}
            type="outline"
            onPress={handleCancel}
            buttonStyle={{
              borderColor: theme.colors.grey3,
            }}
            titleStyle={{
              color: theme.colors.grey3,
            }}
          />
        )}

        {stage === 'complete' && (
          <Text style={[styles.completeMessage, { color: theme.colors.success }]}>
            {t('organizer.export.progress.completeMessage', '匯出完成！')}
          </Text>
        )}
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  stageContainer: {
    alignItems: 'center',
  },
  stageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stageIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stageIndicator: {
    alignItems: 'center',
    flex: 1,
  },
  stageIndicatorText: {
    fontSize: 10,
    marginTop: 4,
  },
  fileNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 12,
    marginLeft: 4,
    flex: 1,
  },
  estimatedTime: {
    fontSize: 14,
    textAlign: 'center',
  },
  completeMessage: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});