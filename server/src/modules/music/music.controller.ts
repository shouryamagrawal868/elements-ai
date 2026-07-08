import { Request, Response } from "express";
import { musicService } from "./music.service";

class MusicController {
  async generateFingerprint(req: Request, res: Response) {
    try {
      const { audioPath } = req.body;

      if (!audioPath) {
        return res.status(400).json({
          success: false,
          message: "audioPath is required",
        });
      }

      const result = await musicService.generateFingerprint(audioPath);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}

export const musicController = new MusicController();