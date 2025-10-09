/*
  Warnings:

  - The values [Complete,Discard] on the enum `SkillCheckSessionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Complete,Discard] on the enum `SkillCheckStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `clerk_invitation_id` on the `team_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `clerk_membership_id` on the `team_memberships` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."SkillCheckSessionStatus_new" AS ENUM ('Draft', 'Include', 'Exclude');
ALTER TABLE "public"."skill_check_sessions" ALTER COLUMN "sessionStatus" DROP DEFAULT;
ALTER TABLE "public"."skill_check_sessions" ALTER COLUMN "sessionStatus" TYPE "public"."SkillCheckSessionStatus_new" USING ("sessionStatus"::text::"public"."SkillCheckSessionStatus_new");
ALTER TYPE "public"."SkillCheckSessionStatus" RENAME TO "SkillCheckSessionStatus_old";
ALTER TYPE "public"."SkillCheckSessionStatus_new" RENAME TO "SkillCheckSessionStatus";
DROP TYPE "public"."SkillCheckSessionStatus_old";
ALTER TABLE "public"."skill_check_sessions" ALTER COLUMN "sessionStatus" SET DEFAULT 'Draft';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."SkillCheckStatus_new" AS ENUM ('Draft', 'Include', 'Exclude');
ALTER TABLE "public"."skill_checks" ALTER COLUMN "checkStatus" DROP DEFAULT;
ALTER TABLE "public"."skill_checks" ALTER COLUMN "checkStatus" TYPE "public"."SkillCheckStatus_new" USING ("checkStatus"::text::"public"."SkillCheckStatus_new");
ALTER TYPE "public"."SkillCheckStatus" RENAME TO "SkillCheckStatus_old";
ALTER TYPE "public"."SkillCheckStatus_new" RENAME TO "SkillCheckStatus";
DROP TYPE "public"."SkillCheckStatus_old";
ALTER TABLE "public"."skill_checks" ALTER COLUMN "checkStatus" SET DEFAULT 'Draft';
COMMIT;

-- DropIndex
DROP INDEX "public"."team_memberships_clerk_invitation_id_key";

-- DropIndex
DROP INDEX "public"."team_memberships_clerk_membership_id_key";

-- AlterTable
ALTER TABLE "public"."notes" ADD COLUMN     "properties" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."personnel" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."team_memberships" DROP COLUMN "clerk_invitation_id",
DROP COLUMN "clerk_membership_id";

-- AlterTable
ALTER TABLE "public"."teams" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- DropEnum
DROP TYPE "public"."PersonType";

-- CreateTable
CREATE TABLE "public"."organizations" (
    "org_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("org_id")
);

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personnel" ADD CONSTRAINT "personnel_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_checks" ADD CONSTRAINT "skill_checks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_check_sessions" ADD CONSTRAINT "skill_check_sessions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_packages" ADD CONSTRAINT "skill_packages_owner_org_id_fkey" FOREIGN KEY ("owner_org_id") REFERENCES "public"."organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;
