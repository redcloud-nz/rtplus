-- AddForeignKey
ALTER TABLE "personnel" ADD CONSTRAINT "personnel_owning_team_id_fkey" FOREIGN KEY ("owning_team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
