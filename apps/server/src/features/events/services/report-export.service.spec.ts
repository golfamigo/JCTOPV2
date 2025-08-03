import { Test, TestingModule } from '@nestjs/testing';
import { ReportExportService } from './report-export.service';
import { EventReportResponseDto } from '../dto/event-report.dto';

describe('ReportExportService', () => {
  let service: ReportExportService;

  const mockReport: EventReportResponseDto = {
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
      total: 3,
      byStatus: {
        pending: 0,
        paid: 2,
        cancelled: 1,
        checkedIn: 1,
      },
      byTicketType: [
        {
          ticketTypeId: 'ticket-1',
          ticketTypeName: 'General Admission',
          quantitySold: 2,
          revenue: 100,
        },
        {
          ticketTypeId: 'ticket-2',
          ticketTypeName: 'VIP',
          quantitySold: 1,
          revenue: 150,
        },
      ],
    },
    revenue: {
      gross: 250,
      discountAmount: 25,
      net: 225,
      byTicketType: [
        {
          ticketTypeId: 'ticket-1',
          ticketTypeName: 'General Admission',
          quantitySold: 2,
          revenue: 100,
        },
        {
          ticketTypeId: 'ticket-2',
          ticketTypeName: 'VIP',
          quantitySold: 1,
          revenue: 150,
        },
      ],
    },
    attendanceStats: {
      registered: 3,
      checkedIn: 1,
      rate: 33.3,
      lastCheckInTime: '2024-01-01T10:00:00.000Z',
    },
    timeline: [
      {
        date: '2024-01-01',
        registrations: 2,
        revenue: 200,
        cumulativeRegistrations: 2,
        cumulativeRevenue: 200,
      },
      {
        date: '2024-01-02',
        registrations: 1,
        revenue: 50,
        cumulativeRegistrations: 3,
        cumulativeRevenue: 250,
      },
    ],
    generatedAt: '2024-01-03T00:00:00.000Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportExportService],
    }).compile();

    service = module.get<ReportExportService>(ReportExportService);
  });

  describe('exportToPDF', () => {
    it('should generate a PDF buffer', async () => {
      // Act
      const result = await service.exportToPDF(mockReport);

      // Assert
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle events with no ticket types', async () => {
      // Arrange
      const reportWithoutTickets = {
        ...mockReport,
        registrationStats: {
          ...mockReport.registrationStats,
          byTicketType: [],
        },
      };

      // Act
      const result = await service.exportToPDF(reportWithoutTickets);

      // Assert
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('exportToCSV', () => {
    it('should generate CSV content', async () => {
      // Act
      const result = await service.exportToCSV(mockReport);

      // Assert
      expect(typeof result).toBe('string');
      expect(result).toContain('Event Report');
      expect(result).toContain('Test Event');
      expect(result).toContain('General Admission');
      expect(result).toContain('VIP');
      expect(result).toContain('$250.00'); // Gross revenue
      expect(result).toContain('33.3%'); // Attendance rate
    });

    it('should escape CSV values correctly', async () => {
      // Arrange
      const reportWithSpecialChars = {
        ...mockReport,
        eventDetails: {
          ...mockReport.eventDetails,
          title: 'Event with "quotes" and, commas',
          location: 'Location with\nnewlines',
        },
      };

      // Act
      const result = await service.exportToCSV(reportWithSpecialChars);

      // Assert
      expect(result).toContain('"Event with ""quotes"" and, commas"');
      expect(result).toContain('"Location with\nnewlines"');
    });

    it('should handle empty timeline data', async () => {
      // Arrange
      const reportWithoutTimeline = {
        ...mockReport,
        timeline: [],
      };

      // Act
      const result = await service.exportToCSV(reportWithoutTimeline);

      // Assert
      expect(result).not.toContain('Registration Timeline');
      expect(typeof result).toBe('string');
    });
  });

  describe('exportToExcel', () => {
    it('should generate Excel buffer', async () => {
      // Act
      const result = await service.exportToExcel(mockReport);

      // Assert
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should create multiple worksheets', async () => {
      // This test verifies the structure indirectly by checking buffer size
      // In a real scenario, you might want to parse the Excel file to verify sheets
      
      // Act
      const result = await service.exportToExcel(mockReport);

      // Assert - Excel with multiple sheets should be larger than minimal Excel
      expect(result.length).toBeGreaterThan(1000);
    });

    it('should handle events with no ticket types', async () => {
      // Arrange
      const reportWithoutTickets = {
        ...mockReport,
        registrationStats: {
          ...mockReport.registrationStats,
          byTicketType: [],
        },
      };

      // Act
      const result = await service.exportToExcel(reportWithoutTickets);

      // Assert
      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('utility methods', () => {
    describe('getContentType', () => {
      it('should return correct content types', () => {
        expect(service.getContentType('pdf')).toBe('application/pdf');
        expect(service.getContentType('csv')).toBe('text/csv');
        expect(service.getContentType('excel')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      });
    });

    describe('getFilename', () => {
      it('should generate proper filenames', () => {
        const eventTitle = 'My Amazing Event';
        const date = new Date().toISOString().split('T')[0];

        expect(service.getFilename(eventTitle, 'pdf')).toBe(`My_Amazing_Event_Report_${date}.pdf`);
        expect(service.getFilename(eventTitle, 'csv')).toBe(`My_Amazing_Event_Report_${date}.csv`);
        expect(service.getFilename(eventTitle, 'excel')).toBe(`My_Amazing_Event_Report_${date}.xlsx`);
      });

      it('should sanitize special characters in event title', () => {
        const eventTitle = 'Event with @#$%^&*()!';
        const result = service.getFilename(eventTitle, 'pdf');
        
        expect(result).toMatch(/^Event_with____________Report_\d{4}-\d{2}-\d{2}\.pdf$/);
      });

      it('should truncate long event titles', () => {
        const longTitle = 'A'.repeat(100);
        const result = service.getFilename(longTitle, 'pdf');
        
        // Should be truncated to 50 chars + date + extension
        expect(result.length).toBeLessThan(100);
        expect(result).toContain('AAAAA'); // First part should be preserved
      });
    });

    describe('escapeCSV', () => {
      it('should escape values with commas', () => {
        // This is a private method, so we test it indirectly through exportToCSV
        const reportWithCommas = {
          ...mockReport,
          eventDetails: {
            ...mockReport.eventDetails,
            title: 'Event, with commas',
          },
        };

        return service.exportToCSV(reportWithCommas).then(result => {
          expect(result).toContain('"Event, with commas"');
        });
      });

      it('should escape values with quotes', () => {
        const reportWithQuotes = {
          ...mockReport,
          eventDetails: {
            ...mockReport.eventDetails,
            title: 'Event "with quotes"',
          },
        };

        return service.exportToCSV(reportWithQuotes).then(result => {
          expect(result).toContain('"Event ""with quotes"""');
        });
      });
    });
  });
});