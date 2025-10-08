/*
  Warnings:

  - You are about to drop the column `person_id` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `notes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."notes" DROP CONSTRAINT "notes_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."notes" DROP CONSTRAINT "notes_team_id_fkey";

-- AlterTable
ALTER TABLE "public"."notes" DROP COLUMN "person_id",
DROP COLUMN "team_id",
ADD COLUMN     "org_id" VARCHAR(50) NOT NULL;
