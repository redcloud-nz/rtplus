-- CreateEnum
CREATE TYPE "public"."PersonType" AS ENUM ('Normal', 'Sandbox');

-- CreateEnum
CREATE TYPE "public"."TeamType" AS ENUM ('Normal', 'Sandbox', 'System');

-- AlterTable
ALTER TABLE "public"."personnel" ADD COLUMN     "type" "public"."PersonType" NOT NULL DEFAULT 'Normal';

-- AlterTable
ALTER TABLE "public"."teams" ADD COLUMN     "type" "public"."TeamType" NOT NULL DEFAULT 'Normal';
