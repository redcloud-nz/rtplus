-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('None', 'Invited', 'Complete');

-- CreateEnum
CREATE TYPE "PersonChangeEvent" AS ENUM ('Create', 'Update', 'Delete');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('Active', 'Inactive');

-- CreateEnum
CREATE TYPE "SkillCheckSessionEvent" AS ENUM ('Create', 'Update', 'Delete', 'AddAssessee', 'RemoveAssessee', 'AddAssessor', 'RemoveAssessor', 'AddSkill', 'RemoveSkill', 'CreateCheck', 'UpdateCheck', 'DeleteCheck', 'Complete', 'Draft', 'Discard');

-- CreateEnum
CREATE TYPE "SkillCheckSessionStatus" AS ENUM ('Draft', 'Complete', 'Discard');

-- CreateEnum
CREATE TYPE "SkillCheckStatus" AS ENUM ('Draft', 'Complete', 'Discard');

-- CreateEnum
CREATE TYPE "SkillPackageChangeEvent" AS ENUM ('Create', 'Delete', 'Update', 'CreateSkill', 'DeleteSkill', 'UpdateSkill', 'CreateGroup', 'DeleteGroup', 'UpdateGroup');

-- CreateEnum
CREATE TYPE "TeamChangeEvent" AS ENUM ('Create', 'Delete', 'Update', 'AddMember', 'UpdateMember', 'RemoveMember');

-- CreateEnum
CREATE TYPE "TeamMembershipD4hStatus" AS ENUM ('Operational', 'NonOperational', 'Observer', 'Retired');

-- CreateTable
CREATE TABLE "personnel" (
    "id" VARCHAR(16) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "clerk_user_id" VARCHAR(50),
    "clerk_invitation_id" VARCHAR(50),
    "invite_status" "InviteStatus" NOT NULL DEFAULT 'None',
    "owning_team_id" VARCHAR(16),
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "personnel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personnel_change_log" (
    "id" VARCHAR(16) NOT NULL,
    "person_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "PersonChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "personnel_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" VARCHAR(16) NOT NULL,
    "skill_package_id" VARCHAR(16) NOT NULL,
    "skill_group_id" VARCHAR(16) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "optional" BOOLEAN NOT NULL,
    "sequence" INTEGER NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_checks" (
    "id" VARCHAR(16) NOT NULL,
    "session_id" VARCHAR(16),
    "skill_id" VARCHAR(16) NOT NULL,
    "assessee_id" VARCHAR(16) NOT NULL,
    "assessor_id" VARCHAR(16) NOT NULL,
    "result" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "date" TEXT NOT NULL,

    CONSTRAINT "skill_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_check_sessions" (
    "id" VARCHAR(16) NOT NULL,
    "team_id" VARCHAR(16) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "date" TEXT NOT NULL,
    "sessionStatus" "SkillCheckSessionStatus" NOT NULL DEFAULT 'Draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_check_sessions_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "skill_groups" (
    "id" VARCHAR(16) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "skill_package_id" VARCHAR(16) NOT NULL,
    "parent_id" VARCHAR(16),
    "sequence" INTEGER NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skill_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_packages" (
    "id" VARCHAR(16) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "sequence" INTEGER NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "skill_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_packages_change_log" (
    "id" VARCHAR(16) NOT NULL,
    "skill_package_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "SkillPackageChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_packages_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" VARCHAR(16) NOT NULL,
    "clerk_org_id" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "shortName" VARCHAR(50) NOT NULL,
    "color" VARCHAR(10) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams_change_log" (
    "id" VARCHAR(16) NOT NULL,
    "team_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "TeamChangeEvent" NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teams_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_d4h_info" (
    "team_id" VARCHAR(16) NOT NULL,
    "d4h_team_id" INTEGER NOT NULL,
    "server_code" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active'
);

-- CreateTable
CREATE TABLE "team_memberships" (
    "person_id" VARCHAR(16) NOT NULL,
    "team_id" VARCHAR(16) NOT NULL,
    "clerk_membership_id" VARCHAR(50),
    "clerk_invitation_id" VARCHAR(50),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',

    CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("person_id","team_id")
);

-- CreateTable
CREATE TABLE "team_memberships_d4h_info" (
    "person_id" VARCHAR(16) NOT NULL,
    "team_id" VARCHAR(16) NOT NULL,
    "position" TEXT NOT NULL,
    "d4h_status" "TeamMembershipD4hStatus" NOT NULL,
    "d4h_member_id" INTEGER NOT NULL,
    "d4h_ref" TEXT NOT NULL,

    CONSTRAINT "team_memberships_d4h_info_pkey" PRIMARY KEY ("person_id","team_id")
);

-- CreateTable
CREATE TABLE "_skill_check_session_to_assessee" (
    "A" VARCHAR(16) NOT NULL,
    "B" VARCHAR(16) NOT NULL,

    CONSTRAINT "_skill_check_session_to_assessee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_skill_check_session_to_assessor" (
    "A" VARCHAR(16) NOT NULL,
    "B" VARCHAR(16) NOT NULL,

    CONSTRAINT "_skill_check_session_to_assessor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_skill_check_session_to_skill" (
    "A" VARCHAR(16) NOT NULL,
    "B" VARCHAR(16) NOT NULL,

    CONSTRAINT "_skill_check_session_to_skill_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "personnel_email_key" ON "personnel"("email");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_clerk_user_id_key" ON "personnel"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "personnel_clerk_invitation_id_key" ON "personnel"("clerk_invitation_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_clerk_org_id_key" ON "teams"("clerk_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "team_d4h_info_team_id_key" ON "team_d4h_info"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_clerk_membership_id_key" ON "team_memberships"("clerk_membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_clerk_invitation_id_key" ON "team_memberships"("clerk_invitation_id");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_assessee_B_index" ON "_skill_check_session_to_assessee"("B");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_assessor_B_index" ON "_skill_check_session_to_assessor"("B");

-- CreateIndex
CREATE INDEX "_skill_check_session_to_skill_B_index" ON "_skill_check_session_to_skill"("B");

-- AddForeignKey
ALTER TABLE "personnel" ADD CONSTRAINT "personnel_owning_team_id_fkey" FOREIGN KEY ("owning_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "skill_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "skill_check_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessee_id_fkey" FOREIGN KEY ("assessee_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_check_sessions" ADD CONSTRAINT "skill_check_sessions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_check_sessions_change_log" ADD CONSTRAINT "skill_check_sessions_change_log_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_check_sessions_change_log" ADD CONSTRAINT "skill_check_sessions_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_groups" ADD CONSTRAINT "skill_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "skill_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_d4h_info" ADD CONSTRAINT "team_d4h_info_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships_d4h_info" ADD CONSTRAINT "team_memberships_d4h_info_person_id_team_id_fkey" FOREIGN KEY ("person_id", "team_id") REFERENCES "team_memberships"("person_id", "team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_A_fkey" FOREIGN KEY ("A") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessor" ADD CONSTRAINT "_skill_check_session_to_assessor_A_fkey" FOREIGN KEY ("A") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_assessor" ADD CONSTRAINT "_skill_check_session_to_assessor_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_B_fkey" FOREIGN KEY ("B") REFERENCES "skill_check_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
