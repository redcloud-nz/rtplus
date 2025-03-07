/*
  Warnings:

  - You are about to alter the column `email` on the `personnel` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[email]` on the table `personnel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "personnel" ALTER COLUMN "email" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "personnel_email_key" ON "personnel"("email");
