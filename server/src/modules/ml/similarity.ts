import { AudioFeatures } from "./featureExtractor";

export class SimilarityService {
  compare(
    featureA: AudioFeatures,
    featureB: AudioFeatures
  ): number {
    let score = 0;

    const durationDifference =
      Math.abs(featureA.duration - featureB.duration);

    if (durationDifference <= 2) {
      score += 0.25;
    }

    if (featureA.sampleRate === featureB.sampleRate) {
      score += 0.25;
    }

    if (featureA.channels === featureB.channels) {
      score += 0.25;
    }

    const bitrateDifference =
      Math.abs(featureA.bitrate - featureB.bitrate);

    if (bitrateDifference <= 16000) {
      score += 0.25;
    }

    return score;
  }
}

export const similarityService = new SimilarityService();