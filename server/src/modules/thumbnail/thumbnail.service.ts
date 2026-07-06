import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

export class ThumbnailService {
  async generateThumbnail(videoPath: string): Promise<string> {
    const thumbnailDir = path.join(process.cwd(), "uploads", "thumbnails");

    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }

    const thumbnailPath = path.join(
      thumbnailDir,
      `${Date.now()}.jpg`
    );

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          count: 1,
          folder: thumbnailDir,
          filename: path.basename(thumbnailPath),
          timemarks: ["2"],
        })
        .on("end", () => resolve(thumbnailPath))
        .on("error", reject);
    });
  }
}

export const thumbnailService = new ThumbnailService();