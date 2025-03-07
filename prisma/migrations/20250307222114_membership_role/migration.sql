-- CreateEnum
CREATE TYPE "TeamMembershipRole" AS ENUM ('Admin', 'Member', 'None');

-- AlterTable
ALTER TABLE "team_memberships" ADD COLUMN     "role" "TeamMembershipRole" NOT NULL DEFAULT 'Member';
