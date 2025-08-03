import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Event as EventInterface } from '@jctop-event/shared-types';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Venue } from './venue.entity';
import { TicketType } from './ticket-type.entity';
import { SeatingZone } from './seating-zone.entity';
import { CustomRegistrationField } from './custom-registration-field.entity';

@Entity('events')
export class Event implements EventInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'organizer_id' })
  organizerId: string;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @Column({ type: 'uuid', name: 'venue_id' })
  venueId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamptz', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamptz', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: 'draft' | 'published' | 'unpublished' | 'paused' | 'ended';

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @ManyToOne(() => Category, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Venue, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @OneToMany(() => TicketType, ticketType => ticketType.event)
  ticketTypes: TicketType[];

  @OneToMany(() => SeatingZone, seatingZone => seatingZone.event)
  seatingZones: SeatingZone[];

  @OneToMany(() => CustomRegistrationField, customField => customField.event)
  customRegistrationFields: CustomRegistrationField[];
}