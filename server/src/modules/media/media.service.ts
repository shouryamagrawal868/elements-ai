import { audioService } from "../audio/audio.service";
import { thumbnailService } from "../thumbnail/thumbnail.service";
import { MediaProcessingResult } from "./types";

export class MediaService {
  async processVideo(
    videoPath: string
  ): Promise<MediaProcessingResult> {

    // 1. Extract audio
    const audioResult = await audioService.extract(videoPath);

    // 2. Generate thumbnail
    const thumbnailPath =
      await thumbnailService.generateThumbnail(videoPath);

    return {
      audioPath: audioResult.audioPath,
      thumbnailPath,
    };
  }
}

export const mediaService = new MediaService();