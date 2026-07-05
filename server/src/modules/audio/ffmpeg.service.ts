import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

class FFmpegService {
  async extractAudio(videoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const audioDir = path.join(process.cwd(), "uploads", "audio");

      if (!fs.existsSync(audioDir)) {
        fs.mkdirSync(audioDir, { recursive: true });
      }

      const outputPath = path.join(
        audioDir,
        `${Date.now()}.mp3`
      );

      ffmpeg(videoPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .audioBitrate("192k")
        .format("mp3")
        .save(outputPath)
        .on("end", () => {
          resolve(outputPath);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  }
}

export const ffmpegService = new FFmpegService();