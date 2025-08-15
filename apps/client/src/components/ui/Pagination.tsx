import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme';
import { useSpacing } from '../../hooks/useSpacing';
import { SharedSelect } from '../shared/SharedForm/SharedSelect';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 50],
}) => {
  const { colors, typography } = useAppTheme();
  const spacing = useSpacing();

  // Calculate the range of items being displayed
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Show at most 7 page buttons

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('...');
        for (let i = totalPages - 4; i < totalPages; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else {
        // In the middle
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const PageButton: React.FC<{ 
    page: number | string; 
    isActive?: boolean;
    onPress?: () => void;
  }> = ({ page, isActive, onPress }) => {
    if (page === '...') {
      return (
        <View style={{ 
          ...spacing.padding(undefined, 'xs', 'sm'),
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            ...
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isActive || isLoading}
        style={{
          backgroundColor: isActive ? colors.primary : 'transparent',
          borderWidth: 1,
          borderColor: isActive ? colors.primary : colors.border,
          borderRadius: 6,
          ...spacing.padding(undefined, 'xs', 'sm'),
          minWidth: 36,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isLoading ? 0.5 : 1,
        }}
      >
        <Text style={[
          typography.body,
          { 
            color: isActive ? colors.white : colors.text,
            fontWeight: isActive ? '600' : '400'
          }
        ]}>
          {page}
        </Text>
      </TouchableOpacity>
    );
  };

  const pageSizeSelectOptions = pageSizeOptions.map(size => ({
    label: `${size} per page`,
    value: size
  }));

  return (
    <View style={{
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...spacing.padding('md'),
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.md
    }}>
      {/* Items info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={[typography.small, { color: colors.textSecondary }]}>
          Showing {startItem}-{endItem} of {totalItems} items
        </Text>
        
        {showPageSizeSelector && onItemsPerPageChange && Platform.OS === 'web' && (
          <View style={{ width: 150 }}>
            <SharedSelect
              value={itemsPerPage}
              options={pageSizeSelectOptions}
              onChange={(value) => onItemsPerPageChange(Number(value))}
              placeholder="Items per page"
            />
          </View>
        )}
      </View>

      {/* Pagination controls */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center',
        gap: spacing.xs
      }}>
        {/* Previous button */}
        <TouchableOpacity
          onPress={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          style={{
            opacity: currentPage === 1 || isLoading ? 0.3 : 1,
            padding: spacing.xs
          }}
        >
          <MaterialIcons
            name="chevron-left"
            size={24}
            color={currentPage === 1 ? colors.disabled : colors.text}
          />
        </TouchableOpacity>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <PageButton
            key={`${page}-${index}`}
            page={page}
            isActive={page === currentPage}
            onPress={() => typeof page === 'number' && onPageChange(page)}
          />
        ))}

        {/* Next button */}
        <TouchableOpacity
          onPress={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          style={{
            opacity: currentPage === totalPages || isLoading ? 0.3 : 1,
            padding: spacing.xs
          }}
        >
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={currentPage === totalPages ? colors.disabled : colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* Mobile page size selector */}
      {showPageSizeSelector && onItemsPerPageChange && Platform.OS !== 'web' && (
        <View style={{ width: '100%' }}>
          <SharedSelect
            value={itemsPerPage}
            options={pageSizeSelectOptions}
            onChange={(value) => onItemsPerPageChange(Number(value))}
            placeholder="Items per page"
            fullWidth
          />
        </View>
      )}
    </View>
  );
};

export default Pagination;