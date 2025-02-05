/*
  Warnings:

  - The primary key for the `skill_package_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `skill_package_permissions` table. All the data in the column will be lost.
  - The primary key for the `system_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `system_permissions` table. All the data in the column will be lost.
  - The primary key for the `team_memberships_d4h_info` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `team_memberships_d4h_info` table. All the data in the column will be lost.
  - You are about to drop the `team_permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "team_permission" DROP CONSTRAINT "team_permission_person_id_fkey";

-- DropForeignKey
ALTER TABLE "team_permission" DROP CONSTRAINT "team_permission_team_id_fkey";

-- AlterTable
ALTER TABLE "skill_package_permissions" DROP CONSTRAINT "skill_package_permissions_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "skill_package_permissions_pkey" PRIMARY KEY ("person_id", "skill_package_id");

-- AlterTable
ALTER TABLE "system_permissions" DROP CONSTRAINT "system_permissions_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "team_memberships_d4h_info" DROP CONSTRAINT "team_memberships_d4h_info_pkey",
DROP COLUMN "id";

-- DropTable
DROP TABLE "team_permission";

-- CreateTable
CREATE TABLE "team_permissions" (
    "person_id" UUID NOT NULL,
    "team_id" UUID NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "team_permissions_pkey" PRIMARY KEY ("person_id","team_id")
);

-- AddForeignKey
ALTER TABLE "team_permissions" ADD CONSTRAINT "team_permissions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "personnel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_permissions" ADD CONSTRAINT "team_permissions_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
