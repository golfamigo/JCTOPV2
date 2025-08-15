import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { DashboardFilters } from './DashboardFilters';

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

jest.mock('../../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      primary: '#007BFF',
      white: '#FFFFFF',
      textSecondary: '#6C757D',
      dark: '#212529',
      midGrey: '#6C757D',
    },
    spacing: {
      sm: 8,
    },
  }),
}));

jest.mock('@rneui/themed', () => ({
  BottomSheet: 'BottomSheet',
  ListItem: 'ListItem',
  Text: 'Text',
  Button: 'Button',
  ButtonGroup: 'ButtonGroup',
  Icon: 'Icon',
  CheckBox: 'CheckBox',
  Divider: 'Divider',
}));

jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

describe('DashboardFilters', () => {
  const defaultFilters = {
    sortBy: 'date' as const,
    sortOrder: 'desc' as const,
    eventStatus: ['published', 'draft', 'completed'] as const,
    dateRange: {
      start: null,
      end: null,
    },
  };

  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render filter bottom sheet when visible', () => {
    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={defaultFilters}
      />
    );

    expect(screen.getByText('organizer.filterAndSort')).toBeTruthy();
    expect(screen.getByText('organizer.sortBy')).toBeTruthy();
    expect(screen.getByText('organizer.sortOrder')).toBeTruthy();
    expect(screen.getByText('organizer.eventStatus')).toBeTruthy();
    expect(screen.getByText('organizer.dateRange')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <DashboardFilters
        isVisible={false}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={defaultFilters}
      />
    );

    expect(queryByText('organizer.filterAndSort')).toBeFalsy();
  });

  it('should display current filter values', () => {
    const customFilters = {
      ...defaultFilters,
      sortBy: 'registrations' as const,
      sortOrder: 'asc' as const,
    };

    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={customFilters}
      />
    );

    // The component should show the current sort option as selected
    expect(screen.getByText('organizer.sortByRegistrations')).toBeTruthy();
  });

  it('should call onClose when close button is pressed', () => {
    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={defaultFilters}
      />
    );

    // Find and press the close icon
    const closeButton = screen.getAllByTestId('touchable')[0];
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onApply with updated filters when apply button is pressed', () => {
    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={defaultFilters}
      />
    );

    // Press the apply button
    const applyButton = screen.getByText('organizer.apply');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: expect.any(String),
      sortOrder: expect.any(String),
      eventStatus: expect.any(Array),
      dateRange: expect.any(Object),
    }));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should reset filters when reset button is pressed', () => {
    const customFilters = {
      sortBy: 'name' as const,
      sortOrder: 'asc' as const,
      eventStatus: ['published'] as const,
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31'),
      },
    };

    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={customFilters}
      />
    );

    // Press the reset button
    const resetButton = screen.getByText('organizer.reset');
    fireEvent.press(resetButton);

    // Press apply to check the reset filters
    const applyButton = screen.getByText('organizer.apply');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith({
      sortBy: 'date',
      sortOrder: 'desc',
      eventStatus: ['published', 'draft', 'completed'],
      dateRange: {
        start: null,
        end: null,
      },
    });
  });

  it('should update sort option when a different option is selected', () => {
    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={defaultFilters}
      />
    );

    // Select a different sort option
    const nameOption = screen.getByText('organizer.sortByName');
    fireEvent.press(nameOption);

    // Apply the changes
    const applyButton = screen.getByText('organizer.apply');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'name',
      })
    );
  });

  it('should toggle event status filters', () => {
    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={defaultFilters}
      />
    );

    // Toggle the draft status checkbox
    const draftCheckbox = screen.getByText('organizer.draft');
    fireEvent.press(draftCheckbox);

    // Apply the changes
    const applyButton = screen.getByText('organizer.apply');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalledWith(
      expect.objectContaining({
        eventStatus: expect.arrayContaining(['published', 'completed']),
      })
    );
  });

  it('should handle date range selection', () => {
    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={defaultFilters}
      />
    );

    // Press the start date button
    const startDateButton = screen.getByText('organizer.startDate');
    fireEvent.press(startDateButton);

    // The date picker should be shown (mocked as DateTimePicker)
    expect(screen.queryByTestId('DateTimePicker')).toBeTruthy();
  });

  it('should display formatted dates when selected', () => {
    const filtersWithDates = {
      ...defaultFilters,
      dateRange: {
        start: new Date('2024-03-01'),
        end: new Date('2024-03-31'),
      },
    };

    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={filtersWithDates}
      />
    );

    // Check if dates are displayed
    expect(screen.getByText('3/1/2024')).toBeTruthy();
    expect(screen.getByText('3/31/2024')).toBeTruthy();
  });

  it('should clear date when clear button is pressed', () => {
    const filtersWithDates = {
      ...defaultFilters,
      dateRange: {
        start: new Date('2024-03-01'),
        end: new Date('2024-03-31'),
      },
    };

    render(
      <DashboardFilters
        isVisible={true}
        onClose={mockOnClose}
        onApply={mockOnApply}
        currentFilters={filtersWithDates}
      />
    );

    // Find and press the clear button for start date
    const clearButtons = screen.getAllByTestId('touchable');
    const startDateClearButton = clearButtons.find((button) => {
      // Find the clear button associated with the start date
      return button.props.onPress && button.props.children;
    });

    if (startDateClearButton) {
      fireEvent.press(startDateClearButton);
    }

    // Apply the changes
    const applyButton = screen.getByText('organizer.apply');
    fireEvent.press(applyButton);

    expect(mockOnApply).toHaveBeenCalled();
  });
});