/*
  Warnings:

  - You are about to drop the column `slug` on the `personnel` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "personnel_slug_key";

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "slug";
