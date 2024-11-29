/*
  Warnings:

  - You are about to drop the column `assignedAt` on the `TeamMembership` table. All the data in the column will be lost.
  - Added the required column `d4hMemberId` to the `TeamMembership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TeamMembership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeamMembership" DROP COLUMN "assignedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "d4hMemberId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
