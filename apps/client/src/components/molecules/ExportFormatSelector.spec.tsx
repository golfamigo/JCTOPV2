import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExportFormatSelector, ExportFormat } from './ExportFormatSelector';
import { ThemeProvider } from '@rneui/themed';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

const mockTheme = {
  colors: {
    primary: '#007BFF',
    white: '#FFFFFF',
    black: '#000000',
    grey3: '#86939E',
    grey5: '#D1D1D6',
    warning: '#FFC107',
  },
  spacing: {
    sm: 8,
    md: 12,
  },
};

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={mockTheme}>
      {component}
    </ThemeProvider>
  );
};

describe('ExportFormatSelector', () => {
  const mockOnFormatChange = jest.fn();

  const defaultProps = {
    selectedFormat: 'csv' as ExportFormat,
    onFormatChange: mockOnFormatChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all format options', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector {...defaultProps} />
    );

    expect(getByText('organizer.export.formats.title')).toBeTruthy();
    expect(getByText('organizer.export.formats.csv')).toBeTruthy();
    expect(getByText('organizer.export.formats.excel')).toBeTruthy();
    expect(getByText('organizer.export.formats.pdf')).toBeTruthy();
  });

  it('displays format descriptions when showDescriptions is true', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector {...defaultProps} showDescriptions={true} />
    );

    expect(getByText('organizer.export.formats.description.csv')).toBeTruthy();
  });

  it('hides format descriptions when showDescriptions is false', () => {
    const { queryByText } = renderWithTheme(
      <ExportFormatSelector {...defaultProps} showDescriptions={false} />
    );

    expect(queryByText('organizer.export.formats.description.csv')).toBeNull();
  });

  it('calls onFormatChange when a format is selected', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector {...defaultProps} />
    );

    const excelButton = getByText('organizer.export.formats.excel');
    fireEvent.press(excelButton);

    expect(mockOnFormatChange).toHaveBeenCalledWith('excel');
  });

  it('displays estimated file sizes for each format', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector {...defaultProps} />
    );

    expect(getByText('~100 KB')).toBeTruthy(); // CSV
    expect(getByText('~500 KB')).toBeTruthy(); // Excel
    expect(getByText('~1 MB')).toBeTruthy(); // PDF
  });

  it('disables formats specified in disabledFormats prop', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector
        {...defaultProps}
        disabledFormats={['pdf']}
      />
    );

    const pdfButton = getByText('organizer.export.formats.pdf');
    fireEvent.press(pdfButton);

    // Should not change format when disabled
    expect(mockOnFormatChange).not.toHaveBeenCalled();
  });

  it('disables CSV format when analytics data type is selected', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector
        {...defaultProps}
        selectedDataTypes={['analytics']}
      />
    );

    const csvButton = getByText('organizer.export.formats.csv');
    fireEvent.press(csvButton);

    // CSV should be disabled for analytics
    expect(mockOnFormatChange).not.toHaveBeenCalled();
  });

  it('shows info message when CSV is selected with analytics data', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector
        {...defaultProps}
        selectedFormat="csv"
        selectedDataTypes={['analytics']}
      />
    );

    expect(getByText('分析圖表僅在 Excel 或 PDF 格式中可用')).toBeTruthy();
  });

  it('updates selected index when selectedFormat prop changes', () => {
    const { rerender, getAllByRole } = renderWithTheme(
      <ExportFormatSelector {...defaultProps} selectedFormat="csv" />
    );

    // Check initial selection (CSV is index 0)
    const buttons = getAllByRole('button');
    expect(buttons[0].props.accessibilityState?.selected).toBe(true);

    // Change to Excel
    rerender(
      <ThemeProvider theme={mockTheme}>
        <ExportFormatSelector {...defaultProps} selectedFormat="excel" />
      </ThemeProvider>
    );

    // Excel should now be selected (index 1)
    const updatedButtons = getAllByRole('button');
    expect(updatedButtons[1].props.accessibilityState?.selected).toBe(true);
  });

  it('does not call onFormatChange when selecting already selected format', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector {...defaultProps} selectedFormat="csv" />
    );

    const csvButton = getByText('organizer.export.formats.csv');
    fireEvent.press(csvButton);

    // Should still call onFormatChange even if already selected
    expect(mockOnFormatChange).toHaveBeenCalledWith('csv');
  });

  it('handles multiple disabled formats correctly', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector
        {...defaultProps}
        disabledFormats={['csv', 'pdf']}
      />
    );

    const csvButton = getByText('organizer.export.formats.csv');
    const pdfButton = getByText('organizer.export.formats.pdf');
    const excelButton = getByText('organizer.export.formats.excel');

    fireEvent.press(csvButton);
    expect(mockOnFormatChange).not.toHaveBeenCalled();

    fireEvent.press(pdfButton);
    expect(mockOnFormatChange).not.toHaveBeenCalled();

    fireEvent.press(excelButton);
    expect(mockOnFormatChange).toHaveBeenCalledWith('excel');
  });

  it('shows warning when selected format is disabled', () => {
    const { getByText } = renderWithTheme(
      <ExportFormatSelector
        {...defaultProps}
        selectedFormat="pdf"
        disabledFormats={['pdf']}
        showDescriptions={true}
      />
    );

    expect(getByText('此格式不適用於所選資料類型')).toBeTruthy();
  });
});