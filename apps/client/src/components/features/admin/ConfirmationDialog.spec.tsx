import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import ConfirmationDialog from './ConfirmationDialog';
import { useAppTheme } from '@/theme';

jest.mock('@/theme', () => ({
  useAppTheme: jest.fn(),
}));

const mockTheme = {
  colors: {
    primary: '#007BFF',
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    text: '#212529',
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
};

describe('ConfirmationDialog', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render dialog when visible is true', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Delete User"
          message="Are you sure you want to delete this user?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    expect(getByText('Delete User')).toBeTruthy();
    expect(getByText('Are you sure you want to delete this user?')).toBeTruthy();
  });

  it('should not render dialog when visible is false', () => {
    const { queryByText } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={false}
          title="Delete User"
          message="Are you sure?"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    expect(queryByText('Delete User')).toBeNull();
  });

  it('should call onConfirm when confirm button is pressed', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Confirm Action"
          message="Proceed?"
          confirmText="Yes"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    const confirmButton = getByText('Yes');
    fireEvent.press(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalled();
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Confirm Action"
          message="Proceed?"
          cancelText="No"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    const cancelButton = getByText('No');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('should handle async onConfirm with loading state', async () => {
    const asyncConfirm = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Async Action"
          message="This will take time"
          confirmText="Proceed"
          onConfirm={asyncConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    const confirmButton = getByText('Proceed');
    fireEvent.press(confirmButton);

    // Check loading state
    expect(getByTestId('confirm-loading')).toBeTruthy();

    await waitFor(() => {
      expect(asyncConfirm).toHaveBeenCalled();
    });
  });

  it('should display warning icon for warning type', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Warning"
          message="This is a warning"
          type="warning"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    const icon = getByTestId('dialog-icon');
    expect(icon.props.name).toBe('alert');
    expect(icon.props.color).toBe(mockTheme.colors.warning);
  });

  it('should display danger icon for danger type', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Delete"
          message="This action cannot be undone"
          type="danger"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    const icon = getByTestId('dialog-icon');
    expect(icon.props.name).toBe('alert-circle');
    expect(icon.props.color).toBe(mockTheme.colors.danger);
  });

  it('should display info icon for info type', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Information"
          message="Just FYI"
          type="info"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    const icon = getByTestId('dialog-icon');
    expect(icon.props.name).toBe('information');
    expect(icon.props.color).toBe(mockTheme.colors.primary);
  });

  it('should use default button text when not provided', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Default Buttons"
          message="Check button text"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should disable buttons during async operation', async () => {
    const slowConfirm = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 200))
    );

    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Slow Operation"
          message="Please wait"
          onConfirm={slowConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    const confirmButton = getByText('Confirm');
    const cancelButton = getByText('Cancel');
    
    fireEvent.press(confirmButton);

    // Both buttons should be disabled during loading
    expect(getByTestId('confirm-button').props.disabled).toBe(true);
    expect(getByTestId('cancel-button').props.disabled).toBe(true);

    await waitFor(() => {
      expect(slowConfirm).toHaveBeenCalled();
    });
  });

  it('should handle onConfirm errors gracefully', async () => {
    const errorConfirm = jest.fn().mockRejectedValue(new Error('Failed'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByText } = render(
      <ThemeProvider>
        <ConfirmationDialog
          visible={true}
          title="Error Test"
          message="This will fail"
          onConfirm={errorConfirm}
          onCancel={mockOnCancel}
        />
      </ThemeProvider>
    );

    const confirmButton = getByText('Confirm');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(errorConfirm).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Confirmation action failed:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });
});