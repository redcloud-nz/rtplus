/*
  Warnings:

  - Added the required column `authStatus` to the `PersonAccess` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthStatus" AS ENUM ('None', 'Invited', 'Linked');

-- AlterTable
ALTER TABLE "PersonAccess" ADD COLUMN     "authStatus" "AuthStatus" NOT NULL;
