// Simple PaymentStep component tests
import React from 'react';
import { render } from '@testing-library/react-native';
import PaymentStep from './PaymentStep';

// Mock services
jest.mock('../../../services/paymentService', () => ({
  initiatePayment: jest.fn(),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({ id: 'event-1' }),
}));

// Mock theme
const mockTheme = {};

const mockEvent = {
  id: 'event-1',
  organizerId: 'org-1',
  title: 'Test Event',
  description: 'Test Description',
  location: 'Test Location',
  startDate: new Date('2024-12-01T10:00:00Z'),
  endDate: new Date('2024-12-01T18:00:00Z'),
  ticketTypes: [
    {
      id: 'ticket-1',
      name: 'General Admission',
      description: 'Standard ticket',
      price: 1000,
      quantity: 100,
      soldQuantity: 10,
      isActive: true,
      features: ['Entry to event'],
      metadata: {},
    },
  ],
  customFields: [],
  registrationSettings: {
    requiresApproval: false,
    maxRegistrations: 100,
    registrationDeadline: new Date('2024-11-30T23:59:59Z'),
    allowCancellation: true,
    cancellationDeadline: new Date('2024-11-25T23:59:59Z'),
  },
  paymentSettings: {
    requiresPayment: true,
    currency: 'TWD',
    acceptedMethods: ['credit_card'],
    processingFee: 0,
    refundPolicy: 'Standard refund policy',
  },
  status: 'published' as const,
  imageUrl: 'https://example.com/image.jpg',
  tags: ['test'],
  category: 'conference',
  visibility: 'public' as const,
  maxAttendees: 100,
  currentAttendees: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  organizer: {
    id: 'org-1',
    name: 'Test Organizer',
    email: 'test@example.com',
    avatar: null,
  },
};

const mockFormData = {
  attendeeInfo: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+886912345678',
  },
  ticketSelections: [
    {
      ticketTypeId: 'ticket-1',
      quantity: 2,
      unitPrice: 1000,
      totalPrice: 2000,
    },
  ],
  customFieldResponses: {},
  discountCode: null,
  totalAmount: 2000,
  finalAmount: 2000,
  agreedToTerms: true,
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider theme={mockTheme}>
    {children}
  </ChakraProvider>
);

describe('PaymentStep Simple Tests', () => {
  const mockOnSuccess = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { getByText } = render(
      <TestWrapper>
        <PaymentStep
          event={mockEvent}
          formData={mockFormData}
          onSuccess={mockOnSuccess}
          onBack={mockOnBack}
          isLoading={false}
        />
      </TestWrapper>
    );

    // Just check that it renders without throwing
    expect(getByText).toBeDefined();
  });
});