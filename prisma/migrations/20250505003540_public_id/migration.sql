/*
  Warnings:

  - You are about to drop the column `slug` on the `skill_groups` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `skill_packages` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `teams` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[public_id]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `skill_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `skill_packages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `skills` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[public_id]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `public_id` to the `personnel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `skill_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `skill_packages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `skills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_id` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "skill_groups_slug_key";

-- DropIndex
DROP INDEX "skill_packages_slug_key";

-- DropIndex
DROP INDEX "skills_slug_key";

-- DropIndex
DROP INDEX "teams_slug_key";

-- AlterTable
ALTER TABLE "personnel" ADD COLUMN     "public_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "skill_groups" DROP COLUMN "slug",
ADD COLUMN     "public_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "skill_packages" DROP COLUMN "slug",
ADD COLUMN     "public_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "skills" DROP COLUMN "slug",
ADD COLUMN     "public_id" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "slug",
ADD COLUMN     "public_id" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "personnel_public_id_key" ON "personnel"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_groups_public_id_key" ON "skill_groups"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "skill_packages_public_id_key" ON "skill_packages"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_public_id_key" ON "skills"("public_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_public_id_key" ON "teams"("public_id");
