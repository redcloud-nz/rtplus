-- AlterEnum
ALTER TYPE "public"."OrganizationChangeEvent" ADD VALUE 'SkillPackageUpdateSubscription';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."SkillPackageChangeEvent" ADD VALUE 'Publish';
ALTER TYPE "public"."SkillPackageChangeEvent" ADD VALUE 'Unpublish';

-- AddForeignKey
ALTER TABLE "public"."skill_package_subscription_groups" ADD CONSTRAINT "skill_package_subscription_groups_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."skill_package_subscriptions"("subscription_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."skill_package_subscription_groups" ADD CONSTRAINT "skill_package_subscription_groups_skill_group_id_fkey" FOREIGN KEY ("skill_group_id") REFERENCES "public"."skill_groups"("skill_group_id") ON DELETE CASCADE ON UPDATE CASCADE;
