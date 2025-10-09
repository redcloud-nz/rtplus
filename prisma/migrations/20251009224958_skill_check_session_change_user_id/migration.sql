/*
  Warnings:

  - You are about to drop the column `actor_id` on the `skill_check_sessions_change_log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."skill_check_sessions_change_log" DROP COLUMN "actor_id",
ADD COLUMN     "user_id" VARCHAR(50);
