import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

// Helper function to render with ChakraProvider
const renderWithChakra = (component: React.ReactElement) => {
  return render(
    <ChakraProvider>
      {component}
    </ChakraProvider>
  );
};

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 50,
    itemsPerPage: 10,
    onPageChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render pagination controls correctly', () => {
    renderWithChakra(<Pagination {...defaultProps} />);

    expect(screen.getByText('Showing 1 to 10 of 50 results')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument();
  });

  it('should call onPageChange when page button is clicked', () => {
    const mockOnPageChange = jest.fn();
    renderWithChakra(
      <Pagination {...defaultProps} onPageChange={mockOnPageChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when next button is clicked', () => {
    const mockOnPageChange = jest.fn();
    renderWithChakra(
      <Pagination {...defaultProps} onPageChange={mockOnPageChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should call onPageChange when previous button is clicked', () => {
    const mockOnPageChange = jest.fn();
    renderWithChakra(
      <Pagination {...defaultProps} currentPage={3} onPageChange={mockOnPageChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    renderWithChakra(<Pagination {...defaultProps} currentPage={1} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    renderWithChakra(<Pagination {...defaultProps} currentPage={5} />);

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('should highlight current page', () => {
    renderWithChakra(<Pagination {...defaultProps} currentPage={3} />);

    const currentPageButton = screen.getByRole('button', { name: 'Page 3' });
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });

  it('should show correct item range for different pages', () => {
    renderWithChakra(<Pagination {...defaultProps} currentPage={3} />);

    expect(screen.getByText('Showing 21 to 30 of 50 results')).toBeInTheDocument();
  });

  it('should show correct item range for last page with partial items', () => {
    renderWithChakra(
      <Pagination
        {...defaultProps}
        currentPage={6}
        totalPages={6}
        totalItems={55}
      />
    );

    expect(screen.getByText('Showing 51 to 55 of 55 results')).toBeInTheDocument();
  });

  it('should render page size selector when showPageSizeSelector is true', () => {
    const mockOnItemsPerPageChange = jest.fn();
    renderWithChakra(
      <Pagination
        {...defaultProps}
        showPageSizeSelector={true}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    expect(screen.getByText('Show:')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('should call onItemsPerPageChange when page size is changed', () => {
    const mockOnItemsPerPageChange = jest.fn();
    renderWithChakra(
      <Pagination
        {...defaultProps}
        showPageSizeSelector={true}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    const select = screen.getByDisplayValue('10');
    fireEvent.change(select, { target: { value: '20' } });

    expect(mockOnItemsPerPageChange).toHaveBeenCalledWith(20);
  });

  it('should not render page size selector when showPageSizeSelector is false', () => {
    renderWithChakra(
      <Pagination
        {...defaultProps}
        showPageSizeSelector={false}
      />
    );

    expect(screen.queryByText('Show:')).not.toBeInTheDocument();
  });

  it('should disable all controls when isLoading is true', () => {
    renderWithChakra(
      <Pagination
        {...defaultProps}
        isLoading={true}
        showPageSizeSelector={true}
        onItemsPerPageChange={jest.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeDisabled();
    expect(screen.getByDisplayValue('10')).toBeDisabled();
  });

  it('should show ellipsis for large number of pages', () => {
    renderWithChakra(
      <Pagination
        {...defaultProps}
        currentPage={5}
        totalPages={20}
        totalItems={200}
      />
    );

    expect(screen.getAllByText('...')).toHaveLength(2);
  });

  it('should not render pagination when totalPages is 1', () => {
    renderWithChakra(
      <Pagination
        {...defaultProps}
        totalPages={1}
        totalItems={5}
      />
    );

    expect(screen.queryByRole('button', { name: 'Previous page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
  });

  it('should not render pagination when totalPages is 0', () => {
    renderWithChakra(
      <Pagination
        {...defaultProps}
        totalPages={0}
        totalItems={0}
      />
    );

    expect(screen.queryByRole('button', { name: 'Previous page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next page' })).not.toBeInTheDocument();
  });

  it('should use custom page size options', () => {
    const mockOnItemsPerPageChange = jest.fn();
    renderWithChakra(
      <Pagination
        {...defaultProps}
        showPageSizeSelector={true}
        onItemsPerPageChange={mockOnItemsPerPageChange}
        pageSizeOptions={[5, 15, 25]}
        itemsPerPage={15}
      />
    );

    expect(screen.getByDisplayValue('15')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '5' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument();
  });

  it('should not call onPageChange for current page', () => {
    const mockOnPageChange = jest.fn();
    renderWithChakra(
      <Pagination {...defaultProps} currentPage={3} onPageChange={mockOnPageChange} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('should handle edge case pagination correctly', () => {
    renderWithChakra(
      <Pagination
        {...defaultProps}
        currentPage={15}
        totalPages={20}
        totalItems={200}
        itemsPerPage={10}
      />
    );

    expect(screen.getByText('Showing 141 to 150 of 200 results')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 20' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 15' })).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    renderWithChakra(<Pagination {...defaultProps} currentPage={2} />);

    const prevButton = screen.getByRole('button', { name: 'Previous page' });
    const nextButton = screen.getByRole('button', { name: 'Next page' });
    const currentPageButton = screen.getByRole('button', { name: 'Page 2' });

    expect(prevButton).toHaveAttribute('aria-label', 'Previous page');
    expect(nextButton).toHaveAttribute('aria-label', 'Next page');
    expect(currentPageButton).toHaveAttribute('aria-current', 'page');
  });
});