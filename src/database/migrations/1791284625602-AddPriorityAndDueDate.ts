import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriorityAndDueDate1791284625602 implements MigrationInterface {
    name = 'AddPriorityAndDueDate1791284625602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."todos_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
        await queryRunner.query(`ALTER TABLE "todos" ADD "priority" "public"."todos_priority_enum" NOT NULL DEFAULT 'MEDIUM'`);
        await queryRunner.query(`ALTER TABLE "todos" ADD "due_date" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "due_date"`);
        await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."todos_priority_enum"`);
    }

}
