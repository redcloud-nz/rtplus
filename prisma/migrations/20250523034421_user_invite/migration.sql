/*
  Warnings:

  - The values [InProgress] on the enum `PersonOnboardingStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[clerk_invitation_id]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PersonOnboardingStatus_new" AS ENUM ('NotStarted', 'Invited', 'Created', 'Complete');
ALTER TABLE "personnel" ALTER COLUMN "onboarding_status" DROP DEFAULT;
ALTER TABLE "personnel" ALTER COLUMN "onboarding_status" TYPE "PersonOnboardingStatus_new" USING ("onboarding_status"::text::"PersonOnboardingStatus_new");
ALTER TYPE "PersonOnboardingStatus" RENAME TO "PersonOnboardingStatus_old";
ALTER TYPE "PersonOnboardingStatus_new" RENAME TO "PersonOnboardingStatus";
DROP TYPE "PersonOnboardingStatus_old";
ALTER TABLE "personnel" ALTER COLUMN "onboarding_status" SET DEFAULT 'NotStarted';
COMMIT;

-- AlterTable
ALTER TABLE "personnel" ADD COLUMN     "clerk_invitation_id" VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "personnel_clerk_invitation_id_key" ON "personnel"("clerk_invitation_id");
