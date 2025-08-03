import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategoriesTable1734000000000 implements MigrationInterface {
  name = 'CreateCategoriesTable1734000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL UNIQUE,
        "description" TEXT,
        "color" VARCHAR(7) NOT NULL DEFAULT '#6366f1',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_category_name" ON "categories" ("name")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_category_name"`);
    
    // Drop categories table
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}