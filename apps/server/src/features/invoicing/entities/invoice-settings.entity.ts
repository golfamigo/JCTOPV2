import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { Event } from '../../../entities/event.entity';

@Entity('invoice_settings')
@Unique(['eventId'])
@Index('idx_invoice_settings_event', ['eventId'])
export class InvoiceSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id' })
  eventId: string;

  @Column({ name: 'company_name', nullable: true })
  companyName?: string;

  @Column({ name: 'company_address', type: 'text', nullable: true })
  companyAddress?: string;

  @Column({ name: 'tax_number', nullable: true })
  taxNumber?: string;

  @Column({ name: 'invoice_prefix', nullable: true })
  invoicePrefix?: string;

  @Column({ name: 'invoice_footer', type: 'text', nullable: true })
  invoiceFooter?: string;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}