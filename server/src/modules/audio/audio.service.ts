import { exec } from "child_process";
import path from "path";

export class AudioService {
  extractAudio(videoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputFileName =
        path.basename(videoPath, path.extname(videoPath)) + ".mp3";

      const outputPath = path.join("uploads", outputFileName);

      const command = `ffmpeg -y -i "${videoPath}" -vn -acodec libmp3lame "${outputPath}"`;

      exec(command, (error) => {
        if (error) {
          return reject(error);
        }

        resolve(outputPath);
      });
    });
  }
}

export const audioService = new AudioService();