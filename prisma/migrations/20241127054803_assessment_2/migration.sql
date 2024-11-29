-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('Draft', 'Done', 'Ignore');

-- AlterTable
ALTER TABLE "CompetencyAssessment" ADD COLUMN     "status" "AssessmentStatus" NOT NULL DEFAULT 'Draft';
