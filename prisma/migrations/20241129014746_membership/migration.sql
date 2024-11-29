/*
  Warnings:

  - Added the required column `position` to the `TeamMembership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reference` to the `TeamMembership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `TeamMembership` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('Operational', 'NonOperational', 'Observer', 'Retired');

-- AlterTable
ALTER TABLE "TeamMembership" ADD COLUMN     "position" TEXT NOT NULL,
ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "status" "TeamMemberStatus" NOT NULL;
