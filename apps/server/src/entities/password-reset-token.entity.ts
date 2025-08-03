import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PasswordResetToken as PasswordResetTokenInterface } from '@jctop-event/shared-types';
import { User } from './user.entity';

@Entity('password_reset_tokens')
@Index(['token'])
@Index(['userId'])
@Index(['expiresAt'])
export class PasswordResetToken implements PasswordResetTokenInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  token: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}