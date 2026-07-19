import { prisma } from "../../config/prisma";
import { AudioFeatures } from "./featureExtractor";

export class TrainingService {
  async saveFeatures(
    uploadId: string,
    features: AudioFeatures
  ) {
    return prisma.audioFeature.upsert({
      where: {
        uploadId,
      },
      update: {
        duration: features.duration,
        sampleRate: features.sampleRate,
        channels: features.channels,
        bitrate: features.bitrate,
      },
      create: {
        uploadId,
        duration: features.duration,
        sampleRate: features.sampleRate,
        channels: features.channels,
        bitrate: features.bitrate,
      },
    });
  }
}

export const trainingService = new TrainingService();