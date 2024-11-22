/*
  Warnings:

  - You are about to drop the column `memberId` on the `D4hAccessKey` table. All the data in the column will be lost.
  - You are about to drop the column `teamName` on the `D4hAccessKey` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `D4hAccessKey` table. All the data in the column will be lost.
  - You are about to drop the column `strandId` on the `SkillGroup` table. All the data in the column will be lost.
  - You are about to drop the `Strand` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `personId` to the `D4hAccessKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Skill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capabilityId` to the `SkillGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `d4hApiUrl` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `d4hTeamId` to the `Team` table without a default value. This is not possible if the table is not empty.
  - Added the required column `d4hWebUrl` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SkillGroup" DROP CONSTRAINT "SkillGroup_strandId_fkey";

-- AlterTable
ALTER TABLE "D4hAccessKey" DROP COLUMN "memberId",
DROP COLUMN "teamName",
DROP COLUMN "userId",
ADD COLUMN     "personId" TEXT NOT NULL,
ALTER COLUMN "teamId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SkillGroup" DROP COLUMN "strandId",
ADD COLUMN     "capabilityId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "d4hApiUrl" TEXT NOT NULL,
ADD COLUMN     "d4hTeamId" INTEGER NOT NULL,
ADD COLUMN     "d4hWebUrl" TEXT NOT NULL;

-- DropTable
DROP TABLE "Strand";

-- CreateTable
CREATE TABLE "Capability" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Capability_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "D4hAccessKey" ADD CONSTRAINT "D4hAccessKey_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "D4hAccessKey" ADD CONSTRAINT "D4hAccessKey_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillGroup" ADD CONSTRAINT "SkillGroup_capabilityId_fkey" FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
