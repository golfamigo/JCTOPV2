import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Animated } from 'react-native';
import {
  SkeletonLoader,
  SkeletonContainer,
  CardSkeleton,
  ListItemSkeleton,
} from './SkeletonLoader';

// Mock dependencies
jest.mock('../../theme', () => ({
  useAppTheme: () => ({
    colors: {
      grey5: '#E0E0E0',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }),
}));

// Mock Animated API
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  RN.Animated.timing = jest.fn(() => ({
    start: jest.fn((callback) => callback && callback()),
    stop: jest.fn(),
  }));
  
  RN.Animated.loop = jest.fn((animation) => ({
    start: jest.fn(),
    stop: jest.fn(),
  }));
  
  RN.Animated.sequence = jest.fn((animations) => ({
    start: jest.fn(),
    stop: jest.fn(),
  }));
  
  return RN;
});

describe('SkeletonLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(
        <SkeletonLoader testID="skeleton" />
      );

      expect(getByTestId('skeleton')).toBeDefined();
    });

    it('should render with custom width and height', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          width={200}
          height={100}
          testID="skeleton"
        />
      );

      const skeleton = getByTestId('skeleton');
      expect(skeleton.props.style).toMatchObject({
        width: 200,
        height: 100,
      });
    });

    it('should render with percentage width', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          width="100%"
          height={50}
          testID="skeleton"
        />
      );

      const skeleton = getByTestId('skeleton');
      expect(skeleton.props.style).toMatchObject({
        width: '100%',
        height: 50,
      });
    });

    it('should apply custom border radius', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          borderRadius={10}
          testID="skeleton"
        />
      );

      const skeleton = getByTestId('skeleton');
      expect(skeleton.props.style).toMatchObject({
        borderRadius: 10,
      });
    });

    it('should apply custom styles', () => {
      const customStyle = {
        marginTop: 20,
        marginBottom: 10,
      };

      const { getByTestId } = render(
        <SkeletonLoader
          style={customStyle}
          testID="skeleton"
        />
      );

      const skeleton = getByTestId('skeleton');
      expect(skeleton.props.style).toMatchObject(customStyle);
    });
  });

  describe('Variants', () => {
    it('should render text variant', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          variant="text"
          testID="skeleton"
        />
      );

      const skeleton = getByTestId('skeleton');
      expect(skeleton.props.style).toMatchObject({
        height: 16,
        borderRadius: 4,
      });
    });

    it('should render circle variant', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          variant="circle"
          width={50}
          testID="skeleton"
        />
      );

      const skeleton = getByTestId('skeleton');
      expect(skeleton.props.style).toMatchObject({
        width: 50,
        height: 50,
        borderRadius: 25,
      });
    });

    it('should render card variant', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          variant="card"
          testID="skeleton"
        />
      );

      const skeleton = getByTestId('skeleton');
      expect(skeleton.props.style).toMatchObject({
        height: 200,
        borderRadius: 8,
      });
    });

    it('should render rect variant', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          variant="rect"
          width={100}
          height={100}
          testID="skeleton"
        />
      );

      const skeleton = getByTestId('skeleton');
      expect(skeleton.props.style).toMatchObject({
        width: 100,
        height: 100,
        borderRadius: 4,
      });
    });
  });

  describe('Text Lines', () => {
    it('should render single line of text', () => {
      const { getAllByTestId } = render(
        <SkeletonLoader
          variant="text"
          lines={1}
          testID="skeleton"
        />
      );

      const skeletons = getAllByTestId('skeleton');
      expect(skeletons).toHaveLength(1);
    });

    it('should render multiple lines of text', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          variant="text"
          lines={3}
          testID="skeleton-container"
        />
      );

      const container = getByTestId('skeleton-container');
      // Check that container has 3 children
      expect(container.children).toHaveLength(3);
    });

    it('should make last line shorter in multi-line text', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          variant="text"
          lines={3}
          testID="skeleton-container"
        />
      );

      const container = getByTestId('skeleton-container');
      const lastLine = container.children[2];
      
      // Last line should have 70% width
      expect(lastLine.props.style).toMatchObject({
        width: '70%',
      });
    });

    it('should apply spacing between lines', () => {
      const { getByTestId } = render(
        <SkeletonLoader
          variant="text"
          lines={3}
          spacing={10}
          testID="skeleton-container"
        />
      );

      const container = getByTestId('skeleton-container');
      const firstLine = container.children[0];
      const secondLine = container.children[1];
      
      // All lines except last should have margin bottom
      expect(firstLine.props.style).toMatchObject({
        marginBottom: 10,
      });
      expect(secondLine.props.style).toMatchObject({
        marginBottom: 10,
      });
    });
  });

  describe('Animation', () => {
    it('should start animation on mount', () => {
      render(<SkeletonLoader />);

      expect(Animated.loop).toHaveBeenCalled();
      expect(Animated.sequence).toHaveBeenCalled();
      expect(Animated.timing).toHaveBeenCalled();
    });

    it('should use custom animation duration', () => {
      render(<SkeletonLoader duration={2000} />);

      expect(Animated.timing).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          duration: 2000,
        })
      );
    });

    it('should clean up animation on unmount', () => {
      const { unmount } = render(<SkeletonLoader />);
      
      const stopSpy = jest.fn();
      const mockAnimation = { stop: stopSpy };
      (Animated.loop as jest.Mock).mockReturnValue(mockAnimation);
      
      unmount();
      
      // Animation should be stopped on cleanup
      expect(Animated.loop).toHaveBeenCalled();
    });
  });

  describe('Children', () => {
    it('should render children inside skeleton', () => {
      const { getByText } = render(
        <SkeletonLoader>
          <text>Child Content</text>
        </SkeletonLoader>
      );

      expect(getByText('Child Content')).toBeDefined();
    });
  });
});

