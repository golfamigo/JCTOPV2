import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { EventReportResponseDto } from '../dto/event-report.dto';

@Injectable()
export class ReportExportService {
  private readonly logger = new Logger(ReportExportService.name);

  async exportToPDF(report: EventReportResponseDto): Promise<Buffer> {
    if (!report) {
      throw new Error('Report data is required for PDF export');
    }
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).text('Event Report', { align: 'center' });
        doc.moveDown();

        // Event Details
        doc.fontSize(18).text('Event Details', { underline: true });
        doc.fontSize(12);
        doc.text(`Title: ${report.eventDetails.title}`);
        doc.text(`Location: ${report.eventDetails.location}`);
        doc.text(`Start Date: ${new Date(report.eventDetails.startDate).toLocaleString()}`);
        doc.text(`End Date: ${new Date(report.eventDetails.endDate).toLocaleString()}`);
        doc.text(`Status: ${report.eventDetails.status}`);
        doc.moveDown();

        // Registration Statistics
        doc.fontSize(18).text('Registration Statistics', { underline: true });
        doc.fontSize(12);
        doc.text(`Total Registrations: ${report.registrationStats.total}`);
        doc.text(`By Status:`);
        Object.entries(report.registrationStats.byStatus).forEach(([status, count]) => {
          doc.text(`  - ${status}: ${count}`, { indent: 20 });
        });
        doc.moveDown();

        // Revenue Statistics
        doc.fontSize(18).text('Revenue Statistics', { underline: true });
        doc.fontSize(12);
        doc.text(`Gross Revenue: $${report.revenue.gross.toFixed(2)}`);
        doc.text(`Discount Amount: $${report.revenue.discountAmount.toFixed(2)}`);
        doc.text(`Net Revenue: $${report.revenue.net.toFixed(2)}`);
        doc.moveDown();

        // Attendance Statistics
        doc.fontSize(18).text('Attendance Statistics', { underline: true });
        doc.fontSize(12);
        doc.text(`Registered: ${report.attendanceStats.registered}`);
        doc.text(`Checked In: ${report.attendanceStats.checkedIn}`);
        doc.text(`Attendance Rate: ${report.attendanceStats.rate}%`);
        if (report.attendanceStats.lastCheckInTime) {
          doc.text(`Last Check-in: ${new Date(report.attendanceStats.lastCheckInTime).toLocaleString()}`);
        }
        doc.moveDown();

        // Ticket Type Breakdown
        if (report.registrationStats.byTicketType.length > 0) {
          doc.fontSize(18).text('Ticket Type Breakdown', { underline: true });
          doc.fontSize(12);
          report.registrationStats.byTicketType.forEach(ticketType => {
            doc.text(`${ticketType.ticketTypeName}:`);
            doc.text(`  - Quantity Sold: ${ticketType.quantitySold}`, { indent: 20 });
            doc.text(`  - Revenue: $${ticketType.revenue.toFixed(2)}`, { indent: 20 });
          });
          doc.moveDown();
        }

