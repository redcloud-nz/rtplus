/*
  Warnings:

  - Added the required column `owner_org_id` to the `skill_packages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."skill_packages" ADD COLUMN     "owner_org_id" VARCHAR(50) NOT NULL;