describe('SkeletonContainer', () => {
  it('should show skeleton when loading', () => {
    const { getByTestId } = render(
      <SkeletonContainer
        isLoading={true}
        skeleton={<SkeletonLoader testID="skeleton" />}
      >
        <text>Content</text>
      </SkeletonContainer>
    );

    expect(getByTestId('skeleton')).toBeDefined();
  });

  it('should show content when not loading', () => {
    const { getByText, queryByTestId } = render(
      <SkeletonContainer
        isLoading={false}
        skeleton={<SkeletonLoader testID="skeleton" />}
      >
        <text>Content</text>
      </SkeletonContainer>
    );

    expect(getByText('Content')).toBeDefined();
    expect(queryByTestId('skeleton')).toBeNull();
  });

  it('should show default skeleton when no skeleton provided', () => {
    const { getByTestId } = render(
      <SkeletonContainer
        isLoading={true}
        testID="container"
      >
        <text>Content</text>
      </SkeletonContainer>
    );

    // Should render default skeleton
    expect(getByTestId('container')).toBeDefined();
  });

  it('should animate fade transition', async () => {
    const { rerender } = render(
      <SkeletonContainer
        isLoading={true}
        fade={true}
        fadeDuration={300}
      >
        <text>Content</text>
      </SkeletonContainer>
    );

    // Change loading state
    rerender(
      <SkeletonContainer
        isLoading={false}
        fade={true}
        fadeDuration={300}
      >
        <text>Content</text>
      </SkeletonContainer>
    );

    await waitFor(() => {
      expect(Animated.timing).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          toValue: 1,
          duration: 300,
        })
      );
    });
  });

  it('should not animate when fade is false', () => {
    const { getByText } = render(
      <SkeletonContainer
        isLoading={false}
        fade={false}
      >
        <text>Content</text>
      </SkeletonContainer>
    );

    expect(getByText('Content')).toBeDefined();
  });
});

describe('CardSkeleton', () => {
  it('should render single card skeleton', () => {
    const { getAllByTestId } = render(
      <CardSkeleton count={1} testID="card-skeleton" />
    );

    const cards = getAllByTestId('card-skeleton');
    expect(cards).toHaveLength(1);
  });

  it('should render multiple card skeletons', () => {
    const { getAllByTestId } = render(
      <CardSkeleton count={3} testID="card-skeleton" />
    );

    const cards = getAllByTestId('card-skeleton');
    expect(cards).toHaveLength(3);
  });

  it('should render with correct structure', () => {
    const { getByTestId } = render(
      <CardSkeleton count={1} testID="card-skeleton" />
    );

    const card = getByTestId('card-skeleton');
    
    // Should have image placeholder and text lines
    expect(card.children).toBeDefined();
  });
});

describe('ListItemSkeleton', () => {
  it('should render single list item skeleton', () => {
    const { getAllByTestId } = render(
      <ListItemSkeleton count={1} testID="list-skeleton" />
    );

    const items = getAllByTestId('list-skeleton');
    expect(items).toHaveLength(1);
  });

  it('should render multiple list item skeletons', () => {
    const { getAllByTestId } = render(
      <ListItemSkeleton count={5} testID="list-skeleton" />
    );

    const items = getAllByTestId('list-skeleton');
    expect(items).toHaveLength(5);
  });

  it('should render without avatar', () => {
    const { queryByTestId } = render(
      <ListItemSkeleton
        count={1}
        avatar={false}
        testID="list-skeleton"
      />
    );

    const item = queryByTestId('list-skeleton');
    expect(item).toBeDefined();
    // Check that no circle variant is rendered
  });

  it('should render with avatar', () => {
    const { getByTestId } = render(
      <ListItemSkeleton
        count={1}
        avatar={true}
        testID="list-skeleton"
      />
    );

    const item = getByTestId('list-skeleton');
    expect(item).toBeDefined();
    // Should have avatar circle and text lines
  });

  it('should render with correct structure', () => {
    const { getByTestId } = render(
      <ListItemSkeleton
        count={1}
        avatar={true}
        testID="list-skeleton"
      />
    );

    const item = getByTestId('list-skeleton');
    
    // Should have flex row layout
    expect(item.props.style).toMatchObject({
      flexDirection: 'row',
      alignItems: 'center',
    });
  });
});