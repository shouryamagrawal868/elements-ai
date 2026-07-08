import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { mediaService } from "../modules/media";
import { acoustIdService } from "../modules/acoustid";
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

      // STEP 2 - Extract Audio & Thumbnail
      const mediaResult = await mediaService.processVideo(
        job.data.videoPath
      );

      console.log("=================================");
      console.log("Media Processing Complete");
      console.log(mediaResult);

      // STEP 3 - Generate Fingerprint
      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          status: "GENERATING_FINGERPRINT",
        },
      });

      const fingerprintResult =
        await acoustIdService.generateFingerprint(
          mediaResult.audioPath
        );

      console.log("=================================");
      console.log("Fingerprint Generated");
      console.log(fingerprintResult);

      // STEP 4 - Save Fingerprint
      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          audioPath: mediaResult.audioPath,
          thumbnailPath: mediaResult.thumbnailPath,
          status: "COMPLETED",
          processingEndedAt: new Date(),

          fingerprint: {
            create: {
              duration: fingerprintResult.duration,
              fingerprint: fingerprintResult.fingerprint,
            },
          },
        },
      });

      console.log("=================================");
      console.log("✅ Upload Processing Completed");
      console.log("=================================");
    } catch (error) {
      console.error("=================================");
      console.error("❌ Worker Error");
      console.error(error);
      console.error("=================================");

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

      throw error;
    }
  },
  {
    connection: redisConnection,
  }
);