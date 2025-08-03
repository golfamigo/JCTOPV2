import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePaymentProvidersTable1741000000000 implements MigrationInterface {
  name = 'CreatePaymentProvidersTable1741000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payment_providers',
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
            name: 'provider_id',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'provider_name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'credentials',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'configuration',
            type: 'jsonb',
            default: "'{}'",
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_default',
            type: 'boolean',
            default: false,
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
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_payment_providers_organizer_id" ON "payment_providers" ("organizer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_providers_provider_id" ON "payment_providers" ("provider_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_providers_organizer_active" ON "payment_providers" ("organizer_id", "is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_payment_providers_organizer_default" ON "payment_providers" ("organizer_id", "is_default")`);
    
    // Create unique constraint for organizer + provider combination
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_payment_providers_organizer_provider" ON "payment_providers" ("organizer_id", "provider_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('payment_providers');
  }
}