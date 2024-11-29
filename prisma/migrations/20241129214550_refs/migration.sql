/*
  Warnings:

  - You are about to drop the column `code` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `TeamMembership` table. All the data in the column will be lost.
  - Added the required column `d4HRef` to the `TeamMembership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Capability" ADD COLUMN     "ref" TEXT;

-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "ref" TEXT;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "ref" TEXT;

-- AlterTable
ALTER TABLE "SkillGroup" ADD COLUMN     "ref" TEXT;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "code",
ADD COLUMN     "ref" TEXT;

-- AlterTable
ALTER TABLE "TeamMembership" DROP COLUMN "reference",
ADD COLUMN     "d4HRef" TEXT NOT NULL;
