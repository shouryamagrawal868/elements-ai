import { ffmpegService } from "./ffmpeg.service";

class AudioService {
  async extract(videoPath: string) {
    const audioPath =
      await ffmpegService.extractAudio(videoPath);

    return {
      success: true,
      audioPath,
    };
  }
}

export const audioService = new AudioService();