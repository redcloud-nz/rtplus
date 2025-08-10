/*
  Warnings:

  - You are about to drop the column `timestamp` on the `skill_checks` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "skill_checks" DROP COLUMN "timestamp",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
