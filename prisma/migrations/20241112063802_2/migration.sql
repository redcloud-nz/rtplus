/*
  Warnings:

  - You are about to drop the `d4h_access_keys` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "d4h_access_keys";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "D4hAccessKey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL,
    "enabled" BOOLEAN NOT NULL,

    CONSTRAINT "D4hAccessKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "skillGroupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "optional" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCheck" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "assesseeId" TEXT NOT NULL,
    "assessorId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGroup" (
    "id" TEXT NOT NULL,
    "strandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Strand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_skillGroupId_fkey" FOREIGN KEY ("skillGroupId") REFERENCES "SkillGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCheck" ADD CONSTRAINT "SkillCheck_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCheck" ADD CONSTRAINT "SkillCheck_assesseeId_fkey" FOREIGN KEY ("assesseeId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCheck" ADD CONSTRAINT "SkillCheck_assessorId_fkey" FOREIGN KEY ("assessorId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillGroup" ADD CONSTRAINT "SkillGroup_strandId_fkey" FOREIGN KEY ("strandId") REFERENCES "Strand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
