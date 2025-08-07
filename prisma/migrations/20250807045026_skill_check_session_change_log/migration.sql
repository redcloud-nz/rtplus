/*
  Warnings:

  - You are about to drop the column `competence_level` on the `skill_checks` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SkillCheckSessionEvent" AS ENUM ('Create', 'Update', 'Delete', 'AddAssessee', 'RemoveAssessee', 'AddAssessor', 'RemoveAssessor', 'AddSkill', 'RemoveSkill', 'UpdateCheck', 'Complete', 'Draft', 'Discard');

-- AlterTable
ALTER TABLE "skill_checks" DROP COLUMN "competence_level",
ADD COLUMN     "result" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "notes" SET DEFAULT '';

-- DropEnum
DROP TYPE "SkillCheckCompetenceLevel";

-- CreateTable
CREATE TABLE "skill_check_sessions_change_log" (
    "id" VARCHAR(16) NOT NULL,
    "session_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "SkillCheckSessionEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_check_sessions_change_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "skill_check_sessions_change_log" ADD CONSTRAINT "skill_check_sessions_change_log_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_check_sessions_change_log" ADD CONSTRAINT "skill_check_sessions_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
