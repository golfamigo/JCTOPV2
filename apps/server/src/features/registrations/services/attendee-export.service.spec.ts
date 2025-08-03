import { Test, TestingModule } from '@nestjs/testing';
import { AttendeeExportService } from './attendee-export.service';
import { AttendeeDto } from '../../events/dto/attendee.dto';

describe('AttendeeExportService', () => {
  let service: AttendeeExportService;

  const mockAttendeeDto: AttendeeDto = {
    id: 'reg-1',
    userId: 'user-1',
    eventId: 'event-1',
    status: 'paid',
    paymentStatus: 'completed',
    totalAmount: 100,
    discountAmount: 10,
    finalAmount: 90,
    customFieldValues: { dietaryRestrictions: 'Vegetarian', company: 'Tech Corp' },
    ticketSelections: [
      { ticketTypeId: 'ticket-1', quantity: 2, price: 50 },
      { ticketTypeId: 'ticket-2', quantity: 1, price: 100 },
    ],
    createdAt: new Date('2023-01-01T10:00:00Z'),
    updatedAt: new Date('2023-01-01T11:00:00Z'),
    qrCode: 'qr-code-data',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '+1234567890',
  } as AttendeeDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AttendeeExportService],
    }).compile();

    service = module.get<AttendeeExportService>(AttendeeExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCSV', () => {
    it('should generate CSV with headers and data', () => {
      const csv = service.generateCSV([mockAttendeeDto]);
      
      expect(csv).toContain('Name,Email,Phone,Status,Payment Status');
      expect(csv).toContain('"John Doe"');
      expect(csv).toContain('"john@example.com"');
      expect(csv).toContain('"paid"');
      expect(csv).toContain('"completed"');
      expect(csv).toContain('90'); // final amount
    });

    it('should generate empty CSV with headers only', () => {
      const csv = service.generateCSV([]);
      
      expect(csv).toBe('Name,Email,Phone,Status,Payment Status,Total Amount,Discount Amount,Final Amount,Registration Date\n');
    });

    it('should handle attendees with empty custom fields', () => {
      const attendeeWithoutCustomFields = {
        ...mockAttendeeDto,
        customFieldValues: {},
      };
      
      const csv = service.generateCSV([attendeeWithoutCustomFields]);
      
      expect(csv).toContain('""'); // empty custom fields column
    });

    it('should escape quotes in attendee data', () => {
      const attendeeWithQuotes = {
        ...mockAttendeeDto,
        userName: 'John "Johnny" Doe',
      };
      
      const csv = service.generateCSV([attendeeWithQuotes]);
      
      expect(csv).toContain('"John "Johnny" Doe"');
    });
  });

  describe('generateExcel', () => {
    it('should generate Excel buffer', () => {
      const buffer = service.generateExcel([mockAttendeeDto]);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate Excel for empty attendee list', () => {
      const buffer = service.generateExcel([]);
      
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('getFilename', () => {
    it('should generate CSV filename', () => {
      const filename = service.getFilename('csv', 'Tech Conference 2023');
      
      expect(filename).toMatch(/^Tech_Conference_2023_attendees_\d{4}-\d{2}-\d{2}\.csv$/);
    });

    it('should generate Excel filename', () => {
      const filename = service.getFilename('excel', 'Tech Conference 2023');
      
      expect(filename).toMatch(/^Tech_Conference_2023_attendees_\d{4}-\d{2}-\d{2}\.xlsx$/);
    });

    it('should sanitize event title with special characters', () => {
      const filename = service.getFilename('csv', 'Tech & Innovation Conference 2023!');
      
      expect(filename).toMatch(/^Tech___Innovation_Conference_2023__attendees_\d{4}-\d{2}-\d{2}\.csv$/);
    });
  });

  describe('getContentType', () => {
    it('should return CSV content type', () => {
      const contentType = service.getContentType('csv');
      
      expect(contentType).toBe('text/csv');
    });

    it('should return Excel content type', () => {
      const contentType = service.getContentType('excel');
      
      expect(contentType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });
});