-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `photoUrl` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `uploads` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `s3Key` TEXT NOT NULL,
    `s3Url` TEXT NULL,
    `status` ENUM('PROCESSING', 'COMPLETED', 'FAILED', 'NOT_FOUND') NOT NULL DEFAULT 'PROCESSING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `uploads_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recognition_results` (
    `id` VARCHAR(191) NOT NULL,
    `uploadId` VARCHAR(191) NOT NULL,
    `trackTitle` VARCHAR(191) NULL,
    `artist` VARCHAR(191) NULL,
    `album` VARCHAR(191) NULL,
    `genre` VARCHAR(191) NULL,
    `bpm` INTEGER NULL,
    `mood` VARCHAR(191) NULL,
    `releaseYear` INTEGER NULL,
    `duration` INTEGER NULL,
    `spotifyUrl` TEXT NULL,
    `youtubeUrl` TEXT NULL,
    `coverUrl` TEXT NULL,
    `confidence` DOUBLE NULL,
    `rawResponse` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `recognition_results_uploadId_key`(`uploadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback` (
    `id` VARCHAR(191) NOT NULL,
    `recognitionResultId` VARCHAR(191) NOT NULL,
    `isCorrect` BOOLEAN NOT NULL,
    `correctTrackTitle` VARCHAR(191) NULL,
    `correctArtist` VARCHAR(191) NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `feedback_recognitionResultId_key`(`recognitionResultId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `uploads` ADD CONSTRAINT `uploads_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recognition_results` ADD CONSTRAINT `recognition_results_uploadId_fkey` FOREIGN KEY (`uploadId`) REFERENCES `uploads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_recognitionResultId_fkey` FOREIGN KEY (`recognitionResultId`) REFERENCES `recognition_results`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
