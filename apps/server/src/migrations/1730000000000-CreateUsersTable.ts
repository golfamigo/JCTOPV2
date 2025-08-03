import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1730000000000 implements MigrationInterface {
  name = 'CreateUsersTable1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID generation extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" VARCHAR(255) NOT NULL,
        "email" VARCHAR(255) UNIQUE NOT NULL,
        "password_hash" VARCHAR(255),
        "auth_provider" VARCHAR(50) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_user_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_user_auth_provider" ON "users" ("auth_provider")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_auth_provider"`);
    await queryRunner.query(`DROP INDEX "IDX_user_email"`);
    
    // Drop users table
    await queryRunner.query(`DROP TABLE "users"`);
  }
}