/*
  Warnings:

  - You are about to drop the column `sequence` on the `skill_packages` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."OrganizationChangeEvent" AS ENUM ('SkillPackageSubscribe', 'SkillPackageUnsubscribe');

-- AlterEnum
ALTER TYPE "public"."RecordStatus" ADD VALUE 'Deleted';

-- AlterTable
ALTER TABLE "public"."skill_packages" DROP COLUMN "sequence",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."organizations_change_log" (
    "entry_id" TEXT NOT NULL,
    "org_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50),
    "event" "public"."OrganizationChangeEvent" NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_change_log_pkey" PRIMARY KEY ("entry_id")
);

-- CreateTable
CREATE TABLE "public"."skill_package_subscriptions" (
    "subscription_id" VARCHAR(32) NOT NULL,
    "org_id" VARCHAR(50) NOT NULL,
    "skill_package_id" VARCHAR(32) NOT NULL,
    "status" "public"."RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skill_package_subscriptions_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "public"."skill_package_subscription_groups" (
    "subscription_id" VARCHAR(32) NOT NULL,
    "skill_group_id" VARCHAR(32) NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "skill_package_subscription_groups_pkey" PRIMARY KEY ("subscription_id","skill_group_id")
);

-- AddForeignKey
ALTER TABLE "public"."organizations_change_log" ADD CONSTRAINT "organizations_change_log_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizations_change_log" ADD CONSTRAINT "organizations_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_package_subscriptions" ADD CONSTRAINT "skill_package_subscriptions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_package_subscriptions" ADD CONSTRAINT "skill_package_subscriptions_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "public"."skill_packages"("skill_package_id") ON DELETE CASCADE ON UPDATE CASCADE;
