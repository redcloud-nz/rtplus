/*
  Warnings:

  - You are about to drop the column `status` on the `SkillCheckSession` table. All the data in the column will be lost.
  - You are about to drop the column `owner_id` on the `d4h_access_keys` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `d4h_access_keys` table. All the data in the column will be lost.
  - You are about to drop the column `clerk_user_id` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `skill_groups` table. All the data in the column will be lost.
  - You are about to drop the column `package_id` on the `skill_groups` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `skill_groups` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `skill_packages` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `skill_packages` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `package_id` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `team_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `team_memberships` table. All the data in the column will be lost.
  - The primary key for the `team_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `person_id` on the `team_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `d4h_api_url` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `d4h_team_id` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `d4h_web_url` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the `history_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_permissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `SkillCheckSession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `skill_checks` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `competence_level` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `skill_package_id` to the `skill_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill_package_id` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `d4h_status` on the `team_memberships_d4h_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `user_id` to the `team_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PersonChangeEvent" AS ENUM ('Create', 'Update', 'Delete');

-- CreateEnum
CREATE TYPE "SkillCheckCompetenceLevel" AS ENUM ('NotAssessed', 'NotTaught', 'NotCompetent', 'Competent', 'HighlyConfident');

-- CreateEnum
CREATE TYPE "SkillCheckStatus" AS ENUM ('Draft', 'Complete', 'Discard');

-- CreateEnum
CREATE TYPE "SkillPackageChangeEvent" AS ENUM ('Create', 'Delete', 'Update', 'CreateSkill', 'DeleteSkill', 'UpdateSkill', 'CreateGroup', 'DeleteGroup', 'UpdateGroup');

-- CreateEnum
CREATE TYPE "TeamChangeEvent" AS ENUM ('Create', 'Delete', 'Update', 'AddMember', 'UpdateMember', 'RemoveMember');

-- CreateEnum
CREATE TYPE "TeamMembershipD4hStatus" AS ENUM ('Operational', 'NonOperational', 'Observer', 'Retired');

-- CreateEnum
CREATE TYPE "UserChangeEvent" AS ENUM ('Create', 'Update', 'Delete', 'AddPermission', 'RemovePermission');

-- AlterEnum
ALTER TYPE "RecordStatus" ADD VALUE 'Deleted';

-- DropForeignKey
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "history_events" DROP CONSTRAINT "history_events_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_package_id_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_package_id_fkey";

-- DropForeignKey
ALTER TABLE "system_permissions" DROP CONSTRAINT "system_permissions_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_person_id_fkey";

-- DropIndex
DROP INDEX "personnel_clerk_user_id_key";

-- AlterTable
ALTER TABLE "SkillCheckSession" DROP COLUMN "status",
ADD COLUMN     "sessionStatus" "SkillCheckSessionStatus" NOT NULL DEFAULT 'Draft',
ADD COLUMN     "user_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "d4h_access_keys" DROP COLUMN "owner_id",
DROP COLUMN "updated_at",
ADD COLUMN     "user_id" UUID;

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "clerk_user_id",
DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "skill_checks" ADD COLUMN     "user_id" UUID NOT NULL,
DROP COLUMN "competence_level",
ADD COLUMN     "competence_level" "SkillCheckCompetenceLevel" NOT NULL;

-- AlterTable
ALTER TABLE "skill_groups" DROP COLUMN "created_at",
DROP COLUMN "package_id",
DROP COLUMN "updated_at",
ADD COLUMN     "skill_package_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "skill_packages" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "skills" DROP COLUMN "created_at",
DROP COLUMN "package_id",
DROP COLUMN "updated_at",
ADD COLUMN     "skill_package_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "team_memberships" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "team_memberships_d4h_info" DROP COLUMN "d4h_status",
ADD COLUMN     "d4h_status" "TeamMembershipD4hStatus" NOT NULL;

-- AlterTable
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_pkey",
DROP COLUMN "person_id",
ADD COLUMN     "user_id" UUID NOT NULL,
ADD CONSTRAINT "team_permissions_pkey" PRIMARY KEY ("user_id", "team_id");

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "created_at",
DROP COLUMN "d4h_api_url",
DROP COLUMN "d4h_team_id",
DROP COLUMN "d4h_web_url",
DROP COLUMN "updated_at";

-- DropTable
DROP TABLE "history_events";

-- DropTable
DROP TABLE "system_permissions";

-- DropEnum
DROP TYPE "CompetenceLevel";

-- DropEnum
DROP TYPE "D4hTeamMemberStatus";

-- DropEnum
DROP TYPE "HistoryEventObjectType";

-- DropEnum
DROP TYPE "HistoryEventType";

-- CreateTable
CREATE TABLE "personnel_change_log" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event" "PersonChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personnel_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_packages_change_log" (
    "id" UUID NOT NULL,
    "skill_package_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event" "SkillPackageChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_packages_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams_change_log" (
    "id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event" "TeamChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_d4h_info" (
    "team_id" UUID NOT NULL,
    "d4h_team_id" INTEGER NOT NULL,
    "d4h_api_url" TEXT NOT NULL,
    "d4h_web_url" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active'
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "person_id" UUID,
    "clerk_user_id" VARCHAR(50),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "systemPermissions" TEXT[],
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users_change_log" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event" "UserChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_d4h_info_team_id_key" ON "team_d4h_info"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_person_id_key" ON "users"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- AddForeignKey
ALTER TABLE "d4h_access_keys" ADD CONSTRAINT "d4h_access_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCheckSession" ADD CONSTRAINT "SkillCheckSession_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_d4h_info" ADD CONSTRAINT "team_d4h_info_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permissions" ADD CONSTRAINT "team_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_change_log" ADD CONSTRAINT "users_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
