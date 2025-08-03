import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../../../entities/user.entity';

@Entity('payment_providers')
@Index(['organizerId'])
@Index(['providerId'])
@Index(['organizerId', 'isActive'])
@Index(['organizerId', 'isDefault'])
@Unique(['organizerId', 'providerId']) // One config per provider per organizer
export class PaymentProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organizer_id', type: 'uuid' })
  @Index()
  organizerId: string; // Which organizer owns this configuration

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ name: 'provider_id', type: 'varchar', length: 50 })
  providerId: string; // 'ecpay', 'stripe', 'paypal', etc.

  @Column({ name: 'provider_name', type: 'varchar', length: 100 })
  providerName: string; // Display name

  @Column({ type: 'text' })
  credentials: string; // Encrypted JSON of provider-specific credentials

  @Column({ type: 'jsonb', default: {} })
  configuration: Record<string, any>; // Provider-specific settings

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean; // Organizer's default payment provider

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}