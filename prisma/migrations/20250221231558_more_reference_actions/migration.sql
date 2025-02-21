-- DropForeignKey
ALTER TABLE "team_d4h_info" DROP CONSTRAINT "team_d4h_info_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships_d4h_info" DROP CONSTRAINT "team_memberships_d4h_info_team_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permissions" DROP CONSTRAINT "team_permissions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "teams_change_log" DROP CONSTRAINT "teams_change_log_actor_id_fkey";

-- DropForeignKey
ALTER TABLE "teams_change_log" DROP CONSTRAINT "teams_change_log_team_id_fkey";

-- DropForeignKey
ALTER TABLE "users_change_log" DROP CONSTRAINT "users_change_log_user_id_fkey";

-- AlterTable
ALTER TABLE "teams_change_log" ALTER COLUMN "actor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_d4h_info" ADD CONSTRAINT "team_d4h_info_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships_d4h_info" ADD CONSTRAINT "team_memberships_d4h_info_team_membership_id_fkey" FOREIGN KEY ("team_membership_id") REFERENCES "team_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permissions" ADD CONSTRAINT "team_permissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permissions" ADD CONSTRAINT "team_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_change_log" ADD CONSTRAINT "users_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
