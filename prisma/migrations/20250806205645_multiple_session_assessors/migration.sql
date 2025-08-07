-- DropForeignKey
ALTER TABLE "skill_check_sessions" DROP CONSTRAINT "skill_check_sessions_assessor_id_fkey";

-- CreateTable
CREATE TABLE "_skill_check_session_to_assessor" (
    "A" VARCHAR(16) NOT NULL,
    "B" VARCHAR(16) NOT NULL,

    CONSTRAINT "_skill_check_session_to_assessor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_skill_check_session_to_assessor_B_index" ON "_skill_check_session_to_assessor"("B");

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessor" ADD CONSTRAINT "_skill_check_session_to_assessor_A_fkey" FOREIGN KEY ("A") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessor" ADD CONSTRAINT "_skill_check_session_to_assessor_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
