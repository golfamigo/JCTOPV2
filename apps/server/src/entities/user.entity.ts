import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User as UserInterface } from '@jctop-event/shared-types';

@Entity('users')
export class User implements UserInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true, name: 'google_id' })
  googleId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, name: 'auth_provider' })
  authProvider: 'email' | 'google' | 'line' | 'apple';

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}