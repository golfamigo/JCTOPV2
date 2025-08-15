import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Overlay, ListItem, SearchBar } from '@rneui/themed';
import { useAppTheme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SharedSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  fullWidth?: boolean;
}

export const SharedSelect: React.FC<SharedSelectProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
  disabled = false,
  searchable = false,
  fullWidth = true
}) => {
  const { colors, typography } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(opt => opt.value === value);
  
  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (option: SelectOption) => {
    if (!option.disabled) {
      onChange?.(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <View style={{ ...(fullWidth && { width: '100%' }) }}>
      {label && (
        <Text style={[
          typography.body,
          { 
            color: colors.text, 
            fontWeight: '600', 
            marginBottom: 8,
            fontSize: 14
          }
        ]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={{
          borderWidth: 1,
          borderColor: error ? colors.error : colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: disabled ? colors.surface : colors.white,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Text style={[
          typography.body,
          {
            color: selectedOption ? colors.text : colors.textSecondary,
            flex: 1
          }
        ]}>
          {selectedOption?.label || placeholder}
        </Text>
        <MaterialIcons
          name={isOpen ? 'arrow-drop-up' : 'arrow-drop-down'}
          size={24}
          color={colors.midGrey}
        />
      </TouchableOpacity>

      {error && (
        <Text style={{
          color: colors.error,
          fontSize: 12,
          marginTop: 4
        }}>
          {error}
        </Text>
      )}

      <Overlay
        isVisible={isOpen}
        onBackdropPress={() => {
          setIsOpen(false);
          setSearchQuery('');
        }}
        overlayStyle={{
          backgroundColor: colors.white,
          borderRadius: 12,
          padding: 0,
          width: '90%',
          maxHeight: '70%'
        }}
      >
        <View>
          {searchable && (
            <SearchBar
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              platform="default"
              containerStyle={{
                backgroundColor: colors.white,
                borderTopWidth: 0,
                borderBottomWidth: 1,
                borderBottomColor: colors.border
              }}
              inputContainerStyle={{
                backgroundColor: colors.surface
              }}
            />
          )}
          
          <ScrollView style={{ maxHeight: 400 }}>
            {filteredOptions.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={[typography.body, { color: colors.textSecondary }]}>
                  No options found
                </Text>
              </View>
            ) : (
              filteredOptions.map((option, index) => (
                <ListItem
                  key={option.value}
                  onPress={() => handleSelect(option)}
                  disabled={option.disabled}
                  bottomDivider={index < filteredOptions.length - 1}
                  containerStyle={{
                    opacity: option.disabled ? 0.5 : 1
                  }}
                >
                  <ListItem.Content>
                    <ListItem.Title style={[
                      typography.body,
                      {
                        color: option.value === value ? colors.primary : colors.text,
                        fontWeight: option.value === value ? '600' : '400'
                      }
                    ]}>
                      {option.label}
                    </ListItem.Title>
                  </ListItem.Content>
                  {option.value === value && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </ListItem>
              ))
            )}
          </ScrollView>
        </View>
      </Overlay>
    </View>
  );
};