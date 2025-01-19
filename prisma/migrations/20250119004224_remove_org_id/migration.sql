/*
  Warnings:

  - You are about to drop the column `org_id` on the `SkillCheckSession` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `d4h_access_keys` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `history_events` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `personnel` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `skill_checks` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the `team_memberships` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_team_id_fkey";

-- AlterTable
ALTER TABLE "SkillCheckSession" DROP COLUMN "org_id";

-- AlterTable
ALTER TABLE "d4h_access_keys" DROP COLUMN "org_id";

-- AlterTable
ALTER TABLE "history_events" DROP COLUMN "org_id";

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "org_id";

-- AlterTable
ALTER TABLE "skill_checks" DROP COLUMN "org_id";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "org_id";

-- DropTable
DROP TABLE "team_memberships";

-- CreateTable
CREATE TABLE "d4h_team_memberships" (
    "id" UUID NOT NULL,
    "position" TEXT NOT NULL,
    "d4h_status" "TeamMemberStatus" NOT NULL,
    "d4h_member_id" INTEGER NOT NULL,
    "d4h_ref" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active',
    "person_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,

    CONSTRAINT "d4h_team_memberships_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "d4h_team_memberships" ADD CONSTRAINT "d4h_team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "d4h_team_memberships" ADD CONSTRAINT "d4h_team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
