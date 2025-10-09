/*
  Warnings:

  - You are about to drop the column `actor_id` on the `notes_change_log` table. All the data in the column will be lost.
  - You are about to drop the column `actor_id` on the `personnel_change_log` table. All the data in the column will be lost.
  - You are about to drop the column `actor_id` on the `skill_packages_change_log` table. All the data in the column will be lost.
  - You are about to drop the column `actor_id` on the `teams_change_log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."notes_change_log" DROP COLUMN "actor_id",
ADD COLUMN     "user_id" VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."personnel" ADD COLUMN     "user_id" VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."personnel_change_log" DROP COLUMN "actor_id",
ADD COLUMN     "user_id" VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."skill_packages_change_log" DROP COLUMN "actor_id",
ADD COLUMN     "user_id" VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."teams_change_log" DROP COLUMN "actor_id",
ADD COLUMN     "user_id" VARCHAR(50);

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "public"."notes_change_log" ADD CONSTRAINT "notes_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personnel" ADD CONSTRAINT "personnel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."personnel_change_log" ADD CONSTRAINT "personnel_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_packages_change_log" ADD CONSTRAINT "skill_packages_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teams_change_log" ADD CONSTRAINT "teams_change_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
