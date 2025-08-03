import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CustomRegistrationField as CustomRegistrationFieldInterface } from '@jctop-event/shared-types';
import { Event } from './event.entity';

@Entity('custom_registration_fields')
export class CustomRegistrationField implements CustomRegistrationFieldInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'event_id' })
  eventId: string;

  @Column({ type: 'varchar', length: 255, name: 'field_name' })
  fieldName: string;

  @Column({ type: 'varchar', length: 50, name: 'field_type' })
  fieldType: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'textarea';

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  placeholder?: string;

  @Column({ type: 'boolean', default: false })
  required: boolean;

  @Column({ type: 'jsonb', nullable: true })
  options?: string[];

  @Column({ type: 'jsonb', nullable: true, name: 'validation_rules' })
  validationRules?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };

  @Column({ type: 'integer', default: 0 })
  order: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;
}