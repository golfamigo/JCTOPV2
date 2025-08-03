import React, { useState } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  VStack,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';

interface AttendeeSearchFormProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  onClear: () => void;
}

export const AttendeeSearchForm: React.FC<AttendeeSearchFormProps> = ({
  onSearch,
  isSearching,
  onClear,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const borderColor = useColorModeValue('neutral.200', 'neutral.600');
  const inputBgColor = useColorModeValue('white', 'neutral.800');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClear();
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w="100%">
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel color="neutral.700" fontSize="sm" fontWeight="medium">
            Search for Attendee
          </FormLabel>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="neutral.400" />
            </InputLeftElement>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter name or registration number"
              borderColor={borderColor}
              bg={inputBgColor}
              _focus={{
                borderColor: 'primary.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
              }}
              disabled={isSearching}
            />
            {searchQuery && (
              <InputRightElement>
                <IconButton
                  aria-label="Clear search"
                  icon={<CloseIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                  isDisabled={isSearching}
                />
              </InputRightElement>
            )}
          </InputGroup>
        </FormControl>
        
        <HStack spacing={3}>
          <Button
            type="submit"
            colorScheme="primary"
            leftIcon={<SearchIcon />}
            isLoading={isSearching}
            loadingText="Searching..."
            isDisabled={!searchQuery.trim()}
            size="md"
            flex={1}
          >
            Search
          </Button>
        </HStack>
        
        <Text fontSize="xs" color="neutral.500" textAlign="center">
          Search by attendee name or registration ID
        </Text>
      </VStack>
    </Box>
  );
};