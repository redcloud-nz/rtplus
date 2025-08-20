/*
  Warnings:

  - Added the required column `team_id` to the `skill_checks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."skill_check_sessions" ADD COLUMN     "notes" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."skill_checks" ADD COLUMN     "team_id" VARCHAR(16) NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."skill_checks" ADD CONSTRAINT "skill_checks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
