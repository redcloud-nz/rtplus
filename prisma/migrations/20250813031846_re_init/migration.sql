/*
  Warnings:

  - The primary key for the `_skill_check_session_to_assessee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_skill_check_session_to_skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `personnel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `personnel` table. All the data in the column will be lost.
  - You are about to alter the column `email` on the `personnel` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `skill_checks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `competence_level` on the `skill_checks` table. All the data in the column will be lost.
  - You are about to drop the column `timestamp` on the `skill_checks` table. All the data in the column will be lost.
  - The `session_id` column on the `skill_checks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `skill_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `skill_groups` table. All the data in the column will be lost.
  - You are about to drop the column `package_id` on the `skill_groups` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `skill_groups` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `skill_groups` table. All the data in the column will be lost.
  - The `parent_id` column on the `skill_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `skill_packages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `skill_packages` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `skill_packages` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `skill_packages` table. All the data in the column will be lost.
  - The primary key for the `skills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `package_id` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `skills` table. All the data in the column will be lost.
  - The primary key for the `team_memberships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `team_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `team_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `team_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `team_membership_id` on the `team_memberships_d4h_info` table. All the data in the column will be lost.
  - The primary key for the `teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `d4h_api_url` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `d4h_team_id` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `d4h_web_url` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `teams` table. All the data in the column will be lost.
  - You are about to alter the column `slug` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to drop the `SkillCheckSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `d4h_access_keys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `history_events` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `system_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_permissions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_invitation_id]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_membership_id]` on the table `team_memberships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_invitation_id]` on the table `team_memberships` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `A` on the `_skill_check_session_to_assessee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_skill_check_session_to_assessee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_skill_check_session_to_skill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_skill_check_session_to_skill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `personnel` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `date` to the `skill_checks` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skill_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assessee_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assessor_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `sequence` to the `skill_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill_package_id` to the `skill_groups` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `skill_groups` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `sequence` to the `skill_packages` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `skill_packages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `sequence` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill_package_id` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `skills` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `skill_group_id` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `person_id` on the `team_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `team_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `person_id` to the `team_memberships_d4h_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_id` to the `team_memberships_d4h_info` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `d4h_status` on the `team_memberships_d4h_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `teams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('None', 'Invited', 'Complete');

-- CreateEnum
CREATE TYPE "PersonChangeEvent" AS ENUM ('Create', 'Update', 'Delete');

-- CreateEnum
CREATE TYPE "SkillCheckSessionEvent" AS ENUM ('Create', 'Update', 'Delete', 'AddAssessee', 'RemoveAssessee', 'AddAssessor', 'RemoveAssessor', 'AddSkill', 'RemoveSkill', 'CreateCheck', 'UpdateCheck', 'DeleteCheck', 'Complete', 'Draft', 'Discard');

-- CreateEnum
CREATE TYPE "SkillCheckStatus" AS ENUM ('Draft', 'Complete', 'Discard');

-- CreateEnum
CREATE TYPE "SkillPackageChangeEvent" AS ENUM ('Create', 'Delete', 'Update', 'CreateSkill', 'DeleteSkill', 'UpdateSkill', 'CreateGroup', 'DeleteGroup', 'UpdateGroup');

-- CreateEnum
CREATE TYPE "TeamChangeEvent" AS ENUM ('Create', 'Delete', 'Update', 'AddMember', 'UpdateMember', 'RemoveMember');

-- CreateEnum
CREATE TYPE "TeamMembershipD4hStatus" AS ENUM ('Operational', 'NonOperational', 'Observer', 'Retired');

-- DropForeignKey
ALTER TABLE "SkillCheckSession" DROP CONSTRAINT "SkillCheckSession_assessor_id_fkey";

-- DropForeignKey
ALTER TABLE "_skill_check_session_to_assessee" DROP CONSTRAINT "_skill_check_session_to_assessee_A_fkey";

-- DropForeignKey
ALTER TABLE "_skill_check_session_to_assessee" DROP CONSTRAINT "_skill_check_session_to_assessee_B_fkey";

-- DropForeignKey
ALTER TABLE "_skill_check_session_to_skill" DROP CONSTRAINT "_skill_check_session_to_skill_A_fkey";

-- DropForeignKey
ALTER TABLE "_skill_check_session_to_skill" DROP CONSTRAINT "_skill_check_session_to_skill_B_fkey";

-- DropForeignKey
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_owner_id_fkey";

-- DropForeignKey
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_team_id_fkey";

-- DropForeignKey
ALTER TABLE "history_events" DROP CONSTRAINT "history_events_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_assessee_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_assessor_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_session_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_package_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_package_id_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_skill_group_id_fkey";

-- DropForeignKey
ALTER TABLE "system_permissions" DROP CONSTRAINT "system_permissions_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships_d4h_info" DROP CONSTRAINT "team_memberships_d4h_info_team_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_team_id_fkey";

-- DropIndex
DROP INDEX "personnel_slug_key";

-- DropIndex
DROP INDEX "skill_groups_slug_key";

-- DropIndex
DROP INDEX "skill_packages_slug_key";

-- DropIndex
DROP INDEX "skills_slug_key";

-- DropIndex
DROP INDEX "team_memberships_d4h_info_team_membership_id_key";

-- AlterTable
ALTER TABLE "_skill_check_session_to_assessee" DROP CONSTRAINT "_skill_check_session_to_assessee_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" VARCHAR(16) NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "_skill_check_session_to_assessee_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_skill_check_session_to_skill" DROP CONSTRAINT "_skill_check_session_to_skill_AB_pkey",
DROP COLUMN "A",
ADD COLUMN     "A" VARCHAR(16) NOT NULL,
DROP COLUMN "B",
ADD COLUMN     "B" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "_skill_check_session_to_skill_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "personnel" DROP CONSTRAINT "personnel_pkey",
DROP COLUMN "created_at",
DROP COLUMN "slug",
DROP COLUMN "updated_at",
ADD COLUMN     "clerk_invitation_id" VARCHAR(50),
ADD COLUMN     "invite_status" "InviteStatus" NOT NULL DEFAULT 'None',
ADD COLUMN     "owning_team_id" VARCHAR(16),
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "personnel_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_pkey",
DROP COLUMN "competence_level",
DROP COLUMN "timestamp",
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "result" TEXT NOT NULL DEFAULT '',
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "session_id",
ADD COLUMN     "session_id" VARCHAR(16),
DROP COLUMN "skill_id",
ADD COLUMN     "skill_id" VARCHAR(16) NOT NULL,
DROP COLUMN "assessee_id",
ADD COLUMN     "assessee_id" VARCHAR(16) NOT NULL,
DROP COLUMN "assessor_id",
ADD COLUMN     "assessor_id" VARCHAR(16) NOT NULL,
ALTER COLUMN "notes" SET DEFAULT '',
ADD CONSTRAINT "skill_checks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_pkey",
DROP COLUMN "created_at",
DROP COLUMN "package_id",
DROP COLUMN "slug",
DROP COLUMN "updated_at",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sequence" INTEGER NOT NULL,
ADD COLUMN     "skill_package_id" VARCHAR(16) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "parent_id",
ADD COLUMN     "parent_id" VARCHAR(16),
ADD CONSTRAINT "skill_groups_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_packages" DROP CONSTRAINT "skill_packages_pkey",
DROP COLUMN "created_at",
DROP COLUMN "slug",
DROP COLUMN "updated_at",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "sequence" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "skill_packages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skills" DROP CONSTRAINT "skills_pkey",
DROP COLUMN "created_at",
DROP COLUMN "package_id",
DROP COLUMN "slug",
DROP COLUMN "updated_at",
ADD COLUMN     "sequence" INTEGER NOT NULL,
ADD COLUMN     "skill_package_id" VARCHAR(16) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "skill_group_id",
ADD COLUMN     "skill_group_id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "updated_at",
ADD COLUMN     "clerk_invitation_id" VARCHAR(50),
ADD COLUMN     "clerk_membership_id" VARCHAR(50),
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "person_id",
ADD COLUMN     "person_id" VARCHAR(16) NOT NULL,
DROP COLUMN "team_id",
ADD COLUMN     "team_id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("person_id", "team_id");

-- AlterTable
ALTER TABLE "team_memberships_d4h_info" DROP COLUMN "team_membership_id",
ADD COLUMN     "person_id" VARCHAR(16) NOT NULL,
ADD COLUMN     "team_id" VARCHAR(16) NOT NULL,
DROP COLUMN "d4h_status",
ADD COLUMN     "d4h_status" "TeamMembershipD4hStatus" NOT NULL,
ADD CONSTRAINT "team_memberships_d4h_info_pkey" PRIMARY KEY ("person_id", "team_id");

-- AlterTable
ALTER TABLE "teams" DROP CONSTRAINT "teams_pkey",
DROP COLUMN "created_at",
DROP COLUMN "d4h_api_url",
DROP COLUMN "d4h_team_id",
DROP COLUMN "d4h_web_url",
DROP COLUMN "updated_at",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(50),
ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "SkillCheckSession";

-- DropTable
DROP TABLE "d4h_access_keys";

-- DropTable
DROP TABLE "history_events";

-- DropTable
DROP TABLE "system_permissions";

-- DropTable
DROP TABLE "team_permissions";

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
    "id" VARCHAR(16) NOT NULL,
    "person_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "PersonChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personnel_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_check_sessions" (
    "id" VARCHAR(16) NOT NULL,
    "team_id" VARCHAR(16) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "date" TEXT NOT NULL,
    "sessionStatus" "SkillCheckSessionStatus" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_check_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_check_sessions_change_log" (
    "id" VARCHAR(16) NOT NULL,
    "session_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "SkillCheckSessionEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_check_sessions_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_packages_change_log" (
    "id" VARCHAR(16) NOT NULL,
    "skill_package_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "SkillPackageChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_packages_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams_change_log" (
    "id" VARCHAR(16) NOT NULL,
    "team_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "TeamChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_d4h_info" (
    "team_id" VARCHAR(16) NOT NULL,
    "d4h_team_id" INTEGER NOT NULL,
    "server_code" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active'
);

-- CreateTable
CREATE TABLE "_skill_check_session_to_assessor" (
    "A" VARCHAR(16) NOT NULL,
    "B" VARCHAR(16) NOT NULL,

    CONSTRAINT "_skill_check_session_to_assessor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_d4h_info_team_id_key" ON "team_d4h_info"("team_id");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_assessor_B_index" ON "_skill_check_session_to_assessor"("B");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_assessee_B_index" ON "_skill_check_session_to_assessee"("B");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_skill_B_index" ON "_skill_check_session_to_skill"("B");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_email_key" ON "personnel"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_clerk_invitation_id_key" ON "personnel"("clerk_invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_clerk_membership_id_key" ON "team_memberships"("clerk_membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_clerk_invitation_id_key" ON "team_memberships"("clerk_invitation_id");

-- AddForeignKey
ALTER TABLE "personnel" ADD CONSTRAINT "personnel_owning_team_id_fkey" FOREIGN KEY ("owning_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "skill_check_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessee_id_fkey" FOREIGN KEY ("assessee_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_check_sessions" ADD CONSTRAINT "skill_check_sessions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_check_sessions_change_log" ADD CONSTRAINT "skill_check_sessions_change_log_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_check_sessions_change_log" ADD CONSTRAINT "skill_check_sessions_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_d4h_info" ADD CONSTRAINT "team_d4h_info_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships_d4h_info" ADD CONSTRAINT "team_memberships_d4h_info_person_id_team_id_fkey" FOREIGN KEY ("person_id", "team_id") REFERENCES "team_memberships"("person_id", "team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_A_fkey" FOREIGN KEY ("A") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessor" ADD CONSTRAINT "_skill_check_session_to_assessor_A_fkey" FOREIGN KEY ("A") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessor" ADD CONSTRAINT "_skill_check_session_to_assessor_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
