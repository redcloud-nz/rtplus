/*
  Warnings:

  - The values [Done,Ignore] on the enum `AssessmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `location` to the `CompetencyAssessment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AssessmentStatus_new" AS ENUM ('Draft', 'Complete', 'Discard');
ALTER TABLE "CompetencyAssessment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CompetencyAssessment" ALTER COLUMN "status" TYPE "AssessmentStatus_new" USING ("status"::text::"AssessmentStatus_new");
ALTER TYPE "AssessmentStatus" RENAME TO "AssessmentStatus_old";
ALTER TYPE "AssessmentStatus_new" RENAME TO "AssessmentStatus";
DROP TYPE "AssessmentStatus_old";
ALTER TABLE "CompetencyAssessment" ALTER COLUMN "status" SET DEFAULT 'Draft';
COMMIT;

-- AlterTable
ALTER TABLE "CompetencyAssessment" ADD COLUMN     "location" TEXT NOT NULL;
