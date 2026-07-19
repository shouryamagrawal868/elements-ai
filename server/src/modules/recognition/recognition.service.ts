import { prisma } from "../../config/prisma";
import { compareFingerprints } from "../../utils/fingerprintMatcher";

export class RecognitionService {
  async findSongByFingerprint(fingerprint: string) {
    const fingerprints = await prisma.fingerprint.findMany({
      include: {
        song: true,
      },
    });

    if (fingerprints.length === 0) {
      return null;
    }

    let bestMatch = null;
    let highestScore = 0;

    for (const record of fingerprints) {
      const score = compareFingerprints(
        fingerprint,
        record.fingerprint
      );

      if (score > highestScore) {
        highestScore = score;
        bestMatch = record.song;
      }
    }

    if (highestScore >= 0.80) {
      return bestMatch;
    }

    return null;
  }
}

export const recognitionService = new RecognitionService();