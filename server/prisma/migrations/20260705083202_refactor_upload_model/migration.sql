/*
  Warnings:

  - You are about to drop the `video` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `uploads` ADD COLUMN `audioPath` TEXT NULL,
    ADD COLUMN `processingEndedAt` DATETIME(3) NULL,
    ADD COLUMN `processingStartedAt` DATETIME(3) NULL,
    ADD COLUMN `thumbnailPath` TEXT NULL;

-- DropTable
DROP TABLE `video`;
