import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Payment } from './payment.entity';

@Entity('payment_transactions')
@Index(['paymentId'])
@Index(['type'])
@Index(['status'])
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_id', type: 'uuid' })
  @Index()
  paymentId: string; // References Payment entity

  @ManyToOne(() => Payment, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ type: 'varchar', length: 50 })
  type: 'charge' | 'refund' | 'partial_refund' | 'chargeback';

  @Column({ 
    type: 'varchar',
    length: 50,
    default: 'pending'
  })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'provider_transaction_id', type: 'varchar', length: 500, nullable: true })
  providerTransactionId?: string;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  providerResponse?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}