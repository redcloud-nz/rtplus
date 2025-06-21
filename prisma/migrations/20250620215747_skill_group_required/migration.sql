/*
  Warnings:

  - Made the column `skill_group_id` on table `skills` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "skills" DROP CONSTRAINT "skills_skill_group_id_fkey";

-- AlterTable
ALTER TABLE "skills" ALTER COLUMN "skill_group_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
