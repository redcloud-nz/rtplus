/*
  Warnings:

  - You are about to drop the column `created_at` on the `skill_check_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `skill_check_sessions` table. All the data in the column will be lost.
  - Added the required column `passed` to the `skill_checks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."skill_check_sessions" DROP COLUMN "created_at",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "public"."skill_checks" ADD COLUMN     "checkStatus" "public"."SkillCheckStatus" NOT NULL DEFAULT 'Draft',
ADD COLUMN     "passed" BOOLEAN NOT NULL;
