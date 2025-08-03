import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateInvoiceSettingsTable1744000000000 implements MigrationInterface {
    name = 'CreateInvoiceSettingsTable1744000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "invoice_settings",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "uuid",
                    },
                    {
                        name: "event_id",
                        type: "uuid",
                        isUnique: true,
                    },
                    {
                        name: "company_name",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "company_address",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "tax_number",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                    },
                    {
                        name: "invoice_prefix",
                        type: "varchar",
                        length: "50",
                        isNullable: true,
                    },
                    {
                        name: "invoice_footer",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "custom_fields",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamptz",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamptz",
                        default: "now()",
                    },
                ],
                foreignKeys: [
                    {
                        columnNames: ["event_id"],
                        referencedTableName: "events",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE",
                    },
                ],
            }),
            true
        );

        await queryRunner.createIndex(
            "invoice_settings",
            new TableIndex({
                name: "idx_invoice_settings_event",
                columnNames: ["event_id"],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("invoice_settings");
    }
}