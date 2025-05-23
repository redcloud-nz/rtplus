/*
  Warnings:

  - You are about to drop the `SkillCheckSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SkillCheckSession" DROP CONSTRAINT "SkillCheckSession_assessor_id_fkey";

-- DropForeignKey
ALTER TABLE "_skill_check_session_to_assessee" DROP CONSTRAINT "_skill_check_session_to_assessee_B_fkey";

-- DropForeignKey
ALTER TABLE "_skill_check_session_to_skill" DROP CONSTRAINT "_skill_check_session_to_skill_B_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_session_id_fkey";

-- DropTable
DROP TABLE "SkillCheckSession";

-- CreateTable
CREATE TABLE "skill_check_sessions" (
    "id" VARCHAR(16) NOT NULL,
    "assessor_id" VARCHAR(16) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sessionStatus" "SkillCheckSessionStatus" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_check_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "skill_check_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_check_sessions" ADD CONSTRAINT "skill_check_sessions_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
