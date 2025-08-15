import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { ExportToast, showExportToast, hideExportToast, useExportToast } from './ExportToast';
import { ThemeProvider } from '@rneui/themed';
import { renderHook, act } from '@testing-library/react-hooks';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('file content'),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(true),
}));

const mockTheme = {
  colors: {
    primary: '#007BFF',
    background: '#FFFFFF',
    black: '#000000',
    grey3: '#86939E',
    grey5: '#D1D1D6',
  },
  spacing: {
    sm: 8,
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('ExportToast', () => {
  const mockOnDismiss = jest.fn();

  const defaultProps = {
    visible: true,
    variant: 'success' as const,
    title: 'Export Successful',
    onDismiss: mockOnDismiss,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly when visible', () => {
    const { getByText } = renderWithTheme(
      <ExportToast {...defaultProps} />
    );

    expect(getByText('Export Successful')).toBeTruthy();
  });

  it('displays message when provided', () => {
    const { getByText } = renderWithTheme(
      <ExportToast {...defaultProps} message="Your file has been exported" />
    );

    expect(getByText('Your file has been exported')).toBeTruthy();
  });

  it('displays file name when provided', () => {
    const { getByText } = renderWithTheme(
      <ExportToast {...defaultProps} fileName="export_2024.csv" />
    );

    expect(getByText('export_2024.csv')).toBeTruthy();
  });

  it('renders different variants correctly', () => {
    const variants = ['success', 'error', 'warning', 'info'] as const;

    variants.forEach(variant => {
      const { getByText } = renderWithTheme(
        <ExportToast {...defaultProps} variant={variant} title={`${variant} toast`} />
      );

      expect(getByText(`${variant} toast`)).toBeTruthy();
    });
  });

  it('auto-dismisses after specified time', async () => {
    renderWithTheme(
      <ExportToast {...defaultProps} autoDismiss={true} dismissTime={3000} />
    );

    expect(mockOnDismiss).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalled();
    });
  });

  it('does not auto-dismiss when autoDismiss is false', () => {
    renderWithTheme(
      <ExportToast {...defaultProps} autoDismiss={false} />
    );

    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('calls onDismiss when close button is pressed', () => {
    const { getByTestId } = renderWithTheme(
      <ExportToast {...defaultProps} />
    );

    // Find close button (Icon with name="close")
    const closeButton = getByTestId('RNE__ICON__Component');
    fireEvent.press(closeButton.parent?.parent as any);

    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('displays custom actions', () => {
    const mockAction = jest.fn();
    const actions = [
      { label: 'Custom Action', onPress: mockAction },
    ];

    const { getByText } = renderWithTheme(
      <ExportToast {...defaultProps} actions={actions} />
    );

    const actionButton = getByText('Custom Action');
    expect(actionButton).toBeTruthy();

    fireEvent.press(actionButton);
    expect(mockAction).toHaveBeenCalled();
  });

  it('shows default actions for success variant with file', () => {
    const { getByText } = renderWithTheme(
      <ExportToast
        {...defaultProps}
        variant="success"
        filePath="/path/to/file.csv"
        fileName="export.csv"
      />
    );

    expect(getByText('organizer.export.success.open')).toBeTruthy();
    
    // Share button only appears on mobile
    if (Platform.OS !== 'web') {
      expect(getByText('organizer.export.success.share')).toBeTruthy();
    }
  });

  it('does not show default actions for non-success variants', () => {
    const { queryByText } = renderWithTheme(
      <ExportToast
        {...defaultProps}
        variant="error"
        filePath="/path/to/file.csv"
      />
    );

    expect(queryByText('organizer.export.success.open')).toBeNull();
  });

  it('clears timer on unmount', () => {
    const { unmount } = renderWithTheme(
      <ExportToast {...defaultProps} autoDismiss={true} dismissTime={5000} />
    );

    unmount();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should not call onDismiss after unmount
    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it('returns null when not visible', () => {
    const { container } = renderWithTheme(
      <ExportToast {...defaultProps} visible={false} />
    );

    expect(container.children.length).toBe(0);
  });
});

describe('Toast Manager', () => {
  it('shows toast using showExportToast', () => {
    const toastId = showExportToast({
      variant: 'success',
      title: 'Test Toast',
    });

    expect(toastId).toBeTruthy();
    expect(typeof toastId).toBe('string');
  });

  it('hides toast using hideExportToast', () => {
    const toastId = showExportToast({
      variant: 'success',
      title: 'Test Toast',
    });

    hideExportToast(toastId);
    // No error should occur
    expect(true).toBe(true);
  });
});

describe('useExportToast hook', () => {
  it('provides toast management functions', () => {
    const { result } = renderHook(() => useExportToast());

    expect(result.current.show).toBeDefined();
    expect(result.current.hide).toBeDefined();
    expect(result.current.hideAll).toBeDefined();
    expect(result.current.toasts).toEqual([]);
  });

  it('updates toasts array when toast is shown', () => {
    const { result } = renderHook(() => useExportToast());

    act(() => {
      result.current.show({
        variant: 'success',
        title: 'Test Toast',
      });
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].props.title).toBe('Test Toast');
  });

  it('updates toasts array when toast is hidden', () => {
    const { result } = renderHook(() => useExportToast());

    let toastId: string;
    act(() => {
      toastId = result.current.show({
        variant: 'success',
        title: 'Test Toast',
      });
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      result.current.hide(toastId!);
    });

    expect(result.current.toasts.length).toBe(0);
  });

  it('clears all toasts with hideAll', () => {
    const { result } = renderHook(() => useExportToast());

    act(() => {
      result.current.show({ variant: 'success', title: 'Toast 1' });
      result.current.show({ variant: 'error', title: 'Toast 2' });
      result.current.show({ variant: 'info', title: 'Toast 3' });
    });

    expect(result.current.toasts.length).toBe(3);

    act(() => {
      result.current.hideAll();
    });

    expect(result.current.toasts.length).toBe(0);
  });
});