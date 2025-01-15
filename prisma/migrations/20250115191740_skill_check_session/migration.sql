/*
  Warnings:

  - The values [CompetencyAssessment] on the enum `HistoryEventObjectType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assessment_id` on the `skill_checks` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `skill_checks` table. All the data in the column will be lost.
  - You are about to drop the `_competency_assessment_to_assessee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_competency_assessment_to_skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `competency_assessments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `competence_level` to the `skill_checks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_id` to the `skill_checks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CompetenceLevel" AS ENUM ('NotAssessed', 'NotTaught', 'NotCompetent', 'Competent', 'HighlyConfident');

-- CreateEnum
CREATE TYPE "SkillCheckSessionStatus" AS ENUM ('Draft', 'Complete', 'Discard');

-- AlterEnum
BEGIN;
CREATE TYPE "HistoryEventObjectType_new" AS ENUM ('D4hAccessKey', 'Person', 'Skill', 'SkillCheckSession', 'SkillGroup', 'SkillPackage', 'Team', 'TeamMembership');
ALTER TABLE "history_events" ALTER COLUMN "object_type" TYPE "HistoryEventObjectType_new" USING ("object_type"::text::"HistoryEventObjectType_new");
ALTER TYPE "HistoryEventObjectType" RENAME TO "HistoryEventObjectType_old";
ALTER TYPE "HistoryEventObjectType_new" RENAME TO "HistoryEventObjectType";
DROP TYPE "HistoryEventObjectType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "_competency_assessment_to_assessee" DROP CONSTRAINT "_competency_assessment_to_assessee_A_fkey";

-- DropForeignKey
ALTER TABLE "_competency_assessment_to_assessee" DROP CONSTRAINT "_competency_assessment_to_assessee_B_fkey";

-- DropForeignKey
ALTER TABLE "_competency_assessment_to_skill" DROP CONSTRAINT "_competency_assessment_to_skill_A_fkey";

-- DropForeignKey
ALTER TABLE "_competency_assessment_to_skill" DROP CONSTRAINT "_competency_assessment_to_skill_B_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_assessment_id_fkey";

-- AlterTable
ALTER TABLE "skill_checks" DROP COLUMN "assessment_id",
DROP COLUMN "result",
ADD COLUMN     "competence_level" "CompetenceLevel" NOT NULL,
ADD COLUMN     "session_id" UUID NOT NULL;

-- DropTable
DROP TABLE "_competency_assessment_to_assessee";

-- DropTable
DROP TABLE "_competency_assessment_to_skill";

-- DropTable
DROP TABLE "competency_assessments";

-- DropEnum
DROP TYPE "CompetencyAssessmentStatus";

-- CreateTable
CREATE TABLE "SkillCheckSession" (
    "id" UUID NOT NULL,
    "org_id" VARCHAR(50) NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "assessor_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "SkillCheckSessionStatus" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCheckSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_skill_check_session_to_assessee" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_skill_check_session_to_assessee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_skill_check_session_to_skill" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_skill_check_session_to_skill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_skill_check_session_to_assessee_B_index" ON "_skill_check_session_to_assessee"("B");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_skill_B_index" ON "_skill_check_session_to_skill"("B");

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "SkillCheckSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCheckSession" ADD CONSTRAINT "SkillCheckSession_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_A_fkey" FOREIGN KEY ("A") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillCheckSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillCheckSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
