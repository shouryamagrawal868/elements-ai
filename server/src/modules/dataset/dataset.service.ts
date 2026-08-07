import { prisma } from "../../config/prisma";
import { acoustIdService } from "../acoustid";
import { featureExtractor } from "../ml/featureExtractor";
import { trainingService } from "../ml/training.service";
import { extractRichFeatures } from "../../services/pythonFeatures";
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

    // 2. Get or create the dataset system user
    const systemUser = await prisma.user.upsert({
      where: { email: "dataset@elements-ai.internal" },
      update: {},
      create: {
        email: "dataset@elements-ai.internal",
        name: "Dataset Pipeline",
      },
    });

    // 3. Create a dataset upload record to satisfy FK constraints
    const datasetUpload = await prisma.upload.create({
      data: {
        userId: systemUser.id,
        fileName: input.title + " - " + input.artist,
        fileSize: 0,
        fileType: "audio/mp3",
        storagePath: audioFilePath,
        status: "COMPLETED",
      },
    });

    // 4. Generate Chromaprint fingerprint
    try {
      const fingerprintResult =
        await acoustIdService.generateFingerprint(
          audioFilePath
        );

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
    } catch (err) {
      console.error("Fingerprint generation failed:", err);
    }

    // 5. Extract basic features with Node.js
    try {
      const features = await featureExtractor.extract(
        audioFilePath
      );
      await trainingService.saveFeatures(
        datasetUpload.id,
        features
      );
      console.log("=================================");
      console.log("Basic features saved");
    } catch (err) {
      console.error("Basic feature extraction failed:", err);
    }

    // 6. Extract rich features with Python
    try {
      const richFeatures = await extractRichFeatures(
        audioFilePath
      );

      if (richFeatures) {
        await trainingService.saveRichFeatures(
          datasetUpload.id,
          richFeatures
        );
        console.log("=================================");
        console.log("Rich Python features saved!");
        console.log("Tempo:", richFeatures.tempo, "BPM");
        console.log(
          "MFCC coefficients:",
          richFeatures.mfcc.length
        );
      }
    } catch (err) {
      console.error("Rich feature extraction failed:", err);
    }

    // 7. Clean up temp file
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