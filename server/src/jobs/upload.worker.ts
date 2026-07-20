import { Worker } from "bullmq";

import { redisConnection } from "./connection";
import { prisma } from "../config/prisma";

import { mediaService } from "../modules/media";
import { acoustIdService } from "../modules/acoustid";
import { recognitionService } from "../modules/recognition/recognition.service";
import { acoustIdIntegration } from "../integrations/acoustid";

import { featureExtractor } from "../modules/ml/featureExtractor";
import { trainingService } from "../modules/ml/training.service";

console.log("Upload Worker Started");

new Worker(
  "upload-processing",
  async (job) => {
    try {
      console.log("=================================");
      console.log("Processing Upload Job");
      console.log(job.data);

      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },
        data: {
          status: "EXTRACTING_AUDIO",
          processingStartedAt: new Date(),
        },
      });

      const mediaResult = await mediaService.processVideo(
        job.data.videoPath
      );

      console.log("=================================");
      console.log("Media Processing Complete");
      console.log(mediaResult);

      const features = await featureExtractor.extract(
        mediaResult.audioPath
      );

      console.log("=================================");
      console.log("Audio Features");
      console.log(features);

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

      let song =
        await recognitionService.findSongByFingerprint(
          fingerprintResult.fingerprint
        );

      if (!song) {
        // Try AcoustID lookup for real song identification
        const acoustIdResult = await acoustIdIntegration.lookup(
          fingerprintResult.fingerprint,
          fingerprintResult.duration
        );

        if (acoustIdResult.found) {
          song = await prisma.song.create({
            data: {
              title: acoustIdResult.title ?? "Unknown Song",
              artist: acoustIdResult.artist,
              album: acoustIdResult.album,
              releaseYear: acoustIdResult.releaseYear,
              duration: acoustIdResult.duration,
              acoustidRecordingId: acoustIdResult.recordingId,
              source: "ACOUSTID",
            },
          });

          console.log("=================================");
          console.log("Song Identified via AcoustID!");
          console.log("Title:", song.title);
          console.log("Artist:", song.artist);
          console.log("Album:", song.album);
          console.log("Year:", song.releaseYear);
          console.log("=================================");
        } else {
          song = await prisma.song.create({
            data: {
              title: "Unknown Song",
              source: "SYSTEM",
            },
          });

          console.log("=================================");
          console.log("No Match Found — created Unknown Song");
          console.log("=================================");
        }
      } else {
        console.log("=================================");
        console.log("Song Recognized from local database");
        console.log(song);
      }

      await trainingService.saveFeatures(
        job.data.uploadId,
        features
      );

      console.log("=================================");
      console.log("Training Data Saved");

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
              songId: song.id,
              duration: fingerprintResult.duration,
              fingerprint: fingerprintResult.fingerprint,
              algorithm: "Chromaprint",
            },
          },
        },
      });

      console.log("=================================");
      console.log("Upload Processing Completed");
      console.log("=================================");
    } catch (error) {
      console.error("=================================");
      console.error("Worker Error");
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