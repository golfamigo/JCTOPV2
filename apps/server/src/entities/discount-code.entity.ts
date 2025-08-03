import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { Event } from './event.entity';

@Entity('discount_codes')
@Unique(['eventId', 'code'])
@Index(['eventId']) // Explicit index for performance on event-based queries
export class DiscountCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ type: 'varchar', length: 255 })
  code: string;

  @Column({ type: 'varchar', length: 50 })
  type: 'percentage' | 'fixed_amount';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}