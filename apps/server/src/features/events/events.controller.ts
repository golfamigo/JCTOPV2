import { Controller, Post, Body, UseGuards, Request, Param, Put, Delete, Get, Query, BadRequestException, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { EventsService } from './events.service';
import { CreateEventDto, EventResponseDto, CreateTicketTypeDto, UpdateTicketTypeDto, CreateSeatingZoneDto, UpdateEventStatusDto, EventStatusChangeDto, CreateDiscountCodeDto, UpdateDiscountCodeDto, CreateCustomFieldDto, UpdateCustomFieldDto, DiscountValidationDto, AttendeeQueryDto, AttendeeListResponseDto, AttendeeExportQueryDto, AttendeeSearchQueryDto, AttendeeSearchResponseDto, EventReportResponseDto, ExportFormatDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginatedEventsResponse, TicketTypeWithAvailability, TicketSelectionValidationRequest, TicketSelectionValidationResponse, CustomFieldResponse, DiscountValidationResponse } from '@jctop-event/shared-types';
import { AttendeeManagementService } from './services/attendee-management.service';
import { AttendeeSearchService } from './services/attendee-search.service';
import { AttendeeExportService } from '../registrations/services/attendee-export.service';
import { CheckInDto, CheckInResponseDto } from '../registrations/dto/checkin.dto';
import { CheckInService } from './services/checkin.service';
import { EventStatisticsService } from './services/event-statistics.service';
import { EventStatisticsResponseDto } from './dto/event-statistics.dto';
import { EventReportService } from './services/event-report.service';
import { ReportExportService } from './services/report-export.service';

@Controller('api/v1/events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly attendeeManagementService: AttendeeManagementService,
    private readonly attendeeSearchService: AttendeeSearchService,
    private readonly attendeeExportService: AttendeeExportService,
    private readonly checkInService: CheckInService,
    private readonly eventStatisticsService: EventStatisticsService,
    private readonly eventReportService: EventReportService,
    private readonly reportExportService: ReportExportService,
  ) {}

  // Public Event Endpoints (No authentication required)
  @Get()
  async getPublicEvents(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedEventsResponse> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    // Validate parameters
    if (isNaN(pageNum) || pageNum < 1) {
      throw new BadRequestException('Page must be a positive integer');
    }
    if (isNaN(limitNum) || limitNum < 1) {
      throw new BadRequestException('Limit must be a positive integer');
    }
    
    return this.eventsService.findPublicEventsPaginated(pageNum, limitNum);
  }

  @Get('public')
  async getPublicEventsLegacy(): Promise<EventResponseDto[]> {
    const events = await this.eventsService.findPublicEvents();
    return events.map(event => new EventResponseDto(event));
  }

  @Get('public/:eventId')
  async getPublicEvent(@Param('eventId') eventId: string): Promise<EventResponseDto> {
    const event = await this.eventsService.findPublicEventById(eventId);
    return new EventResponseDto(event);
  }

  @Get('public/:eventId/ticket-types')
  async getPublicTicketTypes(@Param('eventId') eventId: string): Promise<TicketTypeWithAvailability[]> {
    return this.eventsService.getPublicTicketTypesWithAvailability(eventId);
  }

  @Post('public/:eventId/validate-selection')
  async validateTicketSelection(
    @Param('eventId') eventId: string,
    @Body() validationRequest: TicketSelectionValidationRequest,
  ): Promise<TicketSelectionValidationResponse> {
    return this.eventsService.validateTicketSelection(eventId, validationRequest.selections);
  }

  // Private Event Endpoints (Authentication required)
  @Get(':eventId')
  @UseGuards(JwtAuthGuard)
  async getEvent(@Param('eventId') eventId: string, @Request() req): Promise<EventResponseDto> {
    const event = await this.eventsService.findEventByIdForUser(eventId, req.user.id);
    return new EventResponseDto(event);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createEventDto: CreateEventDto, @Request() req): Promise<EventResponseDto> {
    const event = await this.eventsService.create(createEventDto, req.user.id);
    return new EventResponseDto(event);
  }

  // Ticket Type Management Endpoints
  @Post(':eventId/ticket-types')
  @UseGuards(JwtAuthGuard)
  async createTicketType(
    @Param('eventId') eventId: string,
    @Body() createTicketTypeDto: CreateTicketTypeDto,
    @Request() req,
  ) {
    return this.eventsService.createTicketType(eventId, createTicketTypeDto, req.user.id);
  }

  @Put(':eventId/ticket-types/:ticketTypeId')
  @UseGuards(JwtAuthGuard)
  async updateTicketType(
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
    @Request() req,
  ) {
    return this.eventsService.updateTicketType(eventId, ticketTypeId, updateTicketTypeDto, req.user.id);
  }

  @Delete(':eventId/ticket-types/:ticketTypeId')
  @UseGuards(JwtAuthGuard)
  async deleteTicketType(
    @Param('eventId') eventId: string,
    @Param('ticketTypeId') ticketTypeId: string,
    @Request() req,
  ) {
    return this.eventsService.deleteTicketType(eventId, ticketTypeId, req.user.id);
  }

  @Get(':eventId/ticket-types')
  @UseGuards(JwtAuthGuard)
  async getTicketTypes(@Param('eventId') eventId: string, @Request() req) {
    return this.eventsService.getTicketTypes(eventId, req.user.id);
  }

  // Seating Zone Management Endpoints
  @Post(':eventId/seating-zones')
  @UseGuards(JwtAuthGuard)
  async createSeatingZone(
    @Param('eventId') eventId: string,
    @Body() createSeatingZoneDto: CreateSeatingZoneDto,
    @Request() req,
  ) {
    return this.eventsService.createSeatingZone(eventId, createSeatingZoneDto, req.user.id);
  }

  @Put(':eventId/seating-zones/:zoneId')
  @UseGuards(JwtAuthGuard)
  async updateSeatingZone(
    @Param('eventId') eventId: string,
    @Param('zoneId') zoneId: string,
    @Body() updateSeatingZoneDto: CreateSeatingZoneDto,
    @Request() req,
  ) {
    return this.eventsService.updateSeatingZone(eventId, zoneId, updateSeatingZoneDto, req.user.id);
  }

  @Delete(':eventId/seating-zones/:zoneId')
  @UseGuards(JwtAuthGuard)
  async deleteSeatingZone(
    @Param('eventId') eventId: string,
    @Param('zoneId') zoneId: string,
    @Request() req,
  ) {
    return this.eventsService.deleteSeatingZone(eventId, zoneId, req.user.id);
  }

  @Get(':eventId/seating-zones')
  @UseGuards(JwtAuthGuard)
  async getSeatingZones(@Param('eventId') eventId: string, @Request() req) {
    return this.eventsService.getSeatingZones(eventId, req.user.id);
  }

  // Status Management Endpoints
  @Put(':eventId/status')
  @UseGuards(JwtAuthGuard)
  async updateEventStatus(
    @Param('eventId') eventId: string,
    @Body() updateStatusDto: UpdateEventStatusDto,
    @Request() req,
  ): Promise<EventResponseDto> {
    const updatedEvent = await this.eventsService.updateEventStatus(
      eventId, 
      updateStatusDto.status, 
      req.user.id,
      updateStatusDto.reason
    );
    return new EventResponseDto(updatedEvent);
  }

  @Get(':eventId/status-history')
  @UseGuards(JwtAuthGuard)
  async getEventStatusHistory(
    @Param('eventId') eventId: string,
    @Request() req,
  ): Promise<EventStatusChangeDto[]> {
    return this.eventsService.getEventStatusHistory(eventId, req.user.id);
  }

  // Discount Code Management Endpoints
  @Post(':eventId/discount-codes')
  @UseGuards(JwtAuthGuard)
  async createDiscountCode(
    @Param('eventId') eventId: string,
    @Body() createDiscountCodeDto: CreateDiscountCodeDto,
    @Request() req,
  ) {
    return this.eventsService.createDiscountCode(eventId, createDiscountCodeDto, req.user.id);
  }

  @Get(':eventId/discount-codes')
  @UseGuards(JwtAuthGuard)
  async getDiscountCodes(@Param('eventId') eventId: string, @Request() req) {
    return this.eventsService.getDiscountCodes(eventId, req.user.id);
  }

  @Put(':eventId/discount-codes/:codeId')
  @UseGuards(JwtAuthGuard)
  async updateDiscountCode(
    @Param('eventId') eventId: string,
    @Param('codeId') codeId: string,
    @Body() updateDiscountCodeDto: UpdateDiscountCodeDto,
    @Request() req,
  ) {
    return this.eventsService.updateDiscountCode(eventId, codeId, updateDiscountCodeDto, req.user.id);
  }

  @Delete(':eventId/discount-codes/:codeId')
  @UseGuards(JwtAuthGuard)
  async deleteDiscountCode(
    @Param('eventId') eventId: string,
    @Param('codeId') codeId: string,
    @Request() req,
  ) {
    return this.eventsService.deleteDiscountCode(eventId, codeId, req.user.id);
  }

  // Custom Registration Fields Endpoints
  @Get(':eventId/registration-fields')
  async getRegistrationFields(@Param('eventId') eventId: string): Promise<CustomFieldResponse> {
    const fields = await this.eventsService.getCustomRegistrationFields(eventId);
    return { fields };
  }

  @Post(':eventId/registration-fields')
  @UseGuards(JwtAuthGuard)
  async createRegistrationField(
    @Param('eventId') eventId: string,
    @Body() createCustomFieldDto: CreateCustomFieldDto,
    @Request() req,
  ) {
    return this.eventsService.createCustomRegistrationField(eventId, createCustomFieldDto, req.user.id);
  }

  @Put(':eventId/registration-fields/:fieldId')
  @UseGuards(JwtAuthGuard)
  async updateRegistrationField(
    @Param('eventId') eventId: string,
    @Param('fieldId') fieldId: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
    @Request() req,
  ) {
    return this.eventsService.updateCustomRegistrationField(eventId, fieldId, updateCustomFieldDto, req.user.id);
  }

  @Delete(':eventId/registration-fields/:fieldId')
  @UseGuards(JwtAuthGuard)
  async deleteRegistrationField(
    @Param('eventId') eventId: string,
    @Param('fieldId') fieldId: string,
    @Request() req,
  ) {
    return this.eventsService.deleteCustomRegistrationField(eventId, fieldId, req.user.id);
  }

  // Discount Validation Endpoint
  @Post(':eventId/validate-discount')
  async validateDiscountCode(
    @Param('eventId') eventId: string,
    @Body() discountValidationDto: DiscountValidationDto,
  ): Promise<DiscountValidationResponse> {
    return this.eventsService.validateDiscountCode(eventId, discountValidationDto.code, discountValidationDto.totalAmount);
  }

  // Attendee Management Endpoints
  @Get(':eventId/attendees')
  @UseGuards(JwtAuthGuard)
  async getEventAttendees(
    @Param('eventId') eventId: string,
    @Query() query: AttendeeQueryDto,
    @Request() req,
  ): Promise<AttendeeListResponseDto> {
    return this.attendeeManagementService.getEventAttendees(eventId, req.user.id, query);
  }

  @Get(':eventId/attendees/export')
  @UseGuards(JwtAuthGuard)
  async exportEventAttendees(
    @Param('eventId') eventId: string,
    @Query() query: AttendeeExportQueryDto,
    @Request() req,
    @Res() res: Response,
  ): Promise<void> {
    const event = await this.attendeeManagementService.getEventForExport(eventId, req.user.id);
    const attendees = await this.attendeeManagementService.getAllEventAttendees(
      eventId, 
      req.user.id, 
      { status: query.status, search: query.search }
    );

    const filename = this.attendeeExportService.getFilename(query.format, event.title);
    const contentType = this.attendeeExportService.getContentType(query.format);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    if (query.format === 'csv') {
      const csvData = this.attendeeExportService.generateCSV(attendees);
      res.send(csvData);
    } else {
      const excelBuffer = this.attendeeExportService.generateExcel(attendees);
      res.send(excelBuffer);
    }
  }

  // Attendee Search Endpoints
  @Get(':eventId/attendees/search')
  @UseGuards(JwtAuthGuard)
  async searchAttendees(
    @Param('eventId') eventId: string,
    @Query() query: AttendeeSearchQueryDto,
    @Request() req,
  ): Promise<AttendeeSearchResponseDto> {
    return this.attendeeSearchService.searchAttendees(eventId, req.user.id, query);
  }

  // Check-in Management Endpoints
  @Post(':eventId/checkin')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async checkInAttendee(
    @Param('eventId') eventId: string,
    @Body() checkInDto: CheckInDto,
    @Request() req,
  ): Promise<CheckInResponseDto> {
    return this.checkInService.checkInAttendee(eventId, checkInDto.qrCode, req.user.id);
  }

  // Event Statistics Endpoints
  @Get(':eventId/statistics')
  @UseGuards(JwtAuthGuard)
  async getEventStatistics(
    @Param('eventId') eventId: string,
    @Request() req,
  ): Promise<EventStatisticsResponseDto> {
    // Verify user has access to this event
    await this.eventsService.findEventByIdForUser(eventId, req.user.id);
    return this.eventStatisticsService.getEventStatistics(eventId);
  }

  // Post-Event Report Endpoints
  @Get(':eventId/report')
  @UseGuards(JwtAuthGuard)
  async getEventReport(
    @Param('eventId') eventId: string,
    @Request() req,
  ): Promise<EventReportResponseDto> {
    return this.eventReportService.generateEventReport(eventId, req.user.id);
  }

  @Get(':eventId/report/export')
  @UseGuards(JwtAuthGuard)
  async exportEventReport(
    @Param('eventId') eventId: string,
    @Query('format') format: 'pdf' | 'csv' | 'excel' = 'pdf',
    @Request() req,
    @Res() res: Response,
  ): Promise<void> {
    // Generate the report
    const report = await this.eventReportService.generateEventReport(eventId, req.user.id);

    // Export based on format
    let content: Buffer | string;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        content = await this.reportExportService.exportToCSV(report);
        contentType = this.reportExportService.getContentType('csv');
        filename = this.reportExportService.getFilename(report.eventDetails.title, 'csv');
        break;
      case 'excel':
        content = await this.reportExportService.exportToExcel(report);
        contentType = this.reportExportService.getContentType('excel');
        filename = this.reportExportService.getFilename(report.eventDetails.title, 'excel');
        break;
      case 'pdf':
      default:
        content = await this.reportExportService.exportToPDF(report);
        contentType = this.reportExportService.getContentType('pdf');
        filename = this.reportExportService.getFilename(report.eventDetails.title, 'pdf');
        break;
    }

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send the file
    res.send(content);
  }
}