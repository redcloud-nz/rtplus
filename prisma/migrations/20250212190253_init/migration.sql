-- CreateEnum
CREATE TYPE "CompetenceLevel" AS ENUM ('NotAssessed', 'NotTaught', 'NotCompetent', 'Competent', 'HighlyConfident');

-- CreateEnum
CREATE TYPE "D4hTeamMemberStatus" AS ENUM ('Operational', 'NonOperational', 'Observer', 'Retired');

-- CreateEnum
CREATE TYPE "HistoryEventObjectType" AS ENUM ('D4hAccessKey', 'Person', 'Skill', 'SkillCheckSession', 'SkillGroup', 'SkillPackage', 'SkillPackagePermission', 'Team', 'TeamMembership', 'TeamPermission');

-- CreateEnum
CREATE TYPE "HistoryEventType" AS ENUM ('Clone', 'Create', 'Delete', 'Import', 'Update');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "SkillCheckSessionStatus" AS ENUM ('Draft', 'Complete', 'Discard');

-- CreateTable
CREATE TABLE "d4h_access_keys" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "owner_id" UUID,
    "team_id" UUID NOT NULL,

    CONSTRAINT "d4h_access_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history_events" (
    "id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "event_type" "HistoryEventType" NOT NULL,
    "object_type" "HistoryEventObjectType" NOT NULL,
    "person_id" UUID,
    "object_id" UUID NOT NULL,
    "parent_id" UUID,
    "meta" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel" (
    "id" UUID NOT NULL,
    "clerk_user_id" VARCHAR(50),
    "slug" VARCHAR(100),
    "name" VARCHAR(100) NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100),
    "package_id" UUID NOT NULL,
    "skill_group_id" UUID,
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
    "id" UUID NOT NULL,
    "session_id" UUID,
    "skill_id" UUID NOT NULL,
    "assessee_id" UUID NOT NULL,
    "assessor_id" UUID NOT NULL,
    "competence_level" "CompetenceLevel" NOT NULL,
    "notes" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillCheckSession" (
    "id" UUID NOT NULL,
    "assessor_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "SkillCheckSessionStatus" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCheckSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_groups" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100),
    "name" VARCHAR(100) NOT NULL,
    "package_id" UUID NOT NULL,
    "parent_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skill_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_packages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skill_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_permissions" (
    "person_id" UUID NOT NULL,
    "permissions" TEXT[]
);

-- CreateTable
CREATE TABLE "teams" (
    "id" UUID NOT NULL,
    "clerk_org_id" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "shortName" VARCHAR(50) NOT NULL,
    "color" VARCHAR(10) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',
    "d4h_team_id" INTEGER,
    "d4h_api_url" TEXT NOT NULL,
    "d4h_web_url" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_memberships" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',
    "person_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,

    CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_memberships_d4h_info" (
    "position" TEXT NOT NULL,
    "d4h_status" "D4hTeamMemberStatus" NOT NULL,
    "d4h_member_id" INTEGER NOT NULL,
    "d4h_ref" TEXT NOT NULL,
    "team_membership_id" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "team_permissions" (
    "person_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "team_permissions_pkey" PRIMARY KEY ("person_id","team_id")
);

-- CreateTable
CREATE TABLE "_skill_check_session_to_assessee" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_skill_check_session_to_assessee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_skill_check_session_to_skill" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_skill_check_session_to_skill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "personnel_clerk_user_id_key" ON "personnel"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_slug_key" ON "personnel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skill_groups_slug_key" ON "skill_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skill_packages_slug_key" ON "skill_packages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "system_permissions_person_id_key" ON "system_permissions"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_clerk_org_id_key" ON "teams"("clerk_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_d4h_info_team_membership_id_key" ON "team_memberships_d4h_info"("team_membership_id");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_assessee_B_index" ON "_skill_check_session_to_assessee"("B");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_skill_B_index" ON "_skill_check_session_to_skill"("B");

-- AddForeignKey
ALTER TABLE "d4h_access_keys" ADD CONSTRAINT "d4h_access_keys_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "d4h_access_keys" ADD CONSTRAINT "d4h_access_keys_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history_events" ADD CONSTRAINT "history_events_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "history_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "SkillCheckSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessee_id_fkey" FOREIGN KEY ("assessee_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillCheckSession" ADD CONSTRAINT "SkillCheckSession_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_permissions" ADD CONSTRAINT "system_permissions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships_d4h_info" ADD CONSTRAINT "team_memberships_d4h_info_team_membership_id_fkey" FOREIGN KEY ("team_membership_id") REFERENCES "team_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permissions" ADD CONSTRAINT "team_permissions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permissions" ADD CONSTRAINT "team_permissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_A_fkey" FOREIGN KEY ("A") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillCheckSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillCheckSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
