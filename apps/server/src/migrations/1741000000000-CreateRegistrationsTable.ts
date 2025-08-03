import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateRegistrationsTable1744000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'registrations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
          },
          {
            name: 'eventId',
            type: 'uuid',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['pending', 'paid', 'cancelled', 'checkedIn'],
            default: "'pending'",
          },
          {
            name: 'paymentStatus',
            type: 'enum',
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
            default: "'pending'",
          },
          {
            name: 'paymentId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'qrCode',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'discountAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'finalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'customFieldValues',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'ticketSelections',
            type: 'jsonb',
            default: "'[]'",
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['eventId'],
            referencedTableName: 'events',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['paymentId'],
            referencedTableName: 'payments',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('registrations');
  }
}