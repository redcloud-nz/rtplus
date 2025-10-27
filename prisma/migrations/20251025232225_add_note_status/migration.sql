/*
  Warnings:

  - You are about to drop the column `date` on the `notes` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."NoteStatus" AS ENUM ('Draft', 'Published', 'Deleted');

-- AlterTable
ALTER TABLE "public"."notes" DROP COLUMN "date",
ADD COLUMN     "status" "public"."NoteStatus" NOT NULL DEFAULT 'Draft';
