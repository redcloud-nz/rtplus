-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "CompetencyAssessmentStatus" AS ENUM ('Draft', 'Complete', 'Discard');

-- CreateEnum
CREATE TYPE "HistoryEventObjectType" AS ENUM ('CompetencyAssessment', 'D4hAccessKey', 'Person', 'Skill', 'SkillGroup', 'SkillPackage', 'Team', 'TeamMembership');

-- CreateEnum
CREATE TYPE "HistoryEventType" AS ENUM ('Clone', 'Create', 'Delete', 'Import', 'Update');

-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('Operational', 'NonOperational', 'Observer', 'Retired');

-- CreateTable
CREATE TABLE "competency_assessments" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "CompetencyAssessmentStatus" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "d4h_access_keys" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "team_id" TEXT NOT NULL,

    CONSTRAINT "d4h_access_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_events" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT,
    "description" TEXT NOT NULL,
    "event_type" "HistoryEventType" NOT NULL,
    "object_type" "HistoryEventObjectType" NOT NULL,
    "object_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "meta" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "ref" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "ref" TEXT,
    "package_id" TEXT NOT NULL,
    "skill_group_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "optional" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_checks" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,
    "assessee_id" TEXT NOT NULL,
    "assessor_id" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_groups" (
    "id" TEXT NOT NULL,
    "ref" TEXT,
    "name" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skill_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_packages" (
    "id" TEXT NOT NULL,
    "ref" TEXT,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skill_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "ref" TEXT,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',
    "d4h_team_id" INTEGER NOT NULL,
    "d4h_api_url" TEXT NOT NULL,
    "d4h_web_url" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_memberships" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "d4h_status" "TeamMemberStatus" NOT NULL,
    "d4h_member_id" INTEGER NOT NULL,
    "d4h_ref" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',
    "person_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,

    CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CompetencyAssessmentToPerson" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompetencyAssessmentToPerson_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CompetencyAssessmentToSkill" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CompetencyAssessmentToSkill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CompetencyAssessmentToPerson_B_index" ON "_CompetencyAssessmentToPerson"("B");

-- CreateIndex
CREATE INDEX "_CompetencyAssessmentToSkill_B_index" ON "_CompetencyAssessmentToSkill"("B");

-- AddForeignKey
ALTER TABLE "d4h_access_keys" ADD CONSTRAINT "d4h_access_keys_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_events" ADD CONSTRAINT "history_events_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "history_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessee_id_fkey" FOREIGN KEY ("assessee_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetencyAssessmentToPerson" ADD CONSTRAINT "_CompetencyAssessmentToPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "competency_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetencyAssessmentToPerson" ADD CONSTRAINT "_CompetencyAssessmentToPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetencyAssessmentToSkill" ADD CONSTRAINT "_CompetencyAssessmentToSkill_A_fkey" FOREIGN KEY ("A") REFERENCES "competency_assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CompetencyAssessmentToSkill" ADD CONSTRAINT "_CompetencyAssessmentToSkill_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
