import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneToUsers1731000000000 implements MigrationInterface {
  name = 'AddPhoneToUsers1731000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add phone column to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "phone" VARCHAR(20)
    `);

    // Create index on phone field for performance
    await queryRunner.query(`CREATE INDEX "IDX_user_phone" ON "users" ("phone")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop phone index
    await queryRunner.query(`DROP INDEX "IDX_user_phone"`);
    
    // Remove phone column from users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "phone"
    `);
  }
}