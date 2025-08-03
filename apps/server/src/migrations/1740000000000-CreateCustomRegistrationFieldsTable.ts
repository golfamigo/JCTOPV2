import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomRegistrationFieldsTable1740000000000 implements MigrationInterface {
  name = 'CreateCustomRegistrationFieldsTable1740000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create custom_registration_fields table
    await queryRunner.query(`
      CREATE TABLE "custom_registration_fields" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "field_name" VARCHAR(255) NOT NULL,
        "field_type" VARCHAR(50) NOT NULL,
        "label" VARCHAR(255) NOT NULL,
        "placeholder" VARCHAR(255),
        "required" BOOLEAN NOT NULL DEFAULT false,
        "options" JSONB,
        "validation_rules" JSONB,
        "order" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_custom_registration_field_event_id" ON "custom_registration_fields" ("event_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_custom_registration_field_event_order" ON "custom_registration_fields" ("event_id", "order")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_custom_registration_field_event_order"`);
    await queryRunner.query(`DROP INDEX "IDX_custom_registration_field_event_id"`);
    
    // Drop custom_registration_fields table
    await queryRunner.query(`DROP TABLE "custom_registration_fields"`);
  }
}