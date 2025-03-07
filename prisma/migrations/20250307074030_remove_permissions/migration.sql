/*
  Warnings:

  - You are about to drop the column `onboarding_status` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the `policy_acceptances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "policy_acceptances" DROP CONSTRAINT "policy_acceptances_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_user_id_fkey";

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "onboarding_status";

-- DropTable
DROP TABLE "policy_acceptances";

-- DropTable
DROP TABLE "team_permissions";

-- DropEnum
DROP TYPE "OnboardingStatus";
