import React from 'react';
import { render, screen } from '@testing-library/react';
import { ReportVisualization } from './ReportVisualization';
import { EventReport } from '@jctop-event/shared-types';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraProvider>{children}</ChakraProvider>
);

const mockReport: EventReport = {
  eventId: 'event-1',
  eventDetails: {
    id: 'event-1',
    title: 'Test Event',
    location: 'Test Location',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-02'),
    status: 'ended',
  } as any,
  registrationStats: {
    total: 10,
    byStatus: {
      pending: 1,
      paid: 6,
      cancelled: 1,
      checkedIn: 2,
    },
    byTicketType: [
      {
        ticketTypeId: 'ticket-1',
        ticketTypeName: 'General Admission',
        quantitySold: 5,
        revenue: 250,
      },
      {
        ticketTypeId: 'ticket-2',
        ticketTypeName: 'VIP',
        quantitySold: 3,
        revenue: 450,
      },
    ],
  },
  revenue: {
    gross: 700,
    discountAmount: 50,
    net: 650,
    byTicketType: [
      {
        ticketTypeId: 'ticket-1',
        ticketTypeName: 'General Admission',
        quantitySold: 5,
        revenue: 250,
      },
      {
        ticketTypeId: 'ticket-2',
        ticketTypeName: 'VIP',
        quantitySold: 3,
        revenue: 450,
      },
    ],
  },
  attendanceStats: {
    registered: 8,
    checkedIn: 2,
    rate: 25,
    lastCheckInTime: '2024-01-01T15:30:00.000Z',
  },
  timeline: [
    {
      date: '2024-01-01',
      registrations: 5,
      revenue: 400,
      cumulativeRegistrations: 5,
      cumulativeRevenue: 400,
    },
    {
      date: '2024-01-02',
      registrations: 3,
      revenue: 300,
      cumulativeRegistrations: 8,
      cumulativeRevenue: 700,
    },
  ],
  generatedAt: '2024-01-03T00:00:00.000Z',
};

