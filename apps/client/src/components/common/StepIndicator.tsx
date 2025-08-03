import React from 'react';
import {
  Box,
  HStack,
  Circle,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';

interface Step {
  title: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
}) => {
  // Use actual colors from branding guide instead of theme tokens
  const primaryColor = '#2563EB';
  const neutralLight = '#F8FAFC';
  const neutralMedium = '#64748B';
  const neutralDark = '#0F172A';
  
  const completedColor = primaryColor;
  const currentColor = primaryColor;
  const incompleteColor = useColorModeValue(neutralMedium, '#94A3B8');
  const completedBg = primaryColor;
  const currentBg = useColorModeValue('white', neutralDark);
  const incompleteBg = useColorModeValue(neutralLight, '#334155');

  const getStepStatus = (index: number): 'completed' | 'current' | 'incomplete' => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'incomplete';
  };

  const getCircleSize = () => {
    switch (size) {
      case 'sm': return '24px';
      case 'lg': return '40px';
      default: return '32px';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm': return 'sm';
      case 'lg': return 'lg';
      default: return 'md';
    }
  };

  const renderStep = (step: Step, index: number) => {
    const status = getStepStatus(index);
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';
    
    return (
      <VStack
        key={index}
        spacing={2}
        align="center"
        opacity={status === 'incomplete' ? 0.6 : 1}
      >
        <Circle
          size={getCircleSize()}
          bg={isCompleted ? completedBg : isCurrent ? currentBg : incompleteBg}
          color={isCompleted ? 'white' : isCurrent ? currentColor : incompleteColor}
          borderWidth={isCurrent ? '2px' : '0'}
          borderColor={currentColor}
          aria-label={`Step ${index + 1}: ${step.title}`}
          role="img"
        >
          {isCompleted ? (
            <CheckIcon boxSize={size === 'sm' ? '12px' : size === 'lg' ? '20px' : '16px'} />
          ) : (
            <Text
              fontSize={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
              fontWeight="bold"
            >
              {index + 1}
            </Text>
          )}
        </Circle>
        
        <VStack spacing={1} align="center" maxW="120px">
          <Text
            fontSize={getTextSize()}
            fontWeight={isCurrent ? 'bold' : 'medium'}
            color={isCompleted || isCurrent ? currentColor : incompleteColor}
            textAlign="center"
            lineHeight="tight"
          >
            {step.title}
          </Text>
          {step.description && (
            <Text
              fontSize="xs"
              color={incompleteColor}
              textAlign="center"
              lineHeight="tight"
            >
              {step.description}
            </Text>
          )}
        </VStack>
      </VStack>
    );
  };

  const renderConnector = (index: number) => {
    if (index === steps.length - 1) return null;
    
    const isCompleted = index < currentStep;
    
    return (
      <Box
        key={`connector-${index}`}
        flex="1"
        height="2px"
        bg={isCompleted ? completedColor : incompleteColor}
        mx={2}
        borderRadius="full"
        aria-hidden="true"
      />
    );
  };

  if (orientation === 'vertical') {
    return (
      <VStack spacing={4} align="stretch">
        {steps.map((step, index) => (
          <HStack key={index} spacing={4} align="flex-start">
            {renderStep(step, index)}
            {index < steps.length - 1 && (
              <Box
                width="2px"
                height="40px"
                bg={index < currentStep ? completedColor : incompleteColor}
                ml={4}
                borderRadius="full"
                aria-hidden="true"
              />
            )}
          </HStack>
        ))}
      </VStack>
    );
  }

  return (
    <HStack
      spacing={0}
      align="center"
      width="full"
      justify="space-between"
      role="navigation"
      aria-label="Progress steps"
    >
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          {renderStep(step, index)}
          {renderConnector(index)}
        </React.Fragment>
      ))}
    </HStack>
  );
};

export default StepIndicator;