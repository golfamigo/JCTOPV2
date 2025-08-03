import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVenuesTable1735000000000 implements MigrationInterface {
  name = 'CreateVenuesTable1735000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create venues table
    await queryRunner.query(`
      CREATE TABLE "venues" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "address" TEXT,
        "city" VARCHAR(255),
        "capacity" INTEGER NOT NULL DEFAULT 0,
        "description" TEXT,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_venue_city" ON "venues" ("city")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_venue_city"`);
    
    // Drop venues table
    await queryRunner.query(`DROP TABLE "venues"`);
  }
}