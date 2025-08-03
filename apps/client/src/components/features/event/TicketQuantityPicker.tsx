import React, { useState, useEffect } from 'react';
import {
  HStack,
  IconButton,
  Text,
  Input,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { MinusIcon, AddIcon } from '@chakra-ui/icons';

interface TicketQuantityPickerProps {
  value: number;
  min?: number;
  max: number;
  onChange: (quantity: number) => void;
  isDisabled?: boolean;
  'aria-label'?: string;
}

const TicketQuantityPicker: React.FC<TicketQuantityPickerProps> = ({
  value,
  min = 0,
  max,
  onChange,
  isDisabled = false,
  'aria-label': ariaLabel,
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  // Design system colors following branding guide
  const primaryColor = '#2563EB';
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const neutralMedium = '#64748B';
  const errorColor = '#EF4444';

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = () => {
    if (value < max && !isDisabled) {
      onChange(value + 1);
    }
  };

  const handleDecrement = () => {
    if (value > min && !isDisabled) {
      onChange(value - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Parse and validate the input
    const numValue = parseInt(newValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);
    }
  };

  const handleInputBlur = () => {
    // Reset to current valid value if input is invalid
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min || numValue > max) {
      setInputValue(value.toString());
    }
  };

  const isDecrementDisabled = value <= min || isDisabled;
  const isIncrementDisabled = value >= max || isDisabled;

  return (
    <HStack spacing={2} role="group" aria-label={ariaLabel || "Quantity selector"}>
      <Tooltip label={isDecrementDisabled ? (value <= min ? "Minimum quantity reached" : "Unavailable") : "Decrease quantity"}>
        <IconButton
          aria-label="Decrease quantity"
          icon={<MinusIcon />}
          size="sm"
          variant="outline"
          onClick={handleDecrement}
          isDisabled={isDecrementDisabled}
          borderColor={borderColor}
          color={isDecrementDisabled ? neutralMedium : primaryColor}
          _hover={{
            borderColor: primaryColor,
            backgroundColor: isDecrementDisabled ? 'transparent' : `${primaryColor}10`,
          }}
          _focus={{
            boxShadow: `0 0 0 2px ${primaryColor}40`,
          }}
        />
      </Tooltip>

      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        size="sm"
        width="60px"
        textAlign="center"
        borderColor={borderColor}
        isDisabled={isDisabled}
        aria-label="Ticket quantity"
        min={min}
        max={max}
        type="number"
        _focus={{
          borderColor: primaryColor,
          boxShadow: `0 0 0 1px ${primaryColor}`,
        }}
        _invalid={{
          borderColor: errorColor,
        }}
      />

      <Tooltip label={isIncrementDisabled ? (value >= max ? "Maximum quantity reached" : "Unavailable") : "Increase quantity"}>
        <IconButton
          aria-label="Increase quantity"
          icon={<AddIcon />}
          size="sm"
          variant="outline"
          onClick={handleIncrement}
          isDisabled={isIncrementDisabled}
          borderColor={borderColor}
          color={isIncrementDisabled ? neutralMedium : primaryColor}
          _hover={{
            borderColor: primaryColor,
            backgroundColor: isIncrementDisabled ? 'transparent' : `${primaryColor}10`,
          }}
          _focus={{
            boxShadow: `0 0 0 2px ${primaryColor}40`,
          }}
        />
      </Tooltip>

      {max <= 0 && (
        <Text fontSize="sm" color={errorColor} ml={2}>
          Sold Out
        </Text>
      )}
    </HStack>
  );
};

export default TicketQuantityPicker;