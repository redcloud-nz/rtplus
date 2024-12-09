-- CreateTable
CREATE TABLE "PersonAccess" (
    "id" TEXT NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "inviteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "PersonAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PersonAccess_personId_key" ON "PersonAccess"("personId");

-- AddForeignKey
ALTER TABLE "PersonAccess" ADD CONSTRAINT "PersonAccess_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
