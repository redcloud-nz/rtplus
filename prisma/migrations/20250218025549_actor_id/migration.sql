/*
  Warnings:

  - You are about to drop the column `user_id` on the `personnel_change_log` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `skill_packages_change_log` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `teams_change_log` table. All the data in the column will be lost.
  - Added the required column `actor_id` to the `personnel_change_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actor_id` to the `skill_packages_change_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actor_id` to the `teams_change_log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actor_id` to the `users_change_log` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "personnel_change_log" DROP CONSTRAINT "personnel_change_log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_packages_change_log" DROP CONSTRAINT "skill_packages_change_log_user_id_fkey";

-- DropForeignKey
ALTER TABLE "teams_change_log" DROP CONSTRAINT "teams_change_log_user_id_fkey";

-- AlterTable
ALTER TABLE "personnel_change_log" DROP COLUMN "user_id",
ADD COLUMN     "actor_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "skill_packages_change_log" DROP COLUMN "user_id",
ADD COLUMN     "actor_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "teams_change_log" DROP COLUMN "user_id",
ADD COLUMN     "actor_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "users_change_log" ADD COLUMN     "actor_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "personnel_change_log" ADD CONSTRAINT "personnel_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams_change_log" ADD CONSTRAINT "teams_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users_change_log" ADD CONSTRAINT "users_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
