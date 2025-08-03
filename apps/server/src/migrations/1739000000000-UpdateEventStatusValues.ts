import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEventStatusValues1739000000000 implements MigrationInterface {
  name = 'UpdateEventStatusValues1739000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add check constraint for valid status values
    await queryRunner.query(`
      ALTER TABLE "events" 
      ADD CONSTRAINT "CHK_event_status_valid" 
      CHECK (status IN ('draft', 'published', 'unpublished', 'paused', 'ended'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove check constraint
    await queryRunner.query(`
      ALTER TABLE "events" 
      DROP CONSTRAINT "CHK_event_status_valid"
    `);
  }
}