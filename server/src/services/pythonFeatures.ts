import { spawn } from "child_process";
import path from "path";

export interface RichAudioFeatures {
  duration: number;
  tempo: number;
  mfcc: number[];
  chroma: number[];
  spectralCentroid: number;
  spectralBandwidth: number;
  zeroCrossingRate: number;
  rmsEnergy: number;
  rolloff: number;
  sampleRate: number;
}

export async function extractRichFeatures(
  audioPath: string
): Promise<RichAudioFeatures | null> {
  return new Promise((resolve) => {
    const scriptPath = path.join(
      __dirname,
      "../../../python/extract_features.py"
    );

    console.log("=================================");
    console.log("Python Feature Extraction Starting...");
    console.log("Audio:", audioPath);
    console.log("Script:", scriptPath);

    const python = spawn("python", [scriptPath, audioPath]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script failed:", errorOutput);
        resolve(null);
        return;
      }

      try {
        const features = JSON.parse(output.trim());
        console.log("=================================");
        console.log("Python Features Extracted:");
        console.log("Tempo:", features.tempo, "BPM");
        console.log("MFCC length:", features.mfcc?.length);
        console.log("Chroma length:", features.chroma?.length);
        resolve(features);
      } catch (err) {
        console.error("Failed to parse Python output:", err);
        console.error("Raw output:", output);
        resolve(null);
      }
    });

    python.on("error", (err) => {
      console.error("Failed to start Python:", err);
      resolve(null);
    });
  });
}