import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ExportProgressModal, ExportStage } from './ExportProgressModal';
import { ThemeProvider } from '@rneui/themed';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: any, options?: any) => {
      if (key === 'organizer.export.progress.estimatedTime' && options?.time) {
        return `預計剩餘時間: ${options.time}`;
      }
      if (key === 'organizer.export.progress.seconds' && options?.count !== undefined) {
        return `${options.count} 秒`;
      }
      if (key === 'organizer.export.progress.minutes' && options?.count !== undefined) {
        return `${options.count} 分鐘`;
      }
      if (key === 'organizer.export.progress.minutesSeconds' && options?.minutes && options?.seconds) {
        return `${options.minutes} 分 ${options.seconds} 秒`;
      }
      return defaultValue || key;
    },
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

jest.mock('../../atoms/ExportProgressBar', () => ({
  ExportProgressBar: ({ progress, indeterminate, showPercentage }: any) => (
    <mock-ExportProgressBar
      testID="export-progress-bar"
      progress={progress}
      indeterminate={indeterminate}
      showPercentage={showPercentage}
    />
  ),
}));

jest.spyOn(Alert, 'alert');

const mockTheme = {
  colors: {
    primary: '#007BFF',
    background: '#FFFFFF',
    black: '#000000',
    grey3: '#86939E',
    grey5: '#D1D1D6',
    success: '#28A745',
  },
  spacing: {
    sm: 8,
    md: 12,
    lg: 16,
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('ExportProgressModal', () => {
  const mockOnCancel = jest.fn();

  const defaultProps = {
    visible: true,
    progress: 50,
    stage: 'generating' as ExportStage,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with basic props', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} />
    );

    expect(getByText('organizer.export.progress.title')).toBeTruthy();
    expect(getByText('organizer.export.progress.generating')).toBeTruthy();
  });

  it('displays progress bar with correct progress', () => {
    const { getByTestId } = renderWithTheme(
      <ExportProgressModal {...defaultProps} progress={75} />
    );

    const progressBar = getByTestId('export-progress-bar');
    expect(progressBar.props.progress).toBe(75);
    expect(progressBar.props.indeterminate).toBe(false);
  });

  it('shows indeterminate progress when specified', () => {
    const { getByTestId } = renderWithTheme(
      <ExportProgressModal {...defaultProps} indeterminate={true} />
    );

    const progressBar = getByTestId('export-progress-bar');
    expect(progressBar.props.indeterminate).toBe(true);
  });

  it('displays different stages correctly', () => {
    const stages: ExportStage[] = ['preparing', 'generating', 'downloading', 'complete'];

    stages.forEach(stage => {
      const { getByText } = renderWithTheme(
        <ExportProgressModal {...defaultProps} stage={stage} />
      );

      expect(getByText(`organizer.export.progress.${stage}`)).toBeTruthy();
    });
  });

  it('shows file name when provided', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} fileName="export_2024.csv" />
    );

    expect(getByText('export_2024.csv')).toBeTruthy();
  });

  it('displays estimated time remaining', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} estimatedTimeRemaining={45} />
    );

    expect(getByText(/45 秒/)).toBeTruthy();
  });

  it('formats time correctly for minutes', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} estimatedTimeRemaining={120} />
    );

    expect(getByText(/2 分鐘/)).toBeTruthy();
  });

  it('formats time correctly for minutes and seconds', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} estimatedTimeRemaining={90} />
    );

    expect(getByText(/1 分 30 秒/)).toBeTruthy();
  });

  it('shows cancel button when onCancel is provided', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} onCancel={mockOnCancel} />
    );

    expect(getByText('organizer.export.progress.cancel')).toBeTruthy();
  });

  it('shows cancel confirmation dialog when cancel is pressed', async () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} onCancel={mockOnCancel} />
    );

    const cancelButton = getByText('organizer.export.progress.cancel');
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '取消匯出',
        '確定要取消匯出嗎？',
        expect.arrayContaining([
          expect.objectContaining({ text: '否', style: 'cancel' }),
          expect.objectContaining({ text: '是', style: 'destructive' }),
        ])
      );
    });
  });

  it('calls onCancel when confirmed in alert', async () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} onCancel={mockOnCancel} />
    );

    const cancelButton = getByText('organizer.export.progress.cancel');
    fireEvent.press(cancelButton);

    // Simulate pressing "Yes" in the alert
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = alertCall[2].find((btn: any) => btn.style === 'destructive');
    confirmButton.onPress();

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('does not show cancel button when stage is complete', () => {
    const { queryByText } = renderWithTheme(
      <ExportProgressModal
        {...defaultProps}
        stage="complete"
        onCancel={mockOnCancel}
      />
    );

    expect(queryByText('organizer.export.progress.cancel')).toBeNull();
  });

  it('shows complete message when stage is complete', () => {
    const { getByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} stage="complete" progress={100} />
    );

    expect(getByText('匯出完成！')).toBeTruthy();
  });

  it('displays stage indicators for multi-stage progress', () => {
    const { getAllByText } = renderWithTheme(
      <ExportProgressModal {...defaultProps} />
    );

    // Check for stage indicator texts
    expect(getAllByText(/preparing|generating|downloading/).length).toBeGreaterThan(0);
  });

  it('does not show percentage when indeterminate', () => {
    const { getByTestId } = renderWithTheme(
      <ExportProgressModal {...defaultProps} indeterminate={true} />
    );

    const progressBar = getByTestId('export-progress-bar');
    expect(progressBar.props.showPercentage).toBe(false);
  });

  it('updates progress smoothly over time', async () => {
    const { rerender, getByTestId } = renderWithTheme(
      <ExportProgressModal {...defaultProps} progress={25} />
    );

    // Update progress
    rerender(
      <ThemeProvider theme={mockTheme}>
        <ExportProgressModal {...defaultProps} progress={75} />
      </ThemeProvider>
    );

    // Progress should update
    await waitFor(() => {
      const progressBar = getByTestId('export-progress-bar');
      expect(progressBar.props.progress).toBeGreaterThan(25);
    });
  });
});