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
import { findSimilarSongs } from "../services/similarityService";

console.log("Upload Worker Started");

new Worker(
  "upload-processing",
  async (job) => {
    try {
      console.log("=================================");
      console.log("Processing Upload Job");
      console.log(job.data);

      await prisma.upload.update({
        where: { id: job.data.uploadId },
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
        where: { id: job.data.uploadId },
        data: { status: "GENERATING_FINGERPRINT" },
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
        // Step 1 — Try our own similarity engine first
        console.log("=================================");
        console.log("Trying similarity engine...");

        const databaseUrl = process.env.DATABASE_URL!;
        const similarityResult = await findSimilarSongs(
          mediaResult.audioPath,
          databaseUrl
        );

        if (
          similarityResult &&
          similarityResult.topMatches.length > 0
        ) {
          const bestMatch = similarityResult.topMatches[0];

          // Only use match if confidence is above 95%
          if (bestMatch.similarity >= 0.95) {
            // Find the song in our database
            const existingSong = await prisma.song.findUnique({
              where: { id: bestMatch.songId },
            });

            if (existingSong) {
              song = existingSong;
              console.log("=================================");
              console.log("Song identified by similarity engine!");
              console.log("Title:", song.title);
              console.log("Artist:", song.artist);
              console.log("Confidence:", bestMatch.confidence);
            }
          } else {
            console.log("=================================");
            console.log(
              "Similarity too low:",
              bestMatch.confidence
            );
          }
        }

        // Step 2 — Fall back to AcoustID if similarity failed
        if (!song) {
          console.log("=================================");
          console.log("Trying AcoustID...");

          const acoustIdResult =
            await acoustIdIntegration.lookup(
              fingerprintResult.fingerprint,
              fingerprintResult.duration
            );

          if (acoustIdResult.found) {
            let mbResult: any = { found: false };

            if (acoustIdResult.recordingId) {
              mbResult =
                await musicBrainzService.getRecording(
                  acoustIdResult.recordingId
                );
            }

            song = await prisma.song.create({
              data: {
                title:
                  mbResult.title ??
                  acoustIdResult.title ??
                  "Unknown Song",
                artist:
                  mbResult.artist ?? acoustIdResult.artist,
                album:
                  mbResult.album ?? acoustIdResult.album,
                releaseYear:
                  mbResult.releaseYear ??
                  acoustIdResult.releaseYear,
                duration:
                  mbResult.duration ??
                  acoustIdResult.duration,
                language: mbResult.genre ?? null,
                acoustidRecordingId:
                  acoustIdResult.recordingId,
                source: "ACOUSTID",
              },
            });

            console.log("=================================");
            console.log("Song identified via AcoustID!");
            console.log("Title:", song.title);
            console.log("Artist:", song.artist);
          } else {
            // Step 3 — Unknown song
            song = await prisma.song.create({
              data: {
                title: "Unknown Song",
                source: "SYSTEM",
              },
            });

            console.log("=================================");
            console.log("No match found — Unknown Song");
          }
        }
      } else {
        console.log("=================================");
        console.log("Song found in local database");
        console.log(song);
      }

      await trainingService.saveFeatures(
        job.data.uploadId,
        features
      );
      console.log("=================================");
      console.log("Training Data Saved");

      await prisma.upload.update({
        where: { id: job.data.uploadId },
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
          where: { id: job.data.uploadId },
          data: {
            status: "FAILED",
            processingEndedAt: new Date(),
          },
        });
      }
      throw error;
    }
  },
  { connection: redisConnection }
);import { Worker } from "bullmq";
import { redisConnection } from "./connection";
import { prisma } from "../config/prisma";
import { mediaService } from "../modules/media";
import { acoustIdService } from "../modules/acoustid";
import { recognitionService } from "../modules/recognition/recognition.service";
import { acoustIdIntegration } from "../integrations/acoustid";
import { musicBrainzService } from "../integrations/musicbrainz";
import { featureExtractor } from "../modules/ml/featureExtractor";
import { trainingService } from "../modules/ml/training.service";
import { findSimilarSongs } from "../services/similarityService";

console.log("Upload Worker Started");

new Worker(
  "upload-processing",
  async (job) => {
    try {
      console.log("=================================");
      console.log("Processing Upload Job");
      console.log(job.data);

      await prisma.upload.update({
        where: { id: job.data.uploadId },
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
        where: { id: job.data.uploadId },
        data: { status: "GENERATING_FINGERPRINT" },
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
        // Step 1 — Try our own similarity engine first
        console.log("=================================");
        console.log("Trying similarity engine...");

        const databaseUrl = process.env.DATABASE_URL!;
        const similarityResult = await findSimilarSongs(
          mediaResult.audioPath,
          databaseUrl
        );

        if (
          similarityResult &&
          similarityResult.topMatches.length > 0
        ) {
          const bestMatch = similarityResult.topMatches[0];

          // Only use match if confidence is above 95%
          if (bestMatch.similarity >= 0.95) {
            // Find the song in our database
            const existingSong = await prisma.song.findUnique({
              where: { id: bestMatch.songId },
            });

            if (existingSong) {
              song = existingSong;
              console.log("=================================");
              console.log("Song identified by similarity engine!");
              console.log("Title:", song.title);
              console.log("Artist:", song.artist);
              console.log("Confidence:", bestMatch.confidence);
            }
          } else {
            console.log("=================================");
            console.log(
              "Similarity too low:",
              bestMatch.confidence
            );
          }
        }

        // Step 2 — Fall back to AcoustID if similarity failed
        if (!song) {
          console.log("=================================");
          console.log("Trying AcoustID...");

          const acoustIdResult =
            await acoustIdIntegration.lookup(
              fingerprintResult.fingerprint,
              fingerprintResult.duration
            );

          if (acoustIdResult.found) {
            let mbResult: any = { found: false };

            if (acoustIdResult.recordingId) {
              mbResult =
                await musicBrainzService.getRecording(
                  acoustIdResult.recordingId
                );
            }

            song = await prisma.song.create({
              data: {
                title:
                  mbResult.title ??
                  acoustIdResult.title ??
                  "Unknown Song",
                artist:
                  mbResult.artist ?? acoustIdResult.artist,
                album:
                  mbResult.album ?? acoustIdResult.album,
                releaseYear:
                  mbResult.releaseYear ??
                  acoustIdResult.releaseYear,
                duration:
                  mbResult.duration ??
                  acoustIdResult.duration,
                language: mbResult.genre ?? null,
                acoustidRecordingId:
                  acoustIdResult.recordingId,
                source: "ACOUSTID",
              },
            });

            console.log("=================================");
            console.log("Song identified via AcoustID!");
            console.log("Title:", song.title);
            console.log("Artist:", song.artist);
          } else {
            // Step 3 — Unknown song
            song = await prisma.song.create({
              data: {
                title: "Unknown Song",
                source: "SYSTEM",
              },
            });

            console.log("=================================");
            console.log("No match found — Unknown Song");
          }
        }
      } else {
        console.log("=================================");
        console.log("Song found in local database");
        console.log(song);
      }

      await trainingService.saveFeatures(
        job.data.uploadId,
        features
      );
      console.log("=================================");
      console.log("Training Data Saved");

      await prisma.upload.update({
        where: { id: job.data.uploadId },
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
          where: { id: job.data.uploadId },
          data: {
            status: "FAILED",
            processingEndedAt: new Date(),
          },
        });
      }
      throw error;
    }
  },
  { connection: redisConnection }
);