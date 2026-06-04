import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActionCenter1780594512831 implements MigrationInterface {
  name = 'ActionCenter1780594512831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."recommendations_type_enum" AS ENUM('pause_low_roas', 'scale_best_origin', 'review_reconciliation')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."recommendations_status_enum" AS ENUM('pending', 'accepted', 'dismissed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "recommendations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "type" "public"."recommendations_type_enum" NOT NULL, "ruleKey" character varying NOT NULL, "title" character varying NOT NULL, "context" jsonb NOT NULL, "suggestedOwner" character varying NOT NULL, "suggestedDate" date NOT NULL, "cta" character varying NOT NULL, "status" "public"."recommendations_status_enum" NOT NULL DEFAULT 'pending', CONSTRAINT "uq_recommendation_business_key" UNIQUE ("businessId", "ruleKey"), CONSTRAINT "PK_23a8d2db26db8cabb6ae9d6cd87" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_recommendation_status" ON "recommendations"  ("businessId", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_status_enum" AS ENUM('open', 'done')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recommendationId" uuid NOT NULL, "title" character varying NOT NULL, "context" jsonb NOT NULL, "owner" character varying NOT NULL, "dueDate" date NOT NULL, "cta" character varying NOT NULL, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'open', "completedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_task_status" ON "tasks"  ("businessId", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_be38f32b3d11e2ba68e8d893187" FOREIGN KEY ("recommendationId") REFERENCES "recommendations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_be38f32b3d11e2ba68e8d893187"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_task_status"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_recommendation_status"`);
    await queryRunner.query(`DROP TABLE "recommendations"`);
    await queryRunner.query(`DROP TYPE "public"."recommendations_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."recommendations_type_enum"`);
  }
}
