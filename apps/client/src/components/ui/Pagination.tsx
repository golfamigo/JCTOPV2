import React from 'react';
import {
  Box,
  Button,
  HStack,
  Text,
  IconButton,
  Select,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

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
  // Design system colors following branding guide
  const borderColor = useColorModeValue('#E2E8F0', '#475569');
  const textColor = useColorModeValue('#0F172A', '#F8FAFC');
  const mutedTextColor = useColorModeValue('#64748B', '#94A3B8');
  const primaryColor = '#2563EB';

  // Calculate the range of items being displayed
  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // Show at most 7 page buttons

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination logic
      if (currentPage <= 4) {
        // Show first 5 pages, then ellipsis, then last page
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 3) {
        // Show first page, ellipsis, then last 5 pages
        pages.push(1);
        if (totalPages > 6) {
          pages.push('...');
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page, ellipsis, current page area, ellipsis, last page
        pages.push(1);
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    if (onItemsPerPageChange && !isLoading) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page or no items
  }

  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'stretch', md: 'center' }}
      justifyContent="space-between"
      gap={4}
      p={4}
      borderTop="1px solid"
      borderColor={borderColor}
      bg="transparent"
    >
      {/* Items info and page size selector */}
      <HStack spacing={4} flexWrap="wrap">
        <Text fontSize="sm" color={mutedTextColor} whiteSpace="nowrap">
          Showing {startItem} to {endItem} of {totalItems} results
        </Text>
        
        {showPageSizeSelector && onItemsPerPageChange && (
          <HStack spacing={2}>
            <Text fontSize="sm" color={mutedTextColor} whiteSpace="nowrap">
              Show:
            </Text>
            <Select
              size="sm"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              disabled={isLoading}
              width="auto"
              minWidth="70px"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </HStack>
        )}
      </HStack>

      {/* Pagination controls */}
      <HStack spacing={1}>
        {/* Previous button */}
        <IconButton
          icon={<ChevronLeftIcon />}
          size="sm"
          variant="ghost"
          isDisabled={currentPage === 1 || isLoading}
          onClick={() => handlePageChange(currentPage - 1)}
          aria-label="Previous page"
        />

        {/* Page numbers */}
        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <Text
                key={`ellipsis-${index}`}
                px={2}
                py={1}
                fontSize="sm"
                color={mutedTextColor}
              >
                ...
              </Text>
            );
          }

          const pageNumber = page as number;
          const isCurrentPage = pageNumber === currentPage;

          return (
            <Button
              key={pageNumber}
              size="sm"
              variant={isCurrentPage ? 'solid' : 'ghost'}
              colorScheme={isCurrentPage ? 'blue' : 'gray'}
              isDisabled={isLoading}
              onClick={() => handlePageChange(pageNumber)}
              minWidth="32px"
              aria-label={`Page ${pageNumber}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNumber}
            </Button>
          );
        })}

        {/* Next button */}
        <IconButton
          icon={<ChevronRightIcon />}
          size="sm"
          variant="ghost"
          isDisabled={currentPage === totalPages || isLoading}
          onClick={() => handlePageChange(currentPage + 1)}
          aria-label="Next page"
        />
      </HStack>
    </Box>
  );
};

export default Pagination;