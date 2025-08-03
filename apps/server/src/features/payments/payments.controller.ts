import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards, 
  Request,
  ParseUUIDPipe,
  ValidationPipe,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentGatewayService } from './services/payment-gateway.service';
import { PaymentProviderService } from './services/payment-provider.service';
import { PaymentRequestDto } from './dto/payment-request.dto';
import { PaymentResponseDto, PaymentStatusResponseDto } from './dto/payment-response.dto';
import { CreatePaymentProviderDto, UpdatePaymentProviderDtoRequest } from './dto/payment-provider.dto';

@Controller('api/v1')
export class PaymentsController {
  constructor(
    private paymentGatewayService: PaymentGatewayService,
    private paymentProviderService: PaymentProviderService,
  ) {}

  // Payment Gateway Service endpoints
  @Post('payments/initiate')
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @Body(ValidationPipe) paymentRequest: PaymentRequestDto,
    @Request() req: any
  ): Promise<PaymentResponseDto> {
    // Ensure the organizer ID matches the authenticated user (for now)
    // TODO: Add proper organizer authorization logic
    if (paymentRequest.organizerId !== req.user.id) {
      throw new BadRequestException('Invalid organizer ID');
    }

    return await this.paymentGatewayService.initiatePayment(paymentRequest);
  }

  @Post('payments/callback/:providerId/:organizerId')
  async handlePaymentCallback(
    @Param('providerId') providerId: string,
    @Param('organizerId', ParseUUIDPipe) organizerId: string,
    @Body() callbackData: any
  ): Promise<{ success: boolean }> {
    try {
      await this.paymentGatewayService.handleProviderCallback(
        providerId,
        organizerId,
        callbackData
      );
      return { success: true };
    } catch (error) {
      // Log error but don't expose details to external callback
      console.error(`Payment callback error: ${error.message}`);
      throw new BadRequestException('Callback processing failed');
    }
  }

  @Get('payments/:paymentId/status')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Request() req: any
  ): Promise<PaymentStatusResponseDto> {
    // Use authenticated user as organizer for now
    // TODO: Add proper organizer context resolution
    return await this.paymentGatewayService.getPaymentStatus(paymentId, req.user.id);
  }

  // Payment Provider Management endpoints
  @Get('organizers/me/payment-providers')
  @UseGuards(JwtAuthGuard)
  async getPaymentProviders(@Request() req: any) {
    return await this.paymentProviderService.getAllProviders(req.user.id);
  }

  @Post('organizers/me/payment-providers')
  @UseGuards(JwtAuthGuard)
  async addPaymentProvider(
    @Body(ValidationPipe) dto: CreatePaymentProviderDto,
    @Request() req: any
  ) {
    return await this.paymentProviderService.createProvider(req.user.id, dto);
  }

  @Put('organizers/me/payment-providers/:providerId')
  @UseGuards(JwtAuthGuard)
  async updatePaymentProvider(
    @Param('providerId') providerId: string,
    @Body(ValidationPipe) dto: UpdatePaymentProviderDtoRequest,
    @Request() req: any
  ) {
    return await this.paymentProviderService.updateProvider(req.user.id, providerId, dto);
  }

  @Put('organizers/me/payment-providers/:providerId/default')
  @UseGuards(JwtAuthGuard)
  async setDefaultPaymentProvider(
    @Param('providerId') providerId: string,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.paymentProviderService.setDefaultProvider(req.user.id, providerId);
    return { success: true };
  }

  @Delete('organizers/me/payment-providers/:providerId')
  @UseGuards(JwtAuthGuard)
  async removePaymentProvider(
    @Param('providerId') providerId: string,
    @Request() req: any
  ): Promise<{ success: boolean }> {
    await this.paymentProviderService.removeProvider(req.user.id, providerId);
    return { success: true };
  }

  // Event-specific payment endpoints
  @Post('events/:eventId/payments/initiate')
  @UseGuards(JwtAuthGuard)
  async initiateEventPayment(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @Body() paymentData: {
      amount: number;
      description: string;
      paymentMethod?: string;
      metadata?: Record<string, any>;
    },
    @Request() req: any
  ): Promise<PaymentResponseDto> {
    const paymentRequest: PaymentRequestDto = {
      organizerId: req.user.id, // TODO: Get actual event organizer ID
      resourceType: 'event',
      resourceId: eventId,
      amount: paymentData.amount,
      currency: 'TWD',
      description: paymentData.description,
      paymentMethod: paymentData.paymentMethod,
      metadata: paymentData.metadata
    };

    return await this.paymentGatewayService.initiatePayment(paymentRequest);
  }
}