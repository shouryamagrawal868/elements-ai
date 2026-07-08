import { execFile } from "child_process";
import { promisify } from "util";
import { env } from "../../config/env";

const execFileAsync = promisify(execFile);

export async function generateFingerprint(audioPath: string) {
  const { stdout } = await execFileAsync(
    env.FPCALC_PATH,
    [audioPath]
  );

  const lines = stdout.split("\n");

  const durationLine = lines.find((l) =>
    l.startsWith("DURATION=")
  );

  const fingerprintLine = lines.find((l) =>
    l.startsWith("FINGERPRINT=")
  );

  return {
    duration: Number(durationLine?.replace("DURATION=", "")),
    fingerprint: fingerprintLine?.replace(
      "FINGERPRINT=",
      ""
    ),
  };
}