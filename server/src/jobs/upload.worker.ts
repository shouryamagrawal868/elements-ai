import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { mediaService } from "../modules/media";
import { prisma } from "../config/prisma";

console.log("🚀 Upload Worker Started");

new Worker(
  "upload-processing",
  async (job) => {
    try {
      console.log("=================================");
      console.log("Processing Upload Job");
      console.log(job.data);

      // Step 1: Extracting audio
      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          status: "EXTRACTING_AUDIO",
          processingStartedAt: new Date(),
        },
      });

      // Process the uploaded video
      const mediaResult = await mediaService.processVideo(
        job.data.videoPath
      );

      console.log("Media Processing Result:");
      console.log(mediaResult);

      // Step 2: Save processing result
      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          audioPath: mediaResult.audioPath,
          thumbnailPath: mediaResult.thumbnailPath,
          status: "COMPLETED",
          processingEndedAt: new Date(),
        },
      });

      console.log("✅ Upload updated successfully");
      console.log("=================================");
    } catch (error) {
      console.error("❌ Worker Error:");

      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          status: "FAILED",
          processingEndedAt: new Date(),
        },
      });

      console.error(error);
    }
  },
  {
    connection: redisConnection,
  }
);