import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetTokensTable1733000000000 implements MigrationInterface {
  name = 'CreatePasswordResetTokensTable1733000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create password_reset_tokens table
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token" VARCHAR(64) NOT NULL UNIQUE,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_password_reset_token_user_id" ON "password_reset_tokens" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_password_reset_token_token" ON "password_reset_tokens" ("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_password_reset_token_expires_at" ON "password_reset_tokens" ("expires_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_password_reset_token_expires_at"`);
    await queryRunner.query(`DROP INDEX "IDX_password_reset_token_token"`);
    await queryRunner.query(`DROP INDEX "IDX_password_reset_token_user_id"`);
    
    // Drop password_reset_tokens table
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
  }
}