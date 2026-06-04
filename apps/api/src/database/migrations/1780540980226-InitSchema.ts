import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1780540980226 implements MigrationInterface {
  name = 'InitSchema1780540980226';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "campaigns" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "startDate" date NOT NULL, "endDate" date NOT NULL, "adSpend" numeric(14,2) NOT NULL, "platformReportedRevenue" numeric(14,2) NOT NULL, CONSTRAINT "PK_831e3fcd4fc45b4e4c3f57a9ee4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_campaign_business" ON "campaigns"  ("businessId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "externalId" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying, "phone" character varying, CONSTRAINT "uq_contact_business_external" UNIQUE ("businessId", "externalId"), CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "sales" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "contactId" uuid NOT NULL, "amount" numeric(14,2) NOT NULL, "soldAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_sale_contact" ON "sales"  ("businessId", "contactId", "soldAt") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attribution_credits_model_enum" AS ENUM('linear', 'time_decay', 'position_based')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attribution_credits_audienceorigin_enum" AS ENUM('fria', 'warm', 'base_propia')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."attribution_credits_channel_enum" AS ENUM('meta', 'google', 'tiktok', 'email', 'whatsapp', 'organico')`,
    );
    await queryRunner.query(
      `CREATE TABLE "attribution_credits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "saleId" uuid NOT NULL, "touchpointId" uuid NOT NULL, "campaignId" uuid, "model" "public"."attribution_credits_model_enum" NOT NULL, "audienceOrigin" "public"."attribution_credits_audienceorigin_enum" NOT NULL, "channel" "public"."attribution_credits_channel_enum" NOT NULL, "soldAt" TIMESTAMP WITH TIME ZONE NOT NULL, "creditAmount" numeric(14,2) NOT NULL, "attributionWindowDays" integer NOT NULL, CONSTRAINT "PK_3e774fec609ab55c733e7473a72" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_credit_filters" ON "attribution_credits"  ("businessId", "model", "soldAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_credit_report" ON "attribution_credits"  ("businessId", "model", "campaignId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."touchpoints_channel_enum" AS ENUM('meta', 'google', 'tiktok', 'email', 'whatsapp', 'organico')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."touchpoints_audienceorigin_enum" AS ENUM('fria', 'warm', 'base_propia')`,
    );
    await queryRunner.query(
      `CREATE TABLE "touchpoints" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "businessId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "contactId" uuid NOT NULL, "campaignId" uuid, "channel" "public"."touchpoints_channel_enum" NOT NULL, "audienceOrigin" "public"."touchpoints_audienceorigin_enum" NOT NULL, "occurredAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_dbfb9c44f3527f036559d3258ff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_touchpoint_path" ON "touchpoints"  ("businessId", "contactId", "occurredAt") `,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" ADD CONSTRAINT "FK_caaf60d4c6fa08134bc08e83a93" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "touchpoints" ADD CONSTRAINT "FK_8a06fe2cea48cd23ba073af8ab4" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "touchpoints" ADD CONSTRAINT "FK_eee93b0a81593f9e5cb06d7eb3c" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "touchpoints" DROP CONSTRAINT "FK_eee93b0a81593f9e5cb06d7eb3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "touchpoints" DROP CONSTRAINT "FK_8a06fe2cea48cd23ba073af8ab4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sales" DROP CONSTRAINT "FK_caaf60d4c6fa08134bc08e83a93"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_touchpoint_path"`);
    await queryRunner.query(`DROP TABLE "touchpoints"`);
    await queryRunner.query(
      `DROP TYPE "public"."touchpoints_audienceorigin_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."touchpoints_channel_enum"`);
    await queryRunner.query(`DROP INDEX "public"."idx_credit_report"`);
    await queryRunner.query(`DROP INDEX "public"."idx_credit_filters"`);
    await queryRunner.query(`DROP TABLE "attribution_credits"`);
    await queryRunner.query(
      `DROP TYPE "public"."attribution_credits_channel_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."attribution_credits_audienceorigin_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."attribution_credits_model_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_sale_contact"`);
    await queryRunner.query(`DROP TABLE "sales"`);
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP INDEX "public"."idx_campaign_business"`);
    await queryRunner.query(`DROP TABLE "campaigns"`);
  }
}
