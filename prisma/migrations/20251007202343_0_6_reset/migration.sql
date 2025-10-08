/*
  Warnings:

  - The primary key for the `_skill_check_session_to_assessee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_skill_check_session_to_assessor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_skill_check_session_to_skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `notes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `notes` table. All the data in the column will be lost.
  - The primary key for the `notes_change_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `notes_change_log` table. All the data in the column will be lost.
  - The primary key for the `personnel` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `personnel` table. All the data in the column will be lost.
  - The primary key for the `personnel_change_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `personnel_change_log` table. All the data in the column will be lost.
  - The primary key for the `skill_check_sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `skill_check_sessions` table. All the data in the column will be lost.
  - The primary key for the `skill_check_sessions_change_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `skill_check_sessions_change_log` table. All the data in the column will be lost.
  - The primary key for the `skill_checks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `skill_checks` table. All the data in the column will be lost.
  - The primary key for the `skill_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `skill_groups` table. All the data in the column will be lost.
  - The primary key for the `skill_packages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `skill_packages` table. All the data in the column will be lost.
  - The primary key for the `skill_packages_change_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `skill_packages_change_log` table. All the data in the column will be lost.
  - The primary key for the `skills` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `frequency` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `optional` on the `skills` table. All the data in the column will be lost.
  - The primary key for the `team_memberships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `team_memberships_d4h_info` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `teams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `teams` table. All the data in the column will be lost.
  - The primary key for the `teams_change_log` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `teams_change_log` table. All the data in the column will be lost.
  - Added the required column `note_id` to the `notes` table without a default value. This is not possible if the table is not empty.
  - The required column `entry_id` was added to the `notes_change_log` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `person_id` to the `personnel` table without a default value. This is not possible if the table is not empty.
  - The required column `entryId` was added to the `personnel_change_log` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `session_id` to the `skill_check_sessions` table without a default value. This is not possible if the table is not empty.
  - The required column `entry_id` was added to the `skill_check_sessions_change_log` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `skill_check_id` was added to the `skill_checks` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `skill_group_id` to the `skill_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skill_package_id` to the `skill_packages` table without a default value. This is not possible if the table is not empty.
  - The required column `entry_id` was added to the `skill_packages_change_log` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `skillId` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_id` to the `teams` table without a default value. This is not possible if the table is not empty.
  - The required column `entry_id` was added to the `teams_change_log` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "public"."_skill_check_session_to_assessee" DROP CONSTRAINT "_skill_check_session_to_assessee_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_skill_check_session_to_assessee" DROP CONSTRAINT "_skill_check_session_to_assessee_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_skill_check_session_to_assessor" DROP CONSTRAINT "_skill_check_session_to_assessor_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_skill_check_session_to_assessor" DROP CONSTRAINT "_skill_check_session_to_assessor_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_skill_check_session_to_skill" DROP CONSTRAINT "_skill_check_session_to_skill_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_skill_check_session_to_skill" DROP CONSTRAINT "_skill_check_session_to_skill_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."notes_change_log" DROP CONSTRAINT "notes_change_log_note_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."personnel_change_log" DROP CONSTRAINT "personnel_change_log_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_check_sessions_change_log" DROP CONSTRAINT "skill_check_sessions_change_log_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_checks" DROP CONSTRAINT "skill_checks_assessee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_checks" DROP CONSTRAINT "skill_checks_assessor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_checks" DROP CONSTRAINT "skill_checks_session_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_checks" DROP CONSTRAINT "skill_checks_skill_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_groups" DROP CONSTRAINT "skill_groups_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_groups" DROP CONSTRAINT "skill_groups_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skills" DROP CONSTRAINT "skills_skill_group_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skills" DROP CONSTRAINT "skills_skill_package_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."team_d4h_info" DROP CONSTRAINT "team_d4h_info_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."team_memberships" DROP CONSTRAINT "team_memberships_person_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."team_memberships" DROP CONSTRAINT "team_memberships_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."team_memberships_d4h_info" DROP CONSTRAINT "team_memberships_d4h_info_person_id_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teams_change_log" DROP CONSTRAINT "teams_change_log_team_id_fkey";

-- AlterTable
ALTER TABLE "public"."_skill_check_session_to_assessee" DROP CONSTRAINT "_skill_check_session_to_assessee_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "_skill_check_session_to_assessee_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "public"."_skill_check_session_to_assessor" DROP CONSTRAINT "_skill_check_session_to_assessor_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "_skill_check_session_to_assessor_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "public"."_skill_check_session_to_skill" DROP CONSTRAINT "_skill_check_session_to_skill_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "B" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "_skill_check_session_to_skill_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "public"."notes" DROP CONSTRAINT "notes_pkey",
DROP COLUMN "id",
ADD COLUMN     "note_id" VARCHAR(32) NOT NULL,
ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("note_id");

-- AlterTable
ALTER TABLE "public"."notes_change_log" DROP CONSTRAINT "notes_change_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "entry_id" TEXT NOT NULL,
ADD CONSTRAINT "notes_change_log_pkey" PRIMARY KEY ("entry_id");

-- AlterTable
ALTER TABLE "public"."personnel" DROP CONSTRAINT "personnel_pkey",
DROP COLUMN "id",
ADD COLUMN     "person_id" VARCHAR(32) NOT NULL,
ADD COLUMN     "properties" JSONB NOT NULL DEFAULT '{}',
ADD CONSTRAINT "personnel_pkey" PRIMARY KEY ("person_id");

-- AlterTable
ALTER TABLE "public"."personnel_change_log" DROP CONSTRAINT "personnel_change_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "entryId" TEXT NOT NULL,
ALTER COLUMN "person_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "personnel_change_log_pkey" PRIMARY KEY ("entryId");

-- AlterTable
ALTER TABLE "public"."skill_check_sessions" DROP CONSTRAINT "skill_check_sessions_pkey",
DROP COLUMN "id",
ADD COLUMN     "session_id" VARCHAR(32) NOT NULL,
ADD CONSTRAINT "skill_check_sessions_pkey" PRIMARY KEY ("session_id");

-- AlterTable
ALTER TABLE "public"."skill_check_sessions_change_log" DROP CONSTRAINT "skill_check_sessions_change_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "entry_id" TEXT NOT NULL,
ALTER COLUMN "session_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "skill_check_sessions_change_log_pkey" PRIMARY KEY ("entry_id");

-- AlterTable
ALTER TABLE "public"."skill_checks" DROP CONSTRAINT "skill_checks_pkey",
DROP COLUMN "id",
ADD COLUMN     "skill_check_id" TEXT NOT NULL,
ALTER COLUMN "session_id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "skill_id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "assessee_id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "assessor_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "skill_checks_pkey" PRIMARY KEY ("skill_check_id");

-- AlterTable
ALTER TABLE "public"."skill_groups" DROP CONSTRAINT "skill_groups_pkey",
DROP COLUMN "id",
ADD COLUMN     "properties" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "skill_group_id" VARCHAR(32) NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "skill_package_id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "parent_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "skill_groups_pkey" PRIMARY KEY ("skill_group_id");

-- AlterTable
ALTER TABLE "public"."skill_packages" DROP CONSTRAINT "skill_packages_pkey",
DROP COLUMN "id",
ADD COLUMN     "properties" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "skill_package_id" VARCHAR(32) NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD CONSTRAINT "skill_packages_pkey" PRIMARY KEY ("skill_package_id");

-- AlterTable
ALTER TABLE "public"."skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "entry_id" TEXT NOT NULL,
ALTER COLUMN "skill_package_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "skill_packages_change_log_pkey" PRIMARY KEY ("entry_id");

-- AlterTable
ALTER TABLE "public"."skills" DROP CONSTRAINT "skills_pkey",
DROP COLUMN "frequency",
DROP COLUMN "id",
DROP COLUMN "optional",
ADD COLUMN     "properties" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "skillId" VARCHAR(32) NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "skill_package_id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "skill_group_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "skills_pkey" PRIMARY KEY ("skillId");

-- AlterTable
ALTER TABLE "public"."team_d4h_info" ALTER COLUMN "team_id" SET DATA TYPE VARCHAR(32);

-- AlterTable
ALTER TABLE "public"."team_memberships" DROP CONSTRAINT "team_memberships_pkey",
ADD COLUMN     "properties" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "person_id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "team_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("person_id", "team_id");

-- AlterTable
ALTER TABLE "public"."team_memberships_d4h_info" DROP CONSTRAINT "team_memberships_d4h_info_pkey",
ALTER COLUMN "person_id" SET DATA TYPE VARCHAR(32),
ALTER COLUMN "team_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "team_memberships_d4h_info_pkey" PRIMARY KEY ("person_id", "team_id");

-- AlterTable
ALTER TABLE "public"."teams" DROP CONSTRAINT "teams_pkey",
DROP COLUMN "id",
ADD COLUMN     "properties" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "team_id" VARCHAR(32) NOT NULL,
ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("team_id");

-- AlterTable
ALTER TABLE "public"."teams_change_log" DROP CONSTRAINT "teams_change_log_pkey",
DROP COLUMN "id",
ADD COLUMN     "entry_id" TEXT NOT NULL,
ALTER COLUMN "team_id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "teams_change_log_pkey" PRIMARY KEY ("entry_id");

-- DropEnum
DROP TYPE "public"."InviteStatus";

-- AddForeignKey
ALTER TABLE "public"."notes_change_log" ADD CONSTRAINT "notes_change_log_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("note_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personnel_change_log" ADD CONSTRAINT "personnel_change_log_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."personnel"("person_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skills" ADD CONSTRAINT "skills_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "public"."skill_packages"("skill_package_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skills" ADD CONSTRAINT "skills_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "public"."skill_groups"("skill_group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_checks" ADD CONSTRAINT "skill_checks_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."skill_check_sessions"("session_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_checks" ADD CONSTRAINT "skill_checks_assessee_id_fkey" FOREIGN KEY ("assessee_id") REFERENCES "public"."personnel"("person_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_checks" ADD CONSTRAINT "skill_checks_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "public"."personnel"("person_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_checks" ADD CONSTRAINT "skill_checks_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_check_sessions_change_log" ADD CONSTRAINT "skill_check_sessions_change_log_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."skill_check_sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_groups" ADD CONSTRAINT "skill_groups_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "public"."skill_packages"("skill_package_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_groups" ADD CONSTRAINT "skill_groups_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."skill_groups"("skill_group_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_skill_package_id_fkey" FOREIGN KEY ("skill_package_id") REFERENCES "public"."skill_packages"("skill_package_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams_change_log" ADD CONSTRAINT "teams_change_log_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_d4h_info" ADD CONSTRAINT "team_d4h_info_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_memberships" ADD CONSTRAINT "team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."personnel"("person_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_memberships_d4h_info" ADD CONSTRAINT "team_memberships_d4h_info_person_id_team_id_fkey" FOREIGN KEY ("person_id", "team_id") REFERENCES "public"."team_memberships"("person_id", "team_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."personnel"("person_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_skill_check_session_to_assessee" ADD CONSTRAINT "_skill_check_session_to_assessee_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."skill_check_sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_skill_check_session_to_assessor" ADD CONSTRAINT "_skill_check_session_to_assessor_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."personnel"("person_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_skill_check_session_to_assessor" ADD CONSTRAINT "_skill_check_session_to_assessor_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."skill_check_sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."skills"("skillId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_skill_check_session_to_skill" ADD CONSTRAINT "_skill_check_session_to_skill_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."skill_check_sessions"("session_id") ON DELETE CASCADE ON UPDATE CASCADE;
