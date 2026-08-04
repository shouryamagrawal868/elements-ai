import { prisma } from "../../config/prisma";
import { acoustIdService } from "../acoustid";
import { featureExtractor } from "../ml/featureExtractor";
import { DatasetUploadInput, DatasetUploadResult } from "./dataset.types";
import fs from "fs";

class DatasetService {
  async processSong(
    audioFilePath: string,
    input: DatasetUploadInput
  ): Promise<DatasetUploadResult> {
    console.log("=================================");
    console.log("Dataset: Processing Song");
    console.log("Title:", input.title);
    console.log("Artist:", input.artist);

    // 1. Create song record
    const song = await prisma.song.create({
      data: {
        title: input.title,
        artist: input.artist,
        album: input.album ?? null,
        releaseYear: input.releaseYear ?? null,
        language: input.language ?? null,
        source: "DATASET",
      },
    });

    console.log("=================================");
    console.log("Song created:", song.id);

    let fingerprintGenerated = false;

    // 2. Generate fingerprint and store against songId
    try {
      const fingerprintResult =
        await acoustIdService.generateFingerprint(
          audioFilePath
        );

      // Store fingerprint using songId as both uploadId and songId
      // We use a dedicated dataset upload record to satisfy the FK
      const datasetUpload = await prisma.upload.create({
        data: {
          userId: "dataset-pipeline",
          fileName: input.title + " - " + input.artist,
          fileSize: 0,
          fileType: "audio/mp3",
          storagePath: audioFilePath,
          status: "COMPLETED",
        },
      });

      await prisma.fingerprint.create({
        data: {
          uploadId: datasetUpload.id,
          songId: song.id,
          duration: fingerprintResult.duration,
          fingerprint: fingerprintResult.fingerprint,
          algorithm: "Chromaprint",
        },
      });

      fingerprintGenerated = true;

      console.log("=================================");
      console.log("Fingerprint saved for song:", song.id);

      // 3. Extract and save audio features
      try {
        const features = await featureExtractor.extract(
          audioFilePath
        );

        await prisma.audioFeature.upsert({
          where: { uploadId: datasetUpload.id },
          create: {
            uploadId: datasetUpload.id,
            duration: features.duration,
            sampleRate: features.sampleRate,
            channels: features.channels,
            bitrate: features.bitrate,
          },
          update: {
            duration: features.duration,
            sampleRate: features.sampleRate,
            channels: features.channels,
            bitrate: features.bitrate,
          },
        });

        console.log("=================================");
        console.log("Audio features saved for song:", song.id);
      } catch (err) {
        console.error("Feature extraction failed:", err);
      }
    } catch (err) {
      console.error("Fingerprint generation failed:", err);
    }

    // 4. Clean up temp file
    try {
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    } catch (err) {
      console.error("Cleanup failed:", err);
    }

    return {
      success: true,
      songId: song.id,
      title: song.title,
      artist: song.artist ?? "",
      fingerprintGenerated,
      message: "Song added to dataset successfully",
    };
  }

  async getDatasetStats() {
    const totalSongs = await prisma.song.count({
      where: { source: "DATASET" },
    });

    const totalFingerprints = await prisma.fingerprint.count();

    const songs = await prisma.song.findMany({
      where: { source: "DATASET" },
      select: {
        id: true,
        title: true,
        artist: true,
        album: true,
        releaseYear: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      totalSongs,
      totalFingerprints,
      recentSongs: songs,
    };
  }
}

export const datasetService = new DatasetService();