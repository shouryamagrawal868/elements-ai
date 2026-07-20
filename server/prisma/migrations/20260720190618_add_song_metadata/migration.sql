-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "acoustidRecordingId" TEXT,
ADD COLUMN     "album" TEXT,
ADD COLUMN     "artist" TEXT;

-- CreateIndex
CREATE INDEX "songs_acoustidRecordingId_idx" ON "songs"("acoustidRecordingId");
