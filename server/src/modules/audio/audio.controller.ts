import { Request, Response } from "express";
import { audioService } from "./audio.service";

class AudioController {
  async extract(req: Request, res: Response) {
    try {
      console.log("========== REQUEST FILE ==========");
      console.log(req.file);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video uploaded",
        });
      }

      const audioPath = await audioService.extractAudio(req.file.path);

      return res.status(200).json({
        success: true,
        message: "Audio extracted successfully",
        audioPath,
      });
    } catch (error: any) {
      console.error("========== AUDIO ERROR ==========");
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Audio extraction failed",
        error: error.message,
      });
    }
  }
}

export const audioController = new AudioController();