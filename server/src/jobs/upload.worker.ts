import { Worker } from "bullmq";

import { redisConnection } from "./connection";
import { prisma } from "../config/prisma";

import { mediaService } from "../modules/media";
import { acoustIdService } from "../modules/acoustid";
import { recognitionService } from "../modules/recognition/recognition.service";

import { acoustIdIntegration } from "../integrations/acoustid";
import { musicBrainzService } from "../integrations/musicbrainz";

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

      // STEP 1 - Update Upload Status
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

      // STEP 3 - Extract Audio Features
      const features = await featureExtractor.extract(
        mediaResult.audioPath
      );

      console.log("=================================");
      console.log("Audio Features");
      console.log(features);

      // STEP 4 - Generate Fingerprint
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

      // STEP 5 - Try Local Fingerprint Recognition
      const recognitionResult =
        await recognitionService.findSongByFingerprint(
          fingerprintResult.fingerprint
        );

      let song;

      if (recognitionResult) {
        // Local database match found
        song = recognitionResult.song;

        console.log("=================================");
        console.log("Song Recognized from Local Database");
        console.log("Title:", song.title);
        console.log("Artist:", song.artist);
        console.log("Album:", song.album);
        console.log(
          "Confidence:",
          recognitionResult.confidence.toFixed(4)
        );
        console.log("=================================");
      } else {
        // No local match found
        console.log("=================================");
        console.log("No Local Fingerprint Match Found");
        console.log("Trying AcoustID...");
        console.log("=================================");

        // STEP 6 - Try AcoustID
        const acoustIdResult =
          await acoustIdIntegration.lookup(
            fingerprintResult.fingerprint,
            fingerprintResult.duration
          );

        if (acoustIdResult.found) {
          // STEP 7 - Get MusicBrainz Metadata
          let mbResult: any = {
            found: false,
          };

          if (acoustIdResult.recordingId) {
            mbResult =
              await musicBrainzService.getRecording(
                acoustIdResult.recordingId
              );
          }

          // STEP 8 - Create Song
          song = await prisma.song.create({
            data: {
              title:
                mbResult.title ??
                acoustIdResult.title ??
                "Unknown Song",

              artist:
                mbResult.artist ??
                acoustIdResult.artist ??
                null,

              album:
                mbResult.album ??
                acoustIdResult.album ??
                null,

              releaseYear:
                mbResult.releaseYear ??
                acoustIdResult.releaseYear ??
                null,

              duration:
                mbResult.duration ??
                acoustIdResult.duration ??
                null,

              language:
                mbResult.genre ??
                null,

              acoustidRecordingId:
                acoustIdResult.recordingId ??
                null,

              source: "MUSICBRAINZ",
            },
          });

          console.log("=================================");
          console.log("Song Identified via AcoustID");
          console.log("Title:", song.title);
          console.log("Artist:", song.artist);
          console.log("Album:", song.album);
          console.log("Year:", song.releaseYear);
          console.log("Genre:", song.language);
          console.log("=================================");
        } else {
          // STEP 9 - No Match Anywhere
          song = await prisma.song.create({
            data: {
              title: "Unknown Song",
              source: "SYSTEM",
            },
          });

          console.log("=================================");
          console.log("No Match Found");
          console.log("Created Unknown Song");
          console.log("=================================");
        }
      }

      // STEP 10 - Save Audio Features
      await trainingService.saveFeatures(
        job.data.uploadId,
        features
      );

      console.log("=================================");
      console.log("Audio Features Saved");
      console.log("=================================");

      // STEP 11 - Save Upload + Fingerprint
      await prisma.upload.update({
        where: {
          id: job.data.uploadId,
        },

        data: {
          audioPath: mediaResult.audioPath,

          thumbnailPath:
            mediaResult.thumbnailPath,

          status: "COMPLETED",

          processingEndedAt: new Date(),

          fingerprint: {
            create: {
              songId: song.id,

              duration:
                fingerprintResult.duration,

              fingerprint:
                fingerprintResult.fingerprint,

              algorithm: "Chromaprint",
            },
          },
        },
      });

      console.log("=================================");
      console.log("Upload Processing Completed");
      console.log("Song:", song.title);
      console.log("=================================");
    } catch (error) {
      console.error("=================================");
      console.error("Worker Error");
      console.error(error);
      console.error("=================================");

      // STEP 12 - Mark Upload as Failed
      if (job.data?.uploadId) {
        try {
          await prisma.upload.update({
            where: {
              id: job.data.uploadId,
            },

            data: {
              status: "FAILED",
              processingEndedAt: new Date(),
            },
          });
        } catch (updateError) {
          console.error(
            "Failed to update upload status:",
            updateError
          );
        }
      }

      throw error;
    }
  },

  {
    connection: redisConnection,
  }
);