/*
  Warnings:

  - You are about to drop the column `clerk_invitation_id` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `clerk_user_id` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `invite_status` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `owning_team_id` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `skill_check_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `skill_checks` table. All the data in the column will be lost.
  - You are about to drop the column `clerk_org_id` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `teams` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[org_id,email]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[org_id,name]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `org_id` to the `personnel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_id` to the `skill_check_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_id` to the `skill_checks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `org_id` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."notes_change_log" DROP CONSTRAINT "notes_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."personnel" DROP CONSTRAINT "personnel_owning_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."personnel_change_log" DROP CONSTRAINT "personnel_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_check_sessions" DROP CONSTRAINT "skill_check_sessions_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_check_sessions_change_log" DROP CONSTRAINT "skill_check_sessions_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_checks" DROP CONSTRAINT "skill_checks_team_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."teams_change_log" DROP CONSTRAINT "teams_change_log_actor_id_fkey";

-- DropIndex
DROP INDEX "public"."personnel_clerk_invitation_id_key";

-- DropIndex
DROP INDEX "public"."personnel_clerk_user_id_key";

-- DropIndex
DROP INDEX "public"."personnel_email_key";

-- DropIndex
DROP INDEX "public"."teams_clerk_org_id_key";

-- DropIndex
DROP INDEX "public"."teams_slug_key";

-- AlterTable
ALTER TABLE "public"."notes_change_log" ALTER COLUMN "actor_id" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."personnel" DROP COLUMN "clerk_invitation_id",
DROP COLUMN "clerk_user_id",
DROP COLUMN "invite_status",
DROP COLUMN "owning_team_id",
DROP COLUMN "type",
ADD COLUMN     "org_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "public"."personnel_change_log" ALTER COLUMN "actor_id" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."skill_check_sessions" DROP COLUMN "team_id",
ADD COLUMN     "org_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "public"."skill_check_sessions_change_log" ALTER COLUMN "actor_id" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."skill_checks" DROP COLUMN "team_id",
ADD COLUMN     "org_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "public"."skill_packages_change_log" ALTER COLUMN "actor_id" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."teams" DROP COLUMN "clerk_org_id",
DROP COLUMN "shortName",
DROP COLUMN "slug",
DROP COLUMN "type",
ADD COLUMN     "org_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "public"."teams_change_log" ALTER COLUMN "actor_id" SET DATA TYPE VARCHAR(50);

-- DropEnum
DROP TYPE "public"."TeamType";

-- CreateIndex
CREATE UNIQUE INDEX "personnel_org_id_email_key" ON "public"."personnel"("org_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "teams_org_id_name_key" ON "public"."teams"("org_id", "name");
