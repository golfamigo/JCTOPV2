import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTicketTypesTable1737000000000 implements MigrationInterface {
  name = 'CreateTicketTypesTable1737000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ticket_types table
    await queryRunner.query(`
      CREATE TABLE "ticket_types" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "price" DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        "quantity" INTEGER NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_ticket_type_event_id" ON "ticket_types" ("event_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_ticket_type_event_id"`);
    
    // Drop ticket_types table
    await queryRunner.query(`DROP TABLE "ticket_types"`);
  }
}