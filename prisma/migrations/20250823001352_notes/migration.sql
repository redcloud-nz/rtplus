-- CreateEnum
CREATE TYPE "public"."NoteChangeEvent" AS ENUM ('Create', 'Update', 'Delete');

-- CreateTable
CREATE TABLE "public"."notes" (
    "id" VARCHAR(16) NOT NULL,
    "person_id" VARCHAR(16),
    "team_id" VARCHAR(16),
    "content" TEXT NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notes_change_log" (
    "id" VARCHAR(16) NOT NULL,
    "note_id" VARCHAR(16) NOT NULL,
    "actor_id" VARCHAR(16),
    "event" "public"."NoteChangeEvent" NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "diff" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notes_change_log_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "public"."personnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes" ADD CONSTRAINT "notes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes_change_log" ADD CONSTRAINT "notes_change_log_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notes_change_log" ADD CONSTRAINT "notes_change_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."personnel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
