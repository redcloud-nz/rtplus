/*
  Warnings:

  - You are about to drop the column `user_id` on the `SkillCheckSession` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `d4h_access_keys` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `history_events` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `skill_checks` table. All the data in the column will be lost.
  - You are about to drop the `d4h_team_memberships` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "D4hTeamMemberStatus" AS ENUM ('Operational', 'NonOperational', 'Observer', 'Retired');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "HistoryEventObjectType" ADD VALUE 'SkillPackagePermission';
ALTER TYPE "HistoryEventObjectType" ADD VALUE 'TeamPermission';

-- DropForeignKey
ALTER TABLE "d4h_team_memberships" DROP CONSTRAINT "d4h_team_memberships_person_id_fkey";

-- DropForeignKey
ALTER TABLE "d4h_team_memberships" DROP CONSTRAINT "d4h_team_memberships_team_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_checks" DROP CONSTRAINT "skill_checks_session_id_fkey";

-- AlterTable
ALTER TABLE "SkillCheckSession" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "d4h_access_keys" DROP COLUMN "user_id",
ADD COLUMN     "owner_id" UUID;

-- AlterTable
ALTER TABLE "history_events" DROP COLUMN "user_id",
ADD COLUMN     "person_id" UUID;

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "user_id",
ADD COLUMN     "clerk_user_id" VARCHAR(50);

-- AlterTable
ALTER TABLE "skill_checks" DROP COLUMN "user_id",
ALTER COLUMN "session_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "teams" ALTER COLUMN "d4h_team_id" DROP NOT NULL;

-- DropTable
DROP TABLE "d4h_team_memberships";

-- DropEnum
DROP TYPE "TeamMemberStatus";

-- CreateTable
CREATE TABLE "skill_package_permissions" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "skill_package_id" UUID NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "skill_package_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_permissions" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "system_permissions_pkey" PRIMARY KEY ("id")
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
    "id" UUID NOT NULL,
    "position" TEXT NOT NULL,
    "d4h_status" "D4hTeamMemberStatus" NOT NULL,
    "d4h_member_id" INTEGER NOT NULL,
    "d4h_ref" TEXT NOT NULL,
    "team_membership_id" UUID NOT NULL,

    CONSTRAINT "team_memberships_d4h_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_permission" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "team_permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_permissions_person_id_key" ON "system_permissions"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_d4h_info_team_membership_id_key" ON "team_memberships_d4h_info"("team_membership_id");

-- AddForeignKey
ALTER TABLE "d4h_access_keys" ADD CONSTRAINT "d4h_access_keys_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_checks" ADD CONSTRAINT "skill_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "SkillCheckSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_package_permissions" ADD CONSTRAINT "skill_package_permissions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_package_permissions" ADD CONSTRAINT "skill_package_permissions_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "skill_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_permissions" ADD CONSTRAINT "system_permissions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships_d4h_info" ADD CONSTRAINT "team_memberships_d4h_info_team_membership_id_fkey" FOREIGN KEY ("team_membership_id") REFERENCES "team_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permission" ADD CONSTRAINT "team_permission_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permission" ADD CONSTRAINT "team_permission_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
