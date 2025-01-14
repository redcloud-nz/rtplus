/*
  Warnings:

  - The primary key for the `competency_assessments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `org_id` on the `competency_assessments` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `user_id` on the `competency_assessments` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The primary key for the `d4h_access_keys` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `org_id` on the `d4h_access_keys` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `user_id` on the `d4h_access_keys` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The primary key for the `history_events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `org_id` on the `history_events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `user_id` on the `history_events` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The `parent_id` column on the `history_events` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `personnel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `user_id` on the `personnel` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `ref` on the `personnel` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `skill_checks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `org_id` on the `skill_checks` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `user_id` on the `skill_checks` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The primary key for the `skill_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ref` on the `skill_groups` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `parent_id` column on the `skill_groups` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `skill_packages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ref` on the `skill_packages` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The primary key for the `skills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `ref` on the `skills` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `skill_group_id` column on the `skills` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `team_memberships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `org_id` on the `team_memberships` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - The primary key for the `teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `org_id` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `ref` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `color` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(10)`.
  - You are about to drop the `_CompetencyAssessmentToPerson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CompetencyAssessmentToSkill` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `id` on the `competency_assessments` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `d4h_access_keys` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `d4h_access_keys` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `history_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `object_id` on the `history_events` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `org_id` to the `personnel` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `personnel` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `assessment_id` to the `skill_checks` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skill_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assessee_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `assessor_id` on the `skill_checks` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `skill_groups` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `package_id` on the `skill_groups` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `skill_packages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `skills` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `package_id` on the `skills` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `team_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `person_id` on the `team_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `team_id` on the `team_memberships` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `teams` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "_CompetencyAssessmentToPerson" DROP CONSTRAINT "_CompetencyAssessmentToPerson_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompetencyAssessmentToPerson" DROP CONSTRAINT "_CompetencyAssessmentToPerson_B_fkey";

-- DropForeignKey
ALTER TABLE "_CompetencyAssessmentToSkill" DROP CONSTRAINT "_CompetencyAssessmentToSkill_A_fkey";

-- DropForeignKey
ALTER TABLE "_CompetencyAssessmentToSkill" DROP CONSTRAINT "_CompetencyAssessmentToSkill_B_fkey";

-- DropForeignKey
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_team_id_fkey";

-- DropForeignKey
ALTER TABLE "history_events" DROP CONSTRAINT "history_events_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_assessee_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_assessor_id_fkey";

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
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_team_id_fkey";

-- AlterTable
ALTER TABLE "competency_assessments" DROP CONSTRAINT "competency_assessments_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "org_id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(50),
ADD CONSTRAINT "competency_assessments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "org_id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(50),
DROP COLUMN "team_id",
ADD COLUMN     "team_id" UUID NOT NULL,
ADD CONSTRAINT "d4h_access_keys_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "history_events" DROP CONSTRAINT "history_events_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "org_id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(50),
DROP COLUMN "object_id",
ADD COLUMN     "object_id" UUID NOT NULL,
DROP COLUMN "parent_id",
ADD COLUMN     "parent_id" UUID,
ADD CONSTRAINT "history_events_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "personnel" DROP CONSTRAINT "personnel_pkey",
ADD COLUMN     "org_id" VARCHAR(50) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "ref" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "personnel_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_pkey",
ADD COLUMN     "assessment_id" UUID NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "org_id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "user_id" SET DATA TYPE VARCHAR(50),
DROP COLUMN "skill_id",
ADD COLUMN     "skill_id" UUID NOT NULL,
DROP COLUMN "assessee_id",
ADD COLUMN     "assessee_id" UUID NOT NULL,
DROP COLUMN "assessor_id",
ADD COLUMN     "assessor_id" UUID NOT NULL,
ADD CONSTRAINT "skill_checks_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_groups" DROP CONSTRAINT "skill_groups_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "ref" SET DATA TYPE VARCHAR(100),
DROP COLUMN "package_id",
ADD COLUMN     "package_id" UUID NOT NULL,
DROP COLUMN "parent_id",
ADD COLUMN     "parent_id" UUID,
ADD CONSTRAINT "skill_groups_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skill_packages" DROP CONSTRAINT "skill_packages_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "ref" SET DATA TYPE VARCHAR(100),
ADD CONSTRAINT "skill_packages_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "skills" DROP CONSTRAINT "skills_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "ref" SET DATA TYPE VARCHAR(100),
DROP COLUMN "package_id",
ADD COLUMN     "package_id" UUID NOT NULL,
DROP COLUMN "skill_group_id",
ADD COLUMN     "skill_group_id" UUID,
ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "org_id" SET DATA TYPE VARCHAR(50),
DROP COLUMN "person_id",
ADD COLUMN     "person_id" UUID NOT NULL,
DROP COLUMN "team_id",
ADD COLUMN     "team_id" UUID NOT NULL,
ADD CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "teams" DROP CONSTRAINT "teams_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "org_id" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "ref" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "color" SET DATA TYPE VARCHAR(10),
ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "_CompetencyAssessmentToPerson";

-- DropTable
DROP TABLE "_CompetencyAssessmentToSkill";

-- CreateTable
CREATE TABLE "_competency_assessment_to_assessee" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_competency_assessment_to_assessee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_competency_assessment_to_skill" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_competency_assessment_to_skill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_competency_assessment_to_assessee_B_index" ON "_competency_assessment_to_assessee"("B");

-- CreateIndex
CREATE INDEX "_competency_assessment_to_skill_B_index" ON "_competency_assessment_to_skill"("B");

-- AddForeignKey
ALTER TABLE "d4h_access_keys" ADD CONSTRAINT "d4h_access_keys_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_events" ADD CONSTRAINT "history_events_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "history_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "competency_assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessee_id_fkey" FOREIGN KEY ("assessee_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_competency_assessment_to_assessee" ADD CONSTRAINT "_competency_assessment_to_assessee_A_fkey" FOREIGN KEY ("A") REFERENCES "competency_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_competency_assessment_to_assessee" ADD CONSTRAINT "_competency_assessment_to_assessee_B_fkey" FOREIGN KEY ("B") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_competency_assessment_to_skill" ADD CONSTRAINT "_competency_assessment_to_skill_A_fkey" FOREIGN KEY ("A") REFERENCES "competency_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_competency_assessment_to_skill" ADD CONSTRAINT "_competency_assessment_to_skill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
