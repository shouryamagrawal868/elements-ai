-- AlterTable
ALTER TABLE "fingerprints" ADD COLUMN     "songId" TEXT;

-- CreateTable
CREATE TABLE "songs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" INTEGER,
    "language" TEXT,
    "releaseYear" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "songs_title_idx" ON "songs"("title");

-- CreateIndex
CREATE INDEX "fingerprints_songId_idx" ON "fingerprints"("songId");

-- AddForeignKey
ALTER TABLE "fingerprints" ADD CONSTRAINT "fingerprints_songId_fkey" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