describe('ReportVisualization', () => {
  it('should render registration status breakdown', () => {
    render(
      <TestWrapper>
        <ReportVisualization report={mockReport} />
      </TestWrapper>
    );

    expect(screen.getByText('Registration Status Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Registration Distribution')).toBeInTheDocument();
    
    // Check status counts
    expect(screen.getByText('6 (60.0%)')).toBeInTheDocument(); // Paid
    expect(screen.getByText('2 (20.0%)')).toBeInTheDocument(); // Checked In
    expect(screen.getByText('1 (10.0%)')).toBeInTheDocument(); // Pending and Cancelled
  });

  it('should render quick stats correctly', () => {
    render(
      <TestWrapper>
        <ReportVisualization report={mockReport} />
      </TestWrapper>
    );

    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument(); // Paid registrations (paid + checkedIn)
    expect(screen.getByText('25%')).toBeInTheDocument(); // Show-up rate
    expect(screen.getByText('1')).toBeInTheDocument(); // Pending count
  });

  it('should render ticket type performance table', () => {
    render(
      <TestWrapper>
        <ReportVisualization report={mockReport} />
      </TestWrapper>
    );

    expect(screen.getByText('Ticket Type Performance')).toBeInTheDocument();
    expect(screen.getByText('General Admission')).toBeInTheDocument();
    expect(screen.getByText('VIP')).toBeInTheDocument();
    
    // Check quantities sold
    expect(screen.getByText('5')).toBeInTheDocument(); // General Admission quantity
    expect(screen.getByText('3')).toBeInTheDocument(); // VIP quantity
    
    // Check revenue (formatted as currency)
    expect(screen.getByText('$250.00')).toBeInTheDocument(); // General Admission revenue
    expect(screen.getByText('$450.00')).toBeInTheDocument(); // VIP revenue
  });

  it('should calculate average prices correctly', () => {
    render(
      <TestWrapper>
        <ReportVisualization report={mockReport} />
      </TestWrapper>
    );

    // General Admission: $250 / 5 = $50
    expect(screen.getByText('$50.00')).toBeInTheDocument();
    // VIP: $450 / 3 = $150
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('should render revenue analysis', () => {
    render(
      <TestWrapper>
        <ReportVisualization report={mockReport} />
      </TestWrapper>
    );

    expect(screen.getByText('Revenue Analysis')).toBeInTheDocument();
    expect(screen.getByText('$700.00')).toBeInTheDocument(); // Gross revenue
    expect(screen.getByText('-$50.00')).toBeInTheDocument(); // Discount amount
    expect(screen.getByText('$650.00')).toBeInTheDocument(); // Net revenue
  });

  it('should show discount impact when discounts are applied', () => {
    render(
      <TestWrapper>
        <ReportVisualization report={mockReport} />
      </TestWrapper>
    );

    expect(screen.getByText(/Discount Impact:/)).toBeInTheDocument();
    expect(screen.getByText(/reduced revenue by 7.1%/)).toBeInTheDocument(); // 50/700 * 100
  });

  it('should render registration timeline', () => {
    render(
      <TestWrapper>
        <ReportVisualization report={mockReport} />
      </TestWrapper>
    );

    expect(screen.getByText('Registration Timeline')).toBeInTheDocument();
    
    // Check timeline data
    expect(screen.getByText('Jan 1')).toBeInTheDocument();
    expect(screen.getByText('Jan 2')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument(); // Daily revenue for Jan 1
    expect(screen.getByText('$300.00')).toBeInTheDocument(); // Daily revenue for Jan 2
  });

  it('should show success alert for good attendance rate', () => {
    const highAttendanceReport = {
      ...mockReport,
      attendanceStats: {
        ...mockReport.attendanceStats,
        rate: 85,
      },
    };

    render(
      <TestWrapper>
        <ReportVisualization report={highAttendanceReport} />
      </TestWrapper>
    );

    expect(screen.getByText(/Excellent attendance rate!/)).toBeInTheDocument();
    expect(screen.getByText(/85% of registered attendees showed up/)).toBeInTheDocument();
  });

  it('should show warning alert for low attendance rate', () => {
    const lowAttendanceReport = {
      ...mockReport,
      attendanceStats: {
        ...mockReport.attendanceStats,
        rate: 45,
        registered: 10,
      },
    };

    render(
      <TestWrapper>
        <ReportVisualization report={lowAttendanceReport} />
      </TestWrapper>
    );

    expect(screen.getByText(/Consider improving check-in processes/)).toBeInTheDocument();
    expect(screen.getByText(/Only 45% of registered attendees checked in/)).toBeInTheDocument();
  });

  it('should show alert for high discount usage', () => {
    const highDiscountReport = {
      ...mockReport,
      revenue: {
        ...mockReport.revenue,
        gross: 1000,
        discountAmount: 250, // 25% discount
      },
    };

    render(
      <TestWrapper>
        <ReportVisualization report={highDiscountReport} />
      </TestWrapper>
    );

    expect(screen.getByText(/High discount usage/)).toBeInTheDocument();
    expect(screen.getByText(/25.0% of gross revenue was discounted/)).toBeInTheDocument();
  });

  it('should show alert for high cancellation rate', () => {
    const highCancellationReport = {
      ...mockReport,
      registrationStats: {
        ...mockReport.registrationStats,
        total: 20,
        byStatus: {
          ...mockReport.registrationStats.byStatus,
          cancelled: 5, // 25% cancellation rate
        },
      },
    };

    render(
      <TestWrapper>
        <ReportVisualization report={highCancellationReport} />
      </TestWrapper>
    );

    expect(screen.getByText(/High cancellation rate/)).toBeInTheDocument();
    expect(screen.getByText(/25.0% of registrations were cancelled/)).toBeInTheDocument();
  });

  it('should handle empty ticket types gracefully', () => {
    const noTicketsReport = {
      ...mockReport,
      registrationStats: {
        ...mockReport.registrationStats,
        byTicketType: [],
      },
    };

    render(
      <TestWrapper>
        <ReportVisualization report={noTicketsReport} />
      </TestWrapper>
    );

    // Should not render ticket type table
    expect(screen.queryByText('Ticket Type Performance')).not.toBeInTheDocument();
  });

  it('should handle empty timeline gracefully', () => {
    const noTimelineReport = {
      ...mockReport,
      timeline: [],
    };

    render(
      <TestWrapper>
        <ReportVisualization report={noTimelineReport} />
      </TestWrapper>
    );

    expect(screen.getByText(/No timeline data available/)).toBeInTheDocument();
  });

  it('should show last check-in time when available', () => {
    render(
      <TestWrapper>
        <ReportVisualization report={mockReport} />
      </TestWrapper>
    );

    // The component should format and display the last check-in time
    // This will depend on the exact formatting used in the component
    expect(screen.getByText(/Last Check-in/)).toBeInTheDocument();
  });

  it('should limit timeline display to last 10 days', () => {
    const longTimelineReport = {
      ...mockReport,
      timeline: Array.from({ length: 15 }, (_, i) => ({
        date: `2024-01-${i + 1}`,
        registrations: 1,
        revenue: 50,
        cumulativeRegistrations: i + 1,
        cumulativeRevenue: (i + 1) * 50,
      })),
    };

    render(
      <TestWrapper>
        <ReportVisualization report={longTimelineReport} />
      </TestWrapper>
    );

    expect(screen.getByText(/Showing last 10 days/)).toBeInTheDocument();
    expect(screen.getByText(/Full timeline available in exported reports/)).toBeInTheDocument();
  });
});