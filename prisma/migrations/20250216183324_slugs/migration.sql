/*
  Warnings:

  - Made the column `slug` on table `personnel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `skill_groups` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `skills` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "personnel" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "skill_groups" ALTER COLUMN "slug" SET NOT NULL;

-- AlterTable
ALTER TABLE "skills" ALTER COLUMN "slug" SET NOT NULL;