        // Footer
        doc.fontSize(10).text(`Generated on: ${new Date(report.generatedAt).toLocaleString()}`, {
          align: 'center',
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async exportToCSV(report: EventReportResponseDto): Promise<string> {
    if (!report) {
      throw new Error('Report data is required for CSV export');
    }
    
    const lines: string[] = [];
    
    // Event Summary
    lines.push('Event Report');
    lines.push('');
    lines.push('Event Details');
    lines.push(`Title,${this.escapeCSV(report.eventDetails.title)}`);
    lines.push(`Location,${this.escapeCSV(report.eventDetails.location)}`);
    lines.push(`Start Date,${new Date(report.eventDetails.startDate).toLocaleString()}`);
    lines.push(`End Date,${new Date(report.eventDetails.endDate).toLocaleString()}`);
    lines.push(`Status,${report.eventDetails.status}`);
    lines.push('');

    // Registration Summary
    lines.push('Registration Summary');
    lines.push(`Total Registrations,${report.registrationStats.total}`);
    lines.push('Status,Count');
    Object.entries(report.registrationStats.byStatus).forEach(([status, count]) => {
      lines.push(`${status},${count}`);
    });
    lines.push('');

    // Revenue Summary
    lines.push('Revenue Summary');
    lines.push(`Gross Revenue,$${report.revenue.gross.toFixed(2)}`);
    lines.push(`Discount Amount,$${report.revenue.discountAmount.toFixed(2)}`);
    lines.push(`Net Revenue,$${report.revenue.net.toFixed(2)}`);
    lines.push('');

    // Attendance Summary
    lines.push('Attendance Summary');
    lines.push(`Registered,${report.attendanceStats.registered}`);
    lines.push(`Checked In,${report.attendanceStats.checkedIn}`);
    lines.push(`Attendance Rate,${report.attendanceStats.rate}%`);
    if (report.attendanceStats.lastCheckInTime) {
      lines.push(`Last Check-in,${new Date(report.attendanceStats.lastCheckInTime).toLocaleString()}`);
    }
    lines.push('');

    // Ticket Type Details
    if (report.registrationStats.byTicketType.length > 0) {
      lines.push('Ticket Type Breakdown');
      lines.push('Ticket Type,Quantity Sold,Revenue');
      report.registrationStats.byTicketType.forEach(ticketType => {
        lines.push(`${this.escapeCSV(ticketType.ticketTypeName)},${ticketType.quantitySold},$${ticketType.revenue.toFixed(2)}`);
      });
      lines.push('');
    }

    // Timeline Data
    if (report.timeline.length > 0) {
      lines.push('Registration Timeline');
      lines.push('Date,Daily Registrations,Daily Revenue,Cumulative Registrations,Cumulative Revenue');
      report.timeline.forEach(point => {
        lines.push(`${point.date},${point.registrations},$${point.revenue.toFixed(2)},${point.cumulativeRegistrations},$${point.cumulativeRevenue.toFixed(2)}`);
      });
    }

    return lines.join('\n');
  }

  async exportToExcel(report: EventReportResponseDto): Promise<Buffer> {
    if (!report) {
      throw new Error('Report data is required for Excel export');
    }
    
    const workbook = new ExcelJS.Workbook();
    
    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    
    // Event Details
    summarySheet.addRow(['Event Report']);
    summarySheet.addRow([]);
    summarySheet.addRow(['Event Details']);
    summarySheet.addRow(['Title', report.eventDetails.title]);
    summarySheet.addRow(['Location', report.eventDetails.location]);
    summarySheet.addRow(['Start Date', new Date(report.eventDetails.startDate).toLocaleString()]);
    summarySheet.addRow(['End Date', new Date(report.eventDetails.endDate).toLocaleString()]);
    summarySheet.addRow(['Status', report.eventDetails.status]);
    summarySheet.addRow([]);

    // Registration Summary
    summarySheet.addRow(['Registration Summary']);
    summarySheet.addRow(['Total Registrations', report.registrationStats.total]);
    summarySheet.addRow(['Status', 'Count']);
    Object.entries(report.registrationStats.byStatus).forEach(([status, count]) => {
      summarySheet.addRow([status, count]);
    });
    summarySheet.addRow([]);

    // Revenue Summary
    summarySheet.addRow(['Revenue Summary']);
    summarySheet.addRow(['Gross Revenue', report.revenue.gross]);
    summarySheet.addRow(['Discount Amount', report.revenue.discountAmount]);
    summarySheet.addRow(['Net Revenue', report.revenue.net]);
    summarySheet.addRow([]);

    // Attendance Summary
    summarySheet.addRow(['Attendance Summary']);
    summarySheet.addRow(['Registered', report.attendanceStats.registered]);
    summarySheet.addRow(['Checked In', report.attendanceStats.checkedIn]);
    summarySheet.addRow(['Attendance Rate', `${report.attendanceStats.rate}%`]);
    if (report.attendanceStats.lastCheckInTime) {
      summarySheet.addRow(['Last Check-in', new Date(report.attendanceStats.lastCheckInTime).toLocaleString()]);
    }

    // Format summary sheet
    summarySheet.getColumn(1).width = 20;
    summarySheet.getColumn(2).width = 30;

    // Ticket Types Sheet
    if (report.registrationStats.byTicketType.length > 0) {
      const ticketSheet = workbook.addWorksheet('Ticket Types');
      ticketSheet.addRow(['Ticket Type', 'Quantity Sold', 'Revenue']);
      
      report.registrationStats.byTicketType.forEach(ticketType => {
        ticketSheet.addRow([
          ticketType.ticketTypeName,
          ticketType.quantitySold,
          ticketType.revenue
        ]);
      });

      // Format columns
      ticketSheet.getColumn(1).width = 30;
      ticketSheet.getColumn(2).width = 15;
      ticketSheet.getColumn(3).width = 15;
      ticketSheet.getColumn(3).numFmt = '$#,##0.00';
    }

    // Timeline Sheet
    if (report.timeline.length > 0) {
      const timelineSheet = workbook.addWorksheet('Timeline');
      timelineSheet.addRow(['Date', 'Daily Registrations', 'Daily Revenue', 'Cumulative Registrations', 'Cumulative Revenue']);
      
      report.timeline.forEach(point => {
        timelineSheet.addRow([
          point.date,
          point.registrations,
          point.revenue,
          point.cumulativeRegistrations,
          point.cumulativeRevenue
        ]);
      });

      // Format columns
      timelineSheet.getColumn(1).width = 15;
      timelineSheet.getColumn(2).width = 20;
      timelineSheet.getColumn(3).width = 15;
      timelineSheet.getColumn(3).numFmt = '$#,##0.00';
      timelineSheet.getColumn(4).width = 25;
      timelineSheet.getColumn(5).width = 20;
      timelineSheet.getColumn(5).numFmt = '$#,##0.00';
    }

    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  getContentType(format: 'pdf' | 'csv' | 'excel'): string {
    const contentTypes = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    return contentTypes[format];
  }

  getFilename(eventTitle: string, format: 'pdf' | 'csv' | 'excel'): string {
    const sanitizedTitle = eventTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
    const date = new Date().toISOString().split('T')[0];
    const extensions = {
      pdf: 'pdf',
      csv: 'csv',
      excel: 'xlsx',
    };
    return `${sanitizedTitle}_Report_${date}.${extensions[format]}`;
  }
}