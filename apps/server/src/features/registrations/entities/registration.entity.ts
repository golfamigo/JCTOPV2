import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { Event } from '../../../entities/event.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  eventId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'cancelled', 'checkedIn'],
    default: 'pending'
  })
  status: 'pending' | 'paid' | 'cancelled' | 'checkedIn';

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  })
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

  @Column('uuid', { nullable: true })
  paymentId?: string;

  @Column('text', { nullable: true })
  qrCode?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  finalAmount: number;

  @Column('jsonb')
  customFieldValues: Record<string, any>;

  @Column('jsonb', { default: {} })
  ticketSelections: Array<{
    ticketTypeId: string;
    quantity: number;
    price: number;
  }>;

  @Column('timestamp', { nullable: true })
  checkedInAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'paymentId' })
  payment?: Payment;
}