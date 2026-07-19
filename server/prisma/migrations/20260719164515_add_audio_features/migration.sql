-- CreateTable
CREATE TABLE "audio_features" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "sampleRate" INTEGER NOT NULL,
    "channels" INTEGER NOT NULL,
    "bitrate" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audio_features_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audio_features_uploadId_key" ON "audio_features"("uploadId");

-- AddForeignKey
ALTER TABLE "audio_features" ADD CONSTRAINT "audio_features_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
