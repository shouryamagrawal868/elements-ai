import { prisma } from "../../config/prisma";
import { compareFingerprints } from "../../utils/fingerprintMatcher";

export class RecognitionService {
  async findSongByFingerprint(fingerprint: string) {
    console.log("=================================");
    console.log("Starting Local Fingerprint Recognition");
    console.log("=================================");

    const fingerprints = await prisma.fingerprint.findMany({
      include: {
        song: true,
      },
    });

    if (fingerprints.length === 0) {
      console.log("No fingerprints found in database");
      return null;
    }

    let bestMatch = null;
    let highestScore = 0;

    for (const record of fingerprints) {
      if (!record.song) continue;

      const score = compareFingerprints(
        fingerprint,
        record.fingerprint
      );

      console.log(
        `Comparing fingerprint with song: ${record.song.title}`
      );
      console.log(
        `Similarity Score: ${score.toFixed(4)}`
      );

      if (score > highestScore) {
        highestScore = score;
        bestMatch = record.song;
      }
    }

    const MATCH_THRESHOLD = 0.8;

    // --------------------------------------------------
    // Ignore placeholder songs so we continue to AcoustID
    // --------------------------------------------------
    if (
      bestMatch &&
      highestScore >= MATCH_THRESHOLD &&
      bestMatch.source !== "SYSTEM"
    ) {
      console.log("=================================");
      console.log("Local Fingerprint Match Found");
      console.log("Song:", bestMatch.title);
      console.log("Artist:", bestMatch.artist);
      console.log("Confidence:", highestScore.toFixed(4));
      console.log("=================================");

      return {
        song: bestMatch,
        confidence: highestScore,
      };
    }

    if (
      bestMatch &&
      highestScore >= MATCH_THRESHOLD &&
      bestMatch.source === "SYSTEM"
    ) {
      console.log("=================================");
      console.log("Matched only an UNKNOWN song.");
      console.log("Ignoring local result...");
      console.log("Trying AcoustID / MusicBrainz...");
      console.log("=================================");

      return null;
    }

    console.log("=================================");
    console.log("No Local Fingerprint Match Found");
    console.log(
      "Highest Score:",
      highestScore.toFixed(4)
    );
    console.log("=================================");

    return null;
  }
}

export const recognitionService = new RecognitionService();