import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTodosTable1791266980241 implements MigrationInterface {
    name = 'CreateTodosTable1791266980241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "todos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(80) NOT NULL, "description" text NOT NULL DEFAULT '', "completed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ca8cafd59ca6faaf67995344225" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "todos"`);
    }

}
