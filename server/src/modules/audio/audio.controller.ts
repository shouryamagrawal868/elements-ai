import { Request, Response } from "express";
import { ffmpegService } from "./ffmpeg.service";

class AudioController {
  async extract(req: Request, res: Response) {
    try {
      if (!req.body.videoPath) {
        return res.status(400).json({
          success: false,
          message: "videoPath is required",
        });
      }

      const audioPath = await ffmpegService.extractAudio(
        req.body.videoPath
      );

      return res.json({
        success: true,
        audioPath,
      });
    } catch (err: any) {
      console.error(err);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
}

export const audioController = new AudioController();