/*
  Warnings:

  - You are about to alter the column `name` on the `SkillCheckSession` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `ref` on the `personnel` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `personnel` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `ref` on the `skill_groups` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `skill_groups` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `ref` on the `skill_packages` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `skill_packages` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to drop the column `ref` on the `skills` table. All the data in the column will be lost.
  - You are about to drop the column `ref` on the `teams` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `teams` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[slug]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `skill_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `skill_packages` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `skills` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `shortName` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SkillCheckSession" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "personnel" DROP COLUMN "ref",
ADD COLUMN     "slug" VARCHAR(100),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "skill_groups" DROP COLUMN "ref",
ADD COLUMN     "slug" VARCHAR(100),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "skill_packages" DROP COLUMN "ref",
ADD COLUMN     "slug" VARCHAR(100),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "skills" DROP COLUMN "ref",
ADD COLUMN     "slug" VARCHAR(100);

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "ref",
ADD COLUMN     "shortName" VARCHAR(50) NOT NULL,
ADD COLUMN     "slug" VARCHAR(100),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "personnel_slug_key" ON "personnel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skill_groups_slug_key" ON "skill_groups"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skill_packages_slug_key" ON "skill_packages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");
