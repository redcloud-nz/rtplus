/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "slug" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");
