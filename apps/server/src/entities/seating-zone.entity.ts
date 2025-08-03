import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SeatingZone as SeatingZoneInterface } from '@jctop-event/shared-types';
import { Event } from './event.entity';

@Entity('seating_zones')
export class SeatingZone implements SeatingZoneInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'integer' })
  capacity: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}