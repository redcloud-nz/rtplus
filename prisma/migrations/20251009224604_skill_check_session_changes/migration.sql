/*
  Warnings:

  - You are about to drop the column `fields` on the `skill_check_sessions_change_log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."skill_check_sessions_change_log" DROP COLUMN "fields",
ADD COLUMN     "changes" JSONB[] DEFAULT ARRAY[]::JSONB[];
