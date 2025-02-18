/*
  Warnings:

  - Added the required column `sequence` to the `skill_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `skill_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sequence` to the `skills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "skill_groups" ADD COLUMN     "sequence" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "skill_packages" ADD COLUMN     "sequence" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "skills" ADD COLUMN     "sequence" INTEGER NOT NULL;
