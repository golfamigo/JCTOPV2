import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCheckedInAtToRegistrations1234567890123 implements MigrationInterface {
  name = 'AddCheckedInAtToRegistrations1234567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'registrations',
      new TableColumn({
        name: 'checkedInAt',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('registrations', 'checkedInAt');
  }
}