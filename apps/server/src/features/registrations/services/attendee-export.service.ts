import { Injectable } from '@nestjs/common';
import { AttendeeDto } from '../../events/dto/attendee.dto';
import * as xlsx from 'xlsx';

@Injectable()
export class AttendeeExportService {
  generateCSV(attendees: AttendeeDto[]): string {
    if (!attendees || attendees.length === 0) {
      return 'Name,Email,Phone,Status,Payment Status,Total Amount,Discount Amount,Final Amount,Registration Date\n';
    }

    const headers = [
      'Name',
      'Email', 
      'Phone',
      'Status',
      'Payment Status',
      'Total Amount',
      'Discount Amount',
      'Final Amount',
      'Registration Date',
      'Ticket Types',
      'Custom Fields'
    ];

    const csvContent = [
      headers.join(','),
      ...attendees.map(attendee => {
        const ticketInfo = attendee.ticketSelections
          .map(ticket => `${ticket.quantity}x tickets`)
          .join('; ');
        
        const customFields = Object.entries(attendee.customFieldValues)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; ');

        return [
          `"${attendee.userName}"`,
          `"${attendee.userEmail}"`,
          `"${attendee.userPhone || ''}"`,
          `"${attendee.status}"`,
          `"${attendee.paymentStatus}"`,
          attendee.totalAmount,
          attendee.discountAmount,
          attendee.finalAmount,
          `"${attendee.createdAt.toISOString()}"`,
          `"${ticketInfo}"`,
          `"${customFields}"`
        ].join(',');
      })
    ].join('\n');

    return csvContent;
  }

  generateExcel(attendees: AttendeeDto[]): Buffer {
    if (!attendees || attendees.length === 0) {
      // Create empty worksheet with headers
      const emptyData = [{
        'Name': '',
        'Email': '',
        'Phone': '',
        'Status': '',
        'Payment Status': '',
        'Total Amount': '',
        'Discount Amount': '',
        'Final Amount': '',
        'Registration Date': '',
        'Ticket Types': '',
        'Custom Fields': ''
      }];
      const worksheet = xlsx.utils.json_to_sheet(emptyData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendees');
      return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }

    const worksheetData = attendees.map(attendee => {
      const ticketInfo = attendee.ticketSelections
        .map(ticket => `${ticket.quantity}x tickets`)
        .join('; ');
      
      const customFields = Object.entries(attendee.customFieldValues)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ');

      return {
        'Name': attendee.userName,
        'Email': attendee.userEmail,
        'Phone': attendee.userPhone || '',
        'Status': attendee.status,
        'Payment Status': attendee.paymentStatus,
        'Total Amount': attendee.totalAmount,
        'Discount Amount': attendee.discountAmount,
        'Final Amount': attendee.finalAmount,
        'Registration Date': attendee.createdAt.toISOString(),
        'Ticket Types': ticketInfo,
        'Custom Fields': customFields
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(worksheetData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendees');

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  getFilename(format: 'csv' | 'excel', eventTitle: string): string {
    const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const extension = format === 'csv' ? 'csv' : 'xlsx';
    
    return `${sanitizedTitle}_attendees_${timestamp}.${extension}`;
  }

  getContentType(format: 'csv' | 'excel'): string {
    return format === 'csv' 
      ? 'text/csv'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
}