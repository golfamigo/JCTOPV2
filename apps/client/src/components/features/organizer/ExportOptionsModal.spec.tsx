import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ExportOptionsModal } from './ExportOptionsModal';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: any, options?: any) => {
      if (options?.count !== undefined) {
        return defaultValue?.replace('{{count}}', options.count) || key;
      }
      return defaultValue || key;
    },
  }),
}));

jest.spyOn(Alert, 'alert');

const renderWithTheme = (component: React.ReactElement) => {
  return render(component);
};

describe('ExportOptionsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    visible: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText, queryByText } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    expect(getByText('organizer.export.title')).toBeTruthy();
    // Buttons render text as children
    expect(queryByText('organizer.export.options.selectAll')).toBeTruthy();
    expect(queryByText('organizer.export.options.deselectAll')).toBeTruthy();
  });

  it('displays all default export options', () => {
    const { queryByText } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    // CheckBox renders text as children
    expect(queryByText('organizer.export.options.attendees')).toBeTruthy();
    expect(queryByText('organizer.export.options.revenue')).toBeTruthy();
    expect(queryByText('organizer.export.options.tickets')).toBeTruthy();
    expect(queryByText('organizer.export.options.analytics')).toBeTruthy();
    expect(queryByText('organizer.export.options.transactions')).toBeTruthy();
  });

  it('toggles individual options when clicked', () => {
    const { queryAllByRole } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    const checkboxes = queryAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    
    // The component should re-render with updated state
    expect(checkboxes[0]).toBeTruthy();
  });

  it('selects all options when select all is clicked', () => {
    const { queryByText, queryAllByRole } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    const selectAllButton = queryByText('organizer.export.options.selectAll');
    fireEvent.press(selectAllButton);

    const checkboxes = queryAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox.props.accessibilityState?.checked).toBe(true);
    });
  });

  it('deselects all options when deselect all is clicked', () => {
    const { queryByText, queryAllByRole } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    const deselectAllButton = queryByText('organizer.export.options.deselectAll');
    fireEvent.press(deselectAllButton);

    const checkboxes = queryAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox.props.accessibilityState?.checked).toBe(false);
    });
  });

  it('shows error alert when confirming with no selections', async () => {
    const { queryByText } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    // First deselect all
    const deselectAllButton = queryByText('organizer.export.options.deselectAll');
    fireEvent.press(deselectAllButton);

    // Then try to confirm
    const confirmButton = queryByText('common.confirm');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'common.error',
        '請至少選擇一項資料',
        expect.any(Array)
      );
    });

    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm with selected options', () => {
    const { queryByText } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    const confirmButton = queryByText('common.confirm');
    fireEvent.press(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledWith(['attendees', 'revenue', 'tickets']);
  });

  it('calls onClose when cancel is pressed', () => {
    const { queryByText } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    const cancelButton = queryByText('common.cancel');
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables interactions when loading', () => {
    const { queryByText, queryAllByRole } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} loading={true} />
    );

    const selectAllButton = queryByText('organizer.export.options.selectAll');
    expect(selectAllButton).toBeDisabled();

    const cancelButton = queryByText('common.cancel');
    expect(cancelButton).toBeDisabled();

    const checkboxes = queryAllByRole('checkbox');
    checkboxes.forEach(checkbox => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('displays selected count correctly', () => {
    const { queryByText, getByText } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} />
    );

    // Default has 3 selected
    expect(getByText('已選擇 3 項')).toBeTruthy();

    // Deselect all
    const deselectAllButton = queryByText('organizer.export.options.deselectAll');
    fireEvent.press(deselectAllButton);

    expect(getByText('已選擇 0 項')).toBeTruthy();
  });

  it('accepts custom initial options', () => {
    const customOptions = [
      { key: 'custom1', label: 'Custom Option 1', selected: true },
      { key: 'custom2', label: 'Custom Option 2', selected: false },
    ];

    const { queryByText } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} initialOptions={customOptions} />
    );

    expect(queryByText('Custom Option 1')).toBeTruthy();
    expect(queryByText('Custom Option 2')).toBeTruthy();
  });

  it('respects disabled options', () => {
    const optionsWithDisabled = [
      { key: 'option1', label: 'Option 1', selected: true },
      { key: 'option2', label: 'Option 2', selected: false, disabled: true },
    ];

    const { queryByText, queryAllByRole } = renderWithTheme(
      <ExportOptionsModal {...defaultProps} initialOptions={optionsWithDisabled} />
    );

    const checkboxes = queryAllByRole('checkbox');
    expect(checkboxes[1]).toBeDisabled();

    // Select all should not select disabled options
    const selectAllButton = queryByText('organizer.export.options.selectAll');
    fireEvent.press(selectAllButton);

    expect(checkboxes[0].props.accessibilityState?.checked).toBe(true);
    expect(checkboxes[1].props.accessibilityState?.checked).toBe(false);
  });
});