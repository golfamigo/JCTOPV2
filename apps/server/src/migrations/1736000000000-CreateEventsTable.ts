import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsTable1736000000000 implements MigrationInterface {
  name = 'CreateEventsTable1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create events table
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "organizer_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
        "venue_id" UUID NOT NULL REFERENCES "venues"("id") ON DELETE RESTRICT,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "start_date" TIMESTAMPTZ NOT NULL,
        "end_date" TIMESTAMPTZ NOT NULL,
        "location" TEXT,
        "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_event_organizer_id" ON "events" ("organizer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_category_id" ON "events" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_venue_id" ON "events" ("venue_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_status" ON "events" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_event_start_date" ON "events" ("start_date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_event_start_date"`);
    await queryRunner.query(`DROP INDEX "IDX_event_status"`);
    await queryRunner.query(`DROP INDEX "IDX_event_venue_id"`);
    await queryRunner.query(`DROP INDEX "IDX_event_category_id"`);
    await queryRunner.query(`DROP INDEX "IDX_event_organizer_id"`);
    
    // Drop events table
    await queryRunner.query(`DROP TABLE "events"`);
  }
}