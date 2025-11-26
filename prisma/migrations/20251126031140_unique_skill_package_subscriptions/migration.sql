/*
  Warnings:

  - A unique constraint covering the columns `[org_id,skill_package_id]` on the table `skill_package_subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "skill_package_subscriptions_org_id_skill_package_id_key" ON "public"."skill_package_subscriptions"("org_id", "skill_package_id");
