/*
  Warnings:

  - Added the required column `onboarding_status` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserOnboardingStatus" AS ENUM ('NotStarted', 'Invited', 'Decline', 'Complete');

-- DropForeignKey
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_team_id_fkey";

-- DropForeignKey
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_user_id_fkey";

-- DropForeignKey
ALTER TABLE "personnel_change_log" DROP CONSTRAINT "personnel_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "personnel_change_log" DROP CONSTRAINT "personnel_change_log_person_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_assessee_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "users_change_log" DROP CONSTRAINT "users_change_log_actor_id_fkey";

-- AlterTable
ALTER TABLE "personnel_change_log" ALTER COLUMN "actor_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "skill_packages_change_log" ALTER COLUMN "actor_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboarding_status" "UserOnboardingStatus" NOT NULL;

-- AlterTable
ALTER TABLE "users_change_log" ALTER COLUMN "actor_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "user_policy_acceptances" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "policy_key" VARCHAR(50) NOT NULL,
    "policy_version" INTEGER NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_policy_acceptances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "d4h_access_keys" ADD CONSTRAINT "d4h_access_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "d4h_access_keys" ADD CONSTRAINT "d4h_access_keys_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessee_id_fkey" FOREIGN KEY ("assessee_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_change_log" ADD CONSTRAINT "users_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_policy_acceptances" ADD CONSTRAINT "user_policy_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
