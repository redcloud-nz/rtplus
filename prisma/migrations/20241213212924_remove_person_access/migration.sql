/*
  Warnings:

  - You are about to drop the `PersonAccess` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PersonAccess" DROP CONSTRAINT "PersonAccess_personId_fkey";

-- DropTable
DROP TABLE "PersonAccess";

-- DropEnum
DROP TYPE "AuthStatus";
