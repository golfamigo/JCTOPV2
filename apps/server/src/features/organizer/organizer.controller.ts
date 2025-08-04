import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventResponseDto } from '../events/dto';
import { OrganizerService } from './organizer.service';

@Controller('organizer')
export class OrganizerController {
  constructor(
    private readonly organizerService: OrganizerService,
  ) {}

  @Get('events')
  @UseGuards(JwtAuthGuard)
  async getOrganizerEvents(@Request() req): Promise<EventResponseDto[]> {
    return this.organizerService.getOrganizerEvents(req.user.id);
  }
}