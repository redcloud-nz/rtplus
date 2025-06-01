/*
  Warnings:

  - You are about to drop the column `onboarding_status` on the `personnel` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerk_membership_id]` on the table `team_memberships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_invitation_id]` on the table `team_memberships` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('None', 'Invited', 'Complete');

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "onboarding_status",
ADD COLUMN     "invite_status" "InviteStatus" NOT NULL DEFAULT 'None';

-- AlterTable
ALTER TABLE "team_memberships" ADD COLUMN     "clerk_invitation_id" VARCHAR(50),
ADD COLUMN     "clerk_membership_id" VARCHAR(50),
ADD COLUMN     "invite_status" "InviteStatus" NOT NULL DEFAULT 'None';

-- DropEnum
DROP TYPE "PersonOnboardingStatus";

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_clerk_membership_id_key" ON "team_memberships"("clerk_membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_clerk_invitation_id_key" ON "team_memberships"("clerk_invitation_id");
