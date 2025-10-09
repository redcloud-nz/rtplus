/*
  Warnings:

  - You are about to drop the column `fields` on the `notes_change_log` table. All the data in the column will be lost.
  - You are about to drop the column `fields` on the `personnel_change_log` table. All the data in the column will be lost.
  - You are about to drop the column `fields` on the `skill_packages_change_log` table. All the data in the column will be lost.
  - You are about to drop the column `fields` on the `teams_change_log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."notes_change_log" DROP COLUMN "fields",
ADD COLUMN     "changes" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "public"."personnel_change_log" DROP COLUMN "fields",
ADD COLUMN     "changes" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "public"."skill_packages_change_log" DROP COLUMN "fields",
ADD COLUMN     "changes" JSONB[] DEFAULT ARRAY[]::JSONB[];

-- AlterTable
ALTER TABLE "public"."teams_change_log" DROP COLUMN "fields",
ADD COLUMN     "changes" JSONB[] DEFAULT ARRAY[]::JSONB[];
