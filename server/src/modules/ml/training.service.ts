import { prisma } from "../../config/prisma";
import { AudioFeatures } from "./featureExtractor";
import { RichAudioFeatures } from "../../services/pythonFeatures";

export class TrainingService {
  async saveFeatures(
    uploadId: string,
    features: AudioFeatures
  ) {
    return prisma.audioFeature.upsert({
      where: { uploadId },
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

  async saveRichFeatures(
    uploadId: string,
    features: RichAudioFeatures
  ) {
    return prisma.audioFeature.upsert({
      where: { uploadId },
      update: {
        duration: features.duration,
        sampleRate: features.sampleRate,
        tempo: features.tempo,
        mfcc: features.mfcc,
        chroma: features.chroma,
        spectralCentroid: features.spectralCentroid,
        spectralBandwidth: features.spectralBandwidth,
        zeroCrossingRate: features.zeroCrossingRate,
        rmsEnergy: features.rmsEnergy,
        rolloff: features.rolloff,
      },
      create: {
        uploadId,
        duration: features.duration,
        sampleRate: features.sampleRate,
        tempo: features.tempo,
        mfcc: features.mfcc,
        chroma: features.chroma,
        spectralCentroid: features.spectralCentroid,
        spectralBandwidth: features.spectralBandwidth,
        zeroCrossingRate: features.zeroCrossingRate,
        rmsEnergy: features.rmsEnergy,
        rolloff: features.rolloff,
      },
    });
  }
}

export const trainingService = new TrainingService();