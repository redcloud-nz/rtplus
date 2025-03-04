/*
  Warnings:

  - You are about to drop the `team_d4h_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "team_d4h_info" DROP CONSTRAINT "team_d4h_info_team_id_fkey";

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "d4h_api_url" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "d4h_team_id" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "d4h_web_url" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "team_d4h_info";
