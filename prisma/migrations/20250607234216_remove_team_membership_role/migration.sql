/*
  Warnings:

  - You are about to drop the column `invite_status` on the `team_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `team_memberships` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "team_memberships" DROP COLUMN "invite_status",
DROP COLUMN "role";

-- DropEnum
DROP TYPE "TeamMembershipRole";
