/*
  Warnings:

  - The values [RecordCheck] on the enum `SkillCheckSessionEvent` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SkillCheckSessionEvent_new" AS ENUM ('Create', 'Update', 'Delete', 'AddAssessee', 'RemoveAssessee', 'AddAssessor', 'RemoveAssessor', 'AddSkill', 'RemoveSkill', 'CreateCheck', 'UpdateCheck', 'DeleteCheck', 'Complete', 'Draft', 'Discard');
ALTER TABLE "skill_check_sessions_change_log" ALTER COLUMN "event" TYPE "SkillCheckSessionEvent_new" USING ("event"::text::"SkillCheckSessionEvent_new");
ALTER TYPE "SkillCheckSessionEvent" RENAME TO "SkillCheckSessionEvent_old";
ALTER TYPE "SkillCheckSessionEvent_new" RENAME TO "SkillCheckSessionEvent";
DROP TYPE "SkillCheckSessionEvent_old";
COMMIT;
