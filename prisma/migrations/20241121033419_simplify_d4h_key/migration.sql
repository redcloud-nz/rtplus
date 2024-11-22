/*
  Warnings:

  - You are about to drop the column `label` on the `D4hAccessKey` table. All the data in the column will be lost.
  - You are about to drop the column `primary` on the `D4hAccessKey` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "D4hAccessKey" DROP COLUMN "label",
DROP COLUMN "primary";
