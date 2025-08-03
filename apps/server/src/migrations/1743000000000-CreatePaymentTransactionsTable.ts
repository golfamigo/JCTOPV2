import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentTransactionsTable1743000000000 implements MigrationInterface {
  name = 'CreatePaymentTransactionsTable1743000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payment_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'payment_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'provider_transaction_id',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'provider_response',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['payment_id'],
            referencedTableName: 'payments',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes  
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_payment_id" ON "payment_transactions" ("payment_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_type" ON "payment_transactions" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_transactions_status" ON "payment_transactions" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payment_transactions');
  }
}