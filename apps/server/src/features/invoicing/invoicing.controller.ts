import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { InvoicingService } from './invoicing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  CreateInvoiceSettingsDto, 
  UpdateInvoiceSettingsDto, 
  InvoiceSettingsResponseDto 
} from '../events/dto/invoice-settings.dto';

@Controller('api/v1/events/:eventId/invoice-settings')
@UseGuards(JwtAuthGuard)
export class InvoicingController {
  constructor(private readonly invoicingService: InvoicingService) {}

  @Get()
  async getInvoiceSettings(
    @Param('eventId') eventId: string,
    @Request() req
  ): Promise<InvoiceSettingsResponseDto | null> {
    return this.invoicingService.getInvoiceSettings(eventId, req.user.id);
  }

  @Post()
  async createInvoiceSettings(
    @Param('eventId') eventId: string,
    @Body() createDto: CreateInvoiceSettingsDto,
    @Request() req
  ): Promise<InvoiceSettingsResponseDto> {
    return this.invoicingService.createInvoiceSettings(eventId, req.user.id, createDto);
  }

  @Put()
  async updateInvoiceSettings(
    @Param('eventId') eventId: string,
    @Body() updateDto: UpdateInvoiceSettingsDto,
    @Request() req
  ): Promise<InvoiceSettingsResponseDto> {
    return this.invoicingService.updateInvoiceSettings(eventId, req.user.id, updateDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInvoiceSettings(
    @Param('eventId') eventId: string,
    @Request() req
  ): Promise<void> {
    await this.invoicingService.deleteInvoiceSettings(eventId, req.user.id);
  }
}