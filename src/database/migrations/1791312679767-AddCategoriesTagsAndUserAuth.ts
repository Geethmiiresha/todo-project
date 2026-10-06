import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoriesTagsAndUserAuth1791312679767 implements MigrationInterface {
    name = 'AddCategoriesTagsAndUserAuth1791312679767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(30) NOT NULL, "color" character varying(20) NOT NULL DEFAULT '#10b981', "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1d8718578ce96a09d1aa2237a14" UNIQUE ("name", "user_id"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "color" character varying(20) NOT NULL DEFAULT '#6366f1', "user_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_48f0690983e955b500b4a3e0293" UNIQUE ("name", "user_id"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "todo_tags" ("todo_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_e9221a8ac3b2a7411a60500a638" PRIMARY KEY ("todo_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_995af982f546b93672fe0ae652" ON "todo_tags"  ("todo_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_425e9a5498a6e434e3c6335b28" ON "todo_tags"  ("tag_id") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD "refresh_token_hash" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_password_token" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "reset_password_expires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "todos" ADD "category_id" uuid`);
        await queryRunner.query(`ALTER TABLE "tags" ADD CONSTRAINT "FK_74603743868d1e4f4fc2c0225b6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "todos" ADD CONSTRAINT "FK_167796433ab8f0897c7e75f08b8" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "todo_tags" ADD CONSTRAINT "FK_995af982f546b93672fe0ae6525" FOREIGN KEY ("todo_id") REFERENCES "todos"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "todo_tags" ADD CONSTRAINT "FK_425e9a5498a6e434e3c6335b289" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "todo_tags" DROP CONSTRAINT "FK_425e9a5498a6e434e3c6335b289"`);
        await queryRunner.query(`ALTER TABLE "todo_tags" DROP CONSTRAINT "FK_995af982f546b93672fe0ae6525"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`);
        await queryRunner.query(`ALTER TABLE "todos" DROP CONSTRAINT "FK_167796433ab8f0897c7e75f08b8"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "FK_74603743868d1e4f4fc2c0225b6"`);
        await queryRunner.query(`ALTER TABLE "todos" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_password_expires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reset_password_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refresh_token_hash"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_425e9a5498a6e434e3c6335b28"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_995af982f546b93672fe0ae652"`);
        await queryRunner.query(`DROP TABLE "todo_tags"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "tags"`);
    }

}
