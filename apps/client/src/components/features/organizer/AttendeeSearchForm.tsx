import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Text, Icon } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../../theme';

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
  const { colors } = useAppTheme();

  const handleSubmit = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    onClear();
  };

  return (
    <View style={styles.container}>
      <View style={styles.formControl}>
        <Text style={[styles.label, { color: colors.grey1 }]}>
          Search for Attendee
        </Text>
        
        <View style={[styles.inputGroup, { 
          backgroundColor: colors.card,
          borderColor: colors.grey4
        }]}>
          <Icon
            name="search"
            type="material"
            color={colors.grey3}
            size={24}
            containerStyle={styles.searchIcon}
          />
          
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Enter name or registration number"
            placeholderTextColor={colors.grey3}
            style={[styles.input, { color: colors.text }]}
            editable={!isSearching}
            onSubmitEditing={handleSubmit}
          />
          
          {searchQuery ? (
            <Icon
              name="close"
              type="material"
              color={colors.grey3}
              size={20}
              onPress={handleClear}
              disabled={isSearching}
              containerStyle={styles.clearIcon}
            />
          ) : null}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Search"
          onPress={handleSubmit}
          loading={isSearching}
          loadingProps={{ color: colors.white }}
          disabled={!searchQuery.trim() || isSearching}
          buttonStyle={[styles.searchButton, { backgroundColor: colors.primary }]}
          titleStyle={styles.buttonTitle}
          icon={
            !isSearching ? (
              <Icon
                name="search"
                type="material"
                color={colors.white}
                size={20}
                containerStyle={styles.buttonIcon}
              />
            ) : undefined
          }
        />
      </View>
      
      <Text style={[styles.helpText, { color: colors.grey2 }]}>
        Search by attendee name or registration ID
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  formControl: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  clearIcon: {
    padding: 4,
  },
  buttonContainer: {
    marginBottom: 12,
  },
  searchButton: {
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
  },
});