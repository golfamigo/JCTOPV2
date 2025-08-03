import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../entities/user.entity';

@Entity('payments')
@Index(['organizerId'])
@Index(['resourceType', 'resourceId'])
@Index(['providerId'])
@Index(['merchantTradeNo'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizer_id', type: 'uuid' })
  @Index()
  organizerId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ name: 'resource_type', type: 'varchar', length: 50 })
  resourceType: string; // 'event', 'subscription', 'marketplace', etc.

  @Column({ name: 'resource_id', type: 'uuid' })
  resourceId: string; // event ID, subscription ID, etc.

  @Column({ name: 'provider_id', type: 'varchar', length: 50 })
  providerId: string; // Which payment provider was used

  @Column({ name: 'provider_transaction_id', type: 'varchar', length: 500, nullable: true })
  providerTransactionId?: string; // Provider's transaction ID

  @Column({ name: 'merchant_trade_no', type: 'varchar', length: 255, unique: true })
  merchantTradeNo: string; // Our internal transaction number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0, nullable: true })
  discountAmount?: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @Column({ type: 'varchar', length: 3, default: 'TWD' })
  currency: string;

  @Column({ name: 'payment_method', type: 'varchar', length: 100 })
  paymentMethod: string; // Provider-specific payment method

  @Column({ 
    type: 'varchar',
    length: 50,
    default: 'pending'
  })
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse?: Record<string, any>; // Provider's response data

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>; // Additional context (customer info, etc.)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}