import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { mediaService } from "../modules/media";
import { musicRecognitionService } from "../modules/musicRecognition";
import { prisma } from "../config/prisma";

console.log("🚀 Upload Worker Started");

new Worker(
  "upload-processing",
  async (job) => {
    try {
      console.log("=================================");
      console.log("Processing Upload Job");
      console.log(job.data);

      // STEP 1 - Update Status
      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          status: "EXTRACTING_AUDIO",
          processingStartedAt: new Date(),
        },
      });

      // STEP 2 - Extract audio & thumbnail
      const mediaResult = await mediaService.processVideo(
        job.data.videoPath
      );

      console.log("Media Result:");
      console.log(mediaResult);

      // STEP 3 - Music Recognition
      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          status: "RECOGNIZING",
        },
      });

      const recognitionResult =
        await musicRecognitionService.recognize(
          mediaResult.audioPath
        );

      console.log("Recognition Result:");
      console.log(recognitionResult);

      // STEP 4 - Save Results
      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          audioPath: mediaResult.audioPath,
          thumbnailPath: mediaResult.thumbnailPath,
          status: "COMPLETED",
          processingEndedAt: new Date(),

          recognitionResult: {
            create: {
              trackTitle: recognitionResult.trackTitle ?? null,
              artist: recognitionResult.artist ?? null,
              album: recognitionResult.album ?? null,
              genre: recognitionResult.genre ?? null,
              confidence: recognitionResult.confidence ?? null,
              spotifyUrl: recognitionResult.spotifyUrl ?? null,
              youtubeUrl: recognitionResult.youtubeUrl ?? null,
              coverUrl: recognitionResult.coverUrl ?? null,
            },
          },
        },
      });

      console.log("✅ Upload updated successfully");
      console.log("=================================");
    } catch (error) {
      console.error("❌ Worker Error:", error);

      if (job.data?.uploadId) {
        await prisma.upload.update({
          where: {
            id: job.data.uploadId,
          },
          data: {
            status: "FAILED",
            processingEndedAt: new Date(),
          },
        });
      }
    }
  },
  {
    connection: redisConnection,
  }
);