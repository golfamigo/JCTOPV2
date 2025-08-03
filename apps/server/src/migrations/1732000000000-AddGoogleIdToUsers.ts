import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleIdToUsers1732000000000 implements MigrationInterface {
  name = 'AddGoogleIdToUsers1732000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "google_id" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_google_id" UNIQUE ("google_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_google_id" ON "users" ("google_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_google_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
  }
}