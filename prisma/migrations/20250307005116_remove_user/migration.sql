/*
  Warnings:

  - You are about to drop the column `user_id` on the `SkillCheckSession` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `skill_checks` table. All the data in the column will be lost.
  - You are about to drop the `user_policy_acceptances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users_change_log` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clerk_user_id]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `onboarding_status` to the `personnel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NotStarted', 'Invited', 'Decline', 'Complete');

-- DropForeignKey
ALTER TABLE "SkillCheckSession" DROP CONSTRAINT "SkillCheckSession_user_id_fkey";

-- DropForeignKey
ALTER TABLE "personnel_change_log" DROP CONSTRAINT "personnel_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "teams_change_log" DROP CONSTRAINT "teams_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "user_policy_acceptances" DROP CONSTRAINT "user_policy_acceptances_user_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_person_id_fkey";

-- DropForeignKey
ALTER TABLE "users_change_log" DROP CONSTRAINT "users_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "users_change_log" DROP CONSTRAINT "users_change_log_user_id_fkey";

-- AlterTable
ALTER TABLE "SkillCheckSession" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "personnel" ADD COLUMN     "clerk_user_id" VARCHAR(50),
ADD COLUMN     "onboarding_status" "OnboardingStatus" NOT NULL,
ADD COLUMN     "systemPermissions" TEXT[];

-- AlterTable
ALTER TABLE "skill_checks" DROP COLUMN "user_id";

-- DropTable
DROP TABLE "user_policy_acceptances";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "users_change_log";

-- DropEnum
DROP TYPE "UserChangeEvent";

-- DropEnum
DROP TYPE "UserOnboardingStatus";

-- CreateTable
CREATE TABLE "policy_acceptances" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "policy_key" VARCHAR(50) NOT NULL,
    "policy_version" INTEGER NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "personnel_clerk_user_id_key" ON "personnel"("clerk_user_id");

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_acceptances" ADD CONSTRAINT "policy_acceptances_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permissions" ADD CONSTRAINT "team_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
