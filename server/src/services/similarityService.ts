import { spawn } from "child_process";
import path from "path";

export interface SimilarityMatch {
  songId: string;
  title: string;
  artist: string;
  album: string | null;
  releaseYear: number | null;
  similarity: number;
  confidence: string;
}

export interface SimilarityResult {
  queryFeatures: {
    tempo: number;
    duration: number;
  };
  totalSongsCompared: number;
  topMatches: SimilarityMatch[];
}

export async function findSimilarSongs(
  audioPath: string,
  databaseUrl: string
): Promise<SimilarityResult | null> {
  return new Promise((resolve) => {
    // Try multiple possible script locations
    const possiblePaths = [
      path.join(__dirname, "../../python/similarity_engine.py"),
      path.join(__dirname, "../../../python/similarity_engine.py"),
      path.join(process.cwd(), "python/similarity_engine.py"),
    ];

    const scriptPath = possiblePaths[0];

    console.log("=================================");
    console.log("Similarity Engine Starting...");
    console.log("Audio:", audioPath);
    console.log("Script:", scriptPath);

    // Try python3 first, fall back to python
    const pythonCmd =
      process.platform === "win32" ? "python" : "python3";

    const python = spawn(pythonCmd, [
      scriptPath,
      audioPath,
      databaseUrl.trim(),
    ]);

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.log("Python:", data.toString().trim());
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("Similarity engine failed:", errorOutput);
        resolve(null);
        return;
      }

      try {
        const result = JSON.parse(output.trim());
        console.log("=================================");
        console.log("Similarity Results:");
        console.log(
          "Songs compared:",
          result.totalSongsCompared
        );
        if (result.topMatches?.length > 0) {
          const top = result.topMatches[0];
          console.log(
            `Best match: ${top.artist} - ${top.title} (${top.confidence})`
          );
        }
        resolve(result);
      } catch (err) {
        console.error("Failed to parse similarity output:", err);
        resolve(null);
      }
    });

    python.on("error", (err) => {
      console.error("Failed to start Python:", err);
      resolve(null);
    });
  });
}