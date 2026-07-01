/*
  Warnings:

  - You are about to drop the column `s3Key` on the `uploads` table. All the data in the column will be lost.
  - You are about to drop the column `s3Url` on the `uploads` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `uploads` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.
  - Added the required column `updatedAt` to the `feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `recognition_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storagePath` to the `uploads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `feedback` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `recognition_results` ADD COLUMN `engine` ENUM('ACOUSTID', 'AUDD', 'MUSICBRAINZ', 'CUSTOM_AI') NULL,
    ADD COLUMN `engineVersion` VARCHAR(191) NULL,
    ADD COLUMN `processingTime` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `uploads` DROP COLUMN `s3Key`,
    DROP COLUMN `s3Url`,
    ADD COLUMN `publicUrl` TEXT NULL,
    ADD COLUMN `storagePath` TEXT NOT NULL,
    MODIFY `status` ENUM('UPLOADED', 'EXTRACTING_AUDIO', 'RECOGNIZING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'UPLOADED';

-- CreateTable
CREATE TABLE `ml_training_data` (
    `id` VARCHAR(191) NOT NULL,
    `recognitionResultId` VARCHAR(191) NOT NULL,
    `predictedTrack` VARCHAR(191) NULL,
    `predictedArtist` VARCHAR(191) NULL,
    `confidence` DOUBLE NULL,
    `correctTrack` VARCHAR(191) NULL,
    `correctArtist` VARCHAR(191) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ml_training_data_recognitionResultId_key`(`recognitionResultId`),
    INDEX `ml_training_data_verified_idx`(`verified`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `recognition_results_trackTitle_idx` ON `recognition_results`(`trackTitle`);

-- CreateIndex
CREATE INDEX `recognition_results_artist_idx` ON `recognition_results`(`artist`);

-- CreateIndex
CREATE INDEX `recognition_results_confidence_idx` ON `recognition_results`(`confidence`);

-- CreateIndex
CREATE INDEX `uploads_status_idx` ON `uploads`(`status`);

-- CreateIndex
CREATE INDEX `uploads_createdAt_idx` ON `uploads`(`createdAt`);

-- AddForeignKey
ALTER TABLE `ml_training_data` ADD CONSTRAINT `ml_training_data_recognitionResultId_fkey` FOREIGN KEY (`recognitionResultId`) REFERENCES `recognition_results`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
