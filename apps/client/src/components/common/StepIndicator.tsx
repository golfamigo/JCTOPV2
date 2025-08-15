import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Icon } from '@rneui/themed';
import { useAppTheme } from '@/theme';

interface Step {
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  const { colors, spacing, typography } = useAppTheme();
  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;

  const getStepStatus = (index: number): 'completed' | 'current' | 'incomplete' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'incomplete';
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    stepContainer: {
      alignItems: 'center',
      flex: 1,
      maxWidth: isTablet ? 150 : 100,
    },
    circleContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    circleCompleted: {
      backgroundColor: colors.primary,
    },
    circleCurrent: {
      backgroundColor: colors.white,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    circleIncomplete: {
      backgroundColor: colors.lightGrey,
    },
    stepNumber: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    stepNumberCompleted: {
      color: colors.white,
    },
    stepNumberCurrent: {
      color: colors.primary,
    },
    stepNumberIncomplete: {
      color: colors.midGrey,
    },
    stepTitle: {
      fontSize: isTablet ? 14 : 12,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    stepTitleCompleted: {
      color: colors.primary,
      fontWeight: '600',
    },
    stepTitleCurrent: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    stepTitleIncomplete: {
      color: colors.midGrey,
    },
    stepDescription: {
      fontSize: 10,
      color: colors.midGrey,
      textAlign: 'center',
    },
    connector: {
      position: 'absolute',
      top: 16,
      height: 2,
      backgroundColor: colors.border,
    },
    connectorCompleted: {
      backgroundColor: colors.primary,
    },
    incompleteOpacity: {
      opacity: 0.6,
    },
  });

  const renderStep = (step: Step, index: number) => {
    const status = getStepStatus(index);
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';
    const isIncomplete = status === 'incomplete';

    return (
      <View 
        key={index} 
        style={[
          styles.stepContainer,
          isIncomplete && styles.incompleteOpacity,
        ]}
      >
        <View
          style={[
            styles.circleContainer,
            isCompleted && styles.circleCompleted,
            isCurrent && styles.circleCurrent,
            isIncomplete && styles.circleIncomplete,
          ]}
        >
          {isCompleted ? (
            <Icon
              name="check"
              type="material-community"
              size={16}
              color={colors.white}
            />
          ) : (
            <Text
              style={[
                styles.stepNumber,
                isCompleted && styles.stepNumberCompleted,
                isCurrent && styles.stepNumberCurrent,
                isIncomplete && styles.stepNumberIncomplete,
              ]}
            >
              {index + 1}
            </Text>
          )}
        </View>

        <Text
          style={[
            styles.stepTitle,
            isCompleted && styles.stepTitleCompleted,
            isCurrent && styles.stepTitleCurrent,
            isIncomplete && styles.stepTitleIncomplete,
          ]}
          numberOfLines={2}
        >
          {step.title}
        </Text>

        {step.description && (
          <Text style={styles.stepDescription} numberOfLines={2}>
            {step.description}
          </Text>
        )}
      </View>
    );
  };

  const renderConnector = (index: number) => {
    if (index === steps.length - 1) return null;

    const isCompleted = index < currentStep;
    const stepWidth = (windowWidth - spacing.md * 2) / steps.length;
    const connectorWidth = stepWidth - 32;

    return (
      <View
        key={`connector-${index}`}
        style={[
          styles.connector,
          {
            left: stepWidth * index + stepWidth / 2 + 16,
            width: connectorWidth,
          },
          isCompleted && styles.connectorCompleted,
        ]}
      />
    );
  };

  return (
    <View style={styles.container}>
      {steps.map((step, index) => renderStep(step, index))}
      {steps.map((_, index) => renderConnector(index))}
    </View>
  );
};

export default StepIndicator;