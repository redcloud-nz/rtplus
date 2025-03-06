/*
  Warnings:

  - You are about to drop the column `d4h_api_url` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `d4h_team_id` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the column `d4h_web_url` on the `teams` table. All the data in the column will be lost.
  - You are about to drop the `d4h_access_keys` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_team_id_fkey";

-- DropForeignKey
ALTER TABLE "d4h_access_keys" DROP CONSTRAINT "d4h_access_keys_user_id_fkey";

-- AlterTable
ALTER TABLE "teams" DROP COLUMN "d4h_api_url",
DROP COLUMN "d4h_team_id",
DROP COLUMN "d4h_web_url";

-- DropTable
DROP TABLE "d4h_access_keys";

-- CreateTable
CREATE TABLE "team_d4h_info" (
    "team_id" UUID NOT NULL,
    "d4h_team_id" INTEGER NOT NULL,
    "server_code" TEXT NOT NULL,
    "status" "RecordStatus" NOT NULL DEFAULT 'Active'
);

-- CreateIndex
CREATE UNIQUE INDEX "team_d4h_info_team_id_key" ON "team_d4h_info"("team_id");

-- AddForeignKey
ALTER TABLE "team_d4h_info" ADD CONSTRAINT "team_d4h_info_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
