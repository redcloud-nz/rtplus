/*
  Warnings:

  - A unique constraint covering the columns `[clerk_user_id]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_org_id]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerk_org_id` to the `teams` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "clerk_org_id" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "personnel_clerk_user_id_key" ON "personnel"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teams_clerk_org_id_key" ON "teams"("clerk_org_id");
