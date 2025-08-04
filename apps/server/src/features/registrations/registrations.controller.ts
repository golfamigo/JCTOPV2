import { Controller, Post, Get, Param, UseGuards, Request, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegistrationCompletionService } from './services/registration-completion.service';
import { Registration } from './entities/registration.entity';

@Controller('registrations')
export class RegistrationsController {
  constructor(
    private registrationCompletionService: RegistrationCompletionService,
  ) {}

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async completeRegistration(
    @Param('id') registrationId: string
  ): Promise<{ success: boolean; registration: Registration }> {
    const registration = await this.registrationCompletionService.processPaymentSuccess(registrationId);
    
    return {
      success: true,
      registration
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRegistration(
    @Param('id') registrationId: string,
    @Request() req: any
  ): Promise<Registration> {
    return await this.registrationCompletionService.getRegistrationById(
      registrationId,
      req.user.id
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserRegistrations(
    @Request() req: any
  ): Promise<Registration[]> {
    return await this.registrationCompletionService.getUserRegistrations(req.user.id, 'paid');
  }
}