/*
  Warnings:

  - The primary key for the `team_memberships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `team_memberships` table. All the data in the column will be lost.
  - You are about to drop the column `team_membership_id` on the `team_memberships_d4h_info` table. All the data in the column will be lost.
  - Added the required column `person_id` to the `team_memberships_d4h_info` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_id` to the `team_memberships_d4h_info` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "team_memberships_d4h_info" DROP CONSTRAINT "team_memberships_d4h_info_team_membership_id_fkey";

-- DropIndex
DROP INDEX "team_memberships_d4h_info_team_membership_id_key";

-- AlterTable
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_pkey",
DROP COLUMN "id",
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD CONSTRAINT "team_memberships_pkey" PRIMARY KEY ("person_id", "team_id");

-- AlterTable
ALTER TABLE "team_memberships_d4h_info" DROP COLUMN "team_membership_id",
ADD COLUMN     "person_id" VARCHAR(16) NOT NULL,
ADD COLUMN     "team_id" VARCHAR(16) NOT NULL,
ADD CONSTRAINT "team_memberships_d4h_info_pkey" PRIMARY KEY ("person_id", "team_id");

-- AddForeignKey
ALTER TABLE "team_memberships_d4h_info" ADD CONSTRAINT "team_memberships_d4h_info_person_id_team_id_fkey" FOREIGN KEY ("person_id", "team_id") REFERENCES "team_memberships"("person_id", "team_id") ON DELETE CASCADE ON UPDATE CASCADE;
