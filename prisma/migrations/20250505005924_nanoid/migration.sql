/*
  Warnings:

  - The primary key for the `SkillCheckSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_skill_check_session_to_assessee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_skill_check_session_to_skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `personnel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `public_id` on the `personnel` table. All the data in the column will be lost.
  - The primary key for the `personnel_change_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `actor_id` column on the `personnel_change_log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `skill_checks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `session_id` column on the `skill_checks` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `skill_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `public_id` on the `skill_groups` table. All the data in the column will be lost.
  - The `parent_id` column on the `skill_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `skill_packages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `public_id` on the `skill_packages` table. All the data in the column will be lost.
  - The primary key for the `skill_packages_change_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `actor_id` column on the `skill_packages_change_log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `skills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `public_id` on the `skills` table. All the data in the column will be lost.
  - The `skill_group_id` column on the `skills` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `team_memberships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `public_id` on the `teams` table. All the data in the column will be lost.
  - The primary key for the `teams_change_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `actor_id` column on the `teams_change_log` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `SkillCheckSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assessor_id` on the `SkillCheckSession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_skill_check_session_to_assessee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_skill_check_session_to_assessee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `A` on the `_skill_check_session_to_skill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `B` on the `_skill_check_session_to_skill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `personnel` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `personnel_change_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `person_id` on the `personnel_change_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skill_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assessee_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assessor_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `skill_groups` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skill_package_id` on the `skill_groups` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `skill_packages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `skill_packages_change_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skill_package_id` on the `skill_packages_change_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `skills` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skill_package_id` on the `skills` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `team_d4h_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `team_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `person_id` on the `team_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `team_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_membership_id` on the `team_memberships_d4h_info` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `teams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `teams_change_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `teams_change_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
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
ALTER TABLE "personnel_change_log" DROP CONSTRAINT "personnel_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "personnel_change_log" DROP CONSTRAINT "personnel_change_log_person_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_assessee_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_assessor_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_session_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_skill_group_id_fkey";

-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "team_d4h_info" DROP CONSTRAINT "team_d4h_info_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships_d4h_info" DROP CONSTRAINT "team_memberships_d4h_info_team_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "teams_change_log" DROP CONSTRAINT "teams_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "teams_change_log" DROP CONSTRAINT "teams_change_log_team_id_fkey";

-- DropIndex
DROP INDEX "personnel_public_id_key";

-- DropIndex
DROP INDEX "skill_groups_public_id_key";

-- DropIndex
DROP INDEX "skill_packages_public_id_key";

-- DropIndex
DROP INDEX "skills_public_id_key";

-- DropIndex
DROP INDEX "teams_public_id_key";

-- AlterTable
ALTER TABLE "SkillCheckSession" DROP CONSTRAINT "SkillCheckSession_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "assessor_id",
ADD COLUMN     "assessor_id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "SkillCheckSession_pkey" PRIMARY KEY ("id");

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
DROP COLUMN "public_id",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "personnel_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "personnel_change_log" DROP CONSTRAINT "personnel_change_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "person_id",
ADD COLUMN     "person_id" VARCHAR(16) NOT NULL,
DROP COLUMN "actor_id",
ADD COLUMN     "actor_id" VARCHAR(16),
ADD CONSTRAINT "personnel_change_log_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_pkey",
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
ADD CONSTRAINT "skill_checks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_pkey",
DROP COLUMN "public_id",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "parent_id",
ADD COLUMN     "parent_id" VARCHAR(16),
DROP COLUMN "skill_package_id",
ADD COLUMN     "skill_package_id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "skill_groups_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_packages" DROP CONSTRAINT "skill_packages_pkey",
DROP COLUMN "public_id",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "skill_packages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "skill_package_id",
ADD COLUMN     "skill_package_id" VARCHAR(16) NOT NULL,
DROP COLUMN "actor_id",
ADD COLUMN     "actor_id" VARCHAR(16),
ADD CONSTRAINT "skill_packages_change_log_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skills" DROP CONSTRAINT "skills_pkey",
DROP COLUMN "public_id",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "skill_group_id",
ADD COLUMN     "skill_group_id" VARCHAR(16),
DROP COLUMN "skill_package_id",
ADD COLUMN     "skill_package_id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "team_d4h_info" DROP COLUMN "team_id",
ADD COLUMN     "team_id" VARCHAR(16) NOT NULL;

-- AlterTable
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "person_id",
ADD COLUMN     "person_id" VARCHAR(16) NOT NULL,
DROP COLUMN "team_id",
ADD COLUMN     "team_id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "team_memberships_d4h_info" DROP COLUMN "team_membership_id",
ADD COLUMN     "team_membership_id" VARCHAR(16) NOT NULL;

-- AlterTable
ALTER TABLE "teams" DROP CONSTRAINT "teams_pkey",
DROP COLUMN "public_id",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "teams_change_log" DROP CONSTRAINT "teams_change_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" VARCHAR(16) NOT NULL,
DROP COLUMN "team_id",
ADD COLUMN     "team_id" VARCHAR(16) NOT NULL,
DROP COLUMN "actor_id",
ADD COLUMN     "actor_id" VARCHAR(16),
ADD CONSTRAINT "teams_change_log_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_assessee_B_index" ON "_skill_check_session_to_assessee"("B");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_skill_B_index" ON "_skill_check_session_to_skill"("B");

-- CreateIndex
CREATE UNIQUE INDEX "team_d4h_info_team_id_key" ON "team_d4h_info"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_d4h_info_team_membership_id_key" ON "team_memberships_d4h_info"("team_membership_id");

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "SkillCheckSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessee_id_fkey" FOREIGN KEY ("assessee_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCheckSession" ADD CONSTRAINT "SkillCheckSession_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "team_memberships_d4h_info" ADD CONSTRAINT "team_memberships_d4h_info_team_membership_id_fkey" FOREIGN KEY ("team_membership_id") REFERENCES "team_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_A_fkey" FOREIGN KEY ("A") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillCheckSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillCheckSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
