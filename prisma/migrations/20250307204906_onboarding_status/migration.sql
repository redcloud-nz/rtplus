/*
  Warnings:

  - You are about to drop the column `systemPermissions` on the `personnel` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PersonOnboardingStatus" AS ENUM ('NotStarted', 'InProgress', 'Complete');

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "systemPermissions",
ADD COLUMN     "onboarding_status" "PersonOnboardingStatus" NOT NULL DEFAULT 'NotStarted';
