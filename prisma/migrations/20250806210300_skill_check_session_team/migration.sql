/*
  Warnings:

  - You are about to drop the column `assessor_id` on the `skill_check_sessions` table. All the data in the column will be lost.
  - Added the required column `team_id` to the `skill_check_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "skill_check_sessions" DROP COLUMN "assessor_id",
ADD COLUMN     "team_id" VARCHAR(16) NOT NULL;

-- AddForeignKey
ALTER TABLE "skill_check_sessions" ADD CONSTRAINT "skill_check_sessions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
