/*
  Warnings:

  - Added the required column `content` to the `notes_change_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."notes_change_log" ADD COLUMN     "content" TEXT NOT NULL;
