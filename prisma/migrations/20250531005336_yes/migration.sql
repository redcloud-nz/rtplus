/*
  Warnings:

  - The values [Created] on the enum `PersonOnboardingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Deleted] on the enum `RecordStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PersonOnboardingStatus_new" AS ENUM ('NotStarted', 'Invited', 'Complete');
ALTER TABLE "personnel" ALTER COLUMN "onboarding_status" DROP DEFAULT;
ALTER TABLE "personnel" ALTER COLUMN "onboarding_status" TYPE "PersonOnboardingStatus_new" USING ("onboarding_status"::text::"PersonOnboardingStatus_new");
ALTER TYPE "PersonOnboardingStatus" RENAME TO "PersonOnboardingStatus_old";
ALTER TYPE "PersonOnboardingStatus_new" RENAME TO "PersonOnboardingStatus";
DROP TYPE "PersonOnboardingStatus_old";
ALTER TABLE "personnel" ALTER COLUMN "onboarding_status" SET DEFAULT 'NotStarted';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "RecordStatus_new" AS ENUM ('Active', 'Inactive');
ALTER TABLE "personnel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "skill_groups" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "skill_packages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "skills" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "team_d4h_info" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "team_memberships" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "teams" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "personnel" ALTER COLUMN "status" TYPE "RecordStatus_new" USING ("status"::text::"RecordStatus_new");
ALTER TABLE "skills" ALTER COLUMN "status" TYPE "RecordStatus_new" USING ("status"::text::"RecordStatus_new");
ALTER TABLE "skill_groups" ALTER COLUMN "status" TYPE "RecordStatus_new" USING ("status"::text::"RecordStatus_new");
ALTER TABLE "skill_packages" ALTER COLUMN "status" TYPE "RecordStatus_new" USING ("status"::text::"RecordStatus_new");
ALTER TABLE "teams" ALTER COLUMN "status" TYPE "RecordStatus_new" USING ("status"::text::"RecordStatus_new");
ALTER TABLE "team_d4h_info" ALTER COLUMN "status" TYPE "RecordStatus_new" USING ("status"::text::"RecordStatus_new");
ALTER TABLE "team_memberships" ALTER COLUMN "status" TYPE "RecordStatus_new" USING ("status"::text::"RecordStatus_new");
ALTER TYPE "RecordStatus" RENAME TO "RecordStatus_old";
ALTER TYPE "RecordStatus_new" RENAME TO "RecordStatus";
DROP TYPE "RecordStatus_old";
ALTER TABLE "personnel" ALTER COLUMN "status" SET DEFAULT 'Active';
ALTER TABLE "skill_groups" ALTER COLUMN "status" SET DEFAULT 'Active';
ALTER TABLE "skill_packages" ALTER COLUMN "status" SET DEFAULT 'Active';
ALTER TABLE "skills" ALTER COLUMN "status" SET DEFAULT 'Active';
ALTER TABLE "team_d4h_info" ALTER COLUMN "status" SET DEFAULT 'Active';
ALTER TABLE "team_memberships" ALTER COLUMN "status" SET DEFAULT 'Active';
ALTER TABLE "teams" ALTER COLUMN "status" SET DEFAULT 'Active';
COMMIT;
