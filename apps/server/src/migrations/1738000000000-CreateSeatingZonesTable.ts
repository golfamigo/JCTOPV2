import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeatingZonesTable1738000000000 implements MigrationInterface {
  name = 'CreateSeatingZonesTable1738000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create seating_zones table
    await queryRunner.query(`
      CREATE TABLE "seating_zones" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "event_id" UUID NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
        "name" VARCHAR(255) NOT NULL,
        "capacity" INTEGER NOT NULL,
        "description" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_seating_zone_event_id" ON "seating_zones" ("event_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_seating_zone_event_id"`);
    
    // Drop seating_zones table
    await queryRunner.query(`DROP TABLE "seating_zones"`);
  }
}