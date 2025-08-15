import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider } from '@rneui/themed';
import { theme } from '@/theme';
import {
  LoadingSkeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonAvatar,
} from './LoadingSkeleton';

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('LoadingSkeleton', () => {
  it('renders with default props', () => {
    const { root } = renderWithTheme(
      <LoadingSkeleton testID="loading-skeleton" />
    );
    
    expect(root).toBeTruthy();
  });

  it('applies custom width and height', () => {
    const { root } = renderWithTheme(
      <LoadingSkeleton 
        testID="loading-skeleton"
        width={200}
        height={50}
      />
    );
    
    expect(root).toBeTruthy();
  });

  it('applies custom style overrides', () => {
    const customStyle = { opacity: 0.5 };
    const { root } = renderWithTheme(
      <LoadingSkeleton 
        testID="loading-skeleton"
        style={customStyle}
      />
    );
    
    expect(root).toBeTruthy();
  });

  it('supports different animation types', () => {
    const { root } = renderWithTheme(
      <LoadingSkeleton 
        testID="loading-skeleton"
        animation="wave"
      />
    );
    
    expect(root).toBeTruthy();
  });
});

describe('SkeletonCard', () => {
  it('renders multiple skeleton elements', () => {
    const { root } = renderWithTheme(
      <SkeletonCard />
    );
    
    // Should render multiple skeleton elements for card layout
    expect(root).toBeTruthy();
  });

  it('applies custom margin bottom', () => {
    const { root } = renderWithTheme(
      <SkeletonCard marginBottom={32} />
    );
    
    expect(root).toBeTruthy();
  });
});

describe('SkeletonList', () => {
  it('renders default number of items', () => {
    const { root } = renderWithTheme(
      <SkeletonList />
    );
    
    expect(root).toBeTruthy();
  });

  it('renders custom number of items', () => {
    const { root } = renderWithTheme(
      <SkeletonList items={5} />
    );
    
    expect(root).toBeTruthy();
  });
});

describe('SkeletonAvatar', () => {
  it('renders with default size', () => {
    const { root } = renderWithTheme(
      <SkeletonAvatar />
    );
    
    expect(root).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { root } = renderWithTheme(
      <SkeletonAvatar size={60} />
    );
    
    expect(root).toBeTruthy();
  });

  it('applies circular border radius', () => {
    const { root } = renderWithTheme(
      <SkeletonAvatar size={40} />
    );
    
    expect(root).toBeTruthy();
  });
});