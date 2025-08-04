import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeCategoryAndVenueOptional1734000001000 implements MigrationInterface {
  name = 'MakeCategoryAndVenueOptional1734000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make category_id and venue_id nullable in events table
    await queryRunner.query(`
      ALTER TABLE "events" 
      ALTER COLUMN "category_id" DROP NOT NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE "events" 
      ALTER COLUMN "venue_id" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert category_id and venue_id to NOT NULL
    await queryRunner.query(`
      ALTER TABLE "events" 
      ALTER COLUMN "category_id" SET NOT NULL
    `);
    
    await queryRunner.query(`
      ALTER TABLE "events" 
      ALTER COLUMN "venue_id" SET NOT NULL
    `);
  }
}