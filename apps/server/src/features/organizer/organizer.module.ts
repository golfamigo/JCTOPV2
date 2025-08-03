import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from '../../entities/event.entity';
import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [OrganizerController],
  providers: [OrganizerService],
  exports: [OrganizerService],
})
export class OrganizerModule {}