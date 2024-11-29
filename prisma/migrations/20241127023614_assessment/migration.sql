-- CreateTable
CREATE TABLE "CompetencyAssessment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetencyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompetencyAssessmentToPerson" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CompetencyAssessmentToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CompetencyAssessmentToPerson_AB_unique" ON "_CompetencyAssessmentToPerson"("A", "B");

-- CreateIndex
CREATE INDEX "_CompetencyAssessmentToPerson_B_index" ON "_CompetencyAssessmentToPerson"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CompetencyAssessmentToSkill_AB_unique" ON "_CompetencyAssessmentToSkill"("A", "B");

-- CreateIndex
CREATE INDEX "_CompetencyAssessmentToSkill_B_index" ON "_CompetencyAssessmentToSkill"("B");

-- AddForeignKey
ALTER TABLE "_CompetencyAssessmentToPerson" ADD CONSTRAINT "_CompetencyAssessmentToPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "CompetencyAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetencyAssessmentToPerson" ADD CONSTRAINT "_CompetencyAssessmentToPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetencyAssessmentToSkill" ADD CONSTRAINT "_CompetencyAssessmentToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "CompetencyAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetencyAssessmentToSkill" ADD CONSTRAINT "_CompetencyAssessmentToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
