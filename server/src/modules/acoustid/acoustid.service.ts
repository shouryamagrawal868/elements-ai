import { execFile } from "child_process";
import { promisify } from "util";

import { env } from "../../config/env";
import { FingerprintResult } from "./acoustid.types";

const exec = promisify(execFile);

class AcoustIdService {
  async generateFingerprint(
    audioPath: string
  ): Promise<FingerprintResult> {
    console.log("=================================");
    console.log("Generating Fingerprint...");
    console.log("Audio:", audioPath);

    // Generate fingerprint using fpcalc
    const { stdout } = await exec(env.FPCALC_PATH, [audioPath]);

    const durationMatch = stdout.match(/DURATION=(\d+)/);
    const fingerprintMatch = stdout.match(/FINGERPRINT=(.+)/);

    if (!durationMatch || !fingerprintMatch) {
      throw new Error("Unable to generate fingerprint.");
    }

    const duration = Number(durationMatch[1]);
    const fingerprint = fingerprintMatch[1];

    console.log("=================================");
    console.log("Fingerprint Generated Successfully");
    console.log("Duration:", duration);
    console.log("Fingerprint Length:", fingerprint.length);
    console.log("=================================");

    return {
      duration,
      fingerprint,
    };
  }
}

export const acoustIdService = new AcoustIdService();