/*
  Warnings:

  - You are about to drop the `skill_package_permissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "skill_package_permissions" DROP CONSTRAINT "skill_package_permissions_person_id_fkey";

-- DropForeignKey
ALTER TABLE "skill_package_permissions" DROP CONSTRAINT "skill_package_permissions_skill_package_id_fkey";

-- DropTable
DROP TABLE "skill_package_permissions";
