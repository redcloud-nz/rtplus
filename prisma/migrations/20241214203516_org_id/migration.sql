/*
  Warnings:

  - Added the required column `orgId` to the `CompetencyAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `D4hAccessKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `SkillCheck` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `TeamMembership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompetencyAssessment" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "D4hAccessKey" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SkillCheck" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "orgId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TeamMembership" ADD COLUMN     "orgId" TEXT NOT NULL;
