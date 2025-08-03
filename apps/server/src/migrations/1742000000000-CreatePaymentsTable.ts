import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentsTable1742000000000 implements MigrationInterface {
  name = 'CreatePaymentsTable1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'organizer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'resource_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'resource_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'provider_id',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'provider_transaction_id',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'merchant_trade_no',
            type: 'varchar',
            length: '255',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'discount_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
            isNullable: true,
          },
          {
            name: 'final_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '3',
            default: "'TWD'",
          },
          {
            name: 'payment_method',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
          },
          {
            name: 'provider_response',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            default: "'{}'",
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
            columnNames: ['organizer_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_payments_organizer_id" ON "payments" ("organizer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_resource" ON "payments" ("resource_type", "resource_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_provider_id" ON "payments" ("provider_id")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_payments_merchant_trade_no" ON "payments" ("merchant_trade_no")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_status" ON "payments" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_payments_created_at" ON "payments" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payments');
  }
}