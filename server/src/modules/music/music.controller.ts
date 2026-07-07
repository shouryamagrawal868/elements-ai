import { Request, Response } from "express";
import { musicService } from "./music.service";

class MusicController {
  async recognize(req: Request, res: Response) {
    try {
      const { audioPath, uploadId } = req.body;

      if (!audioPath || !uploadId) {
        return res.status(400).json({
          success: false,
          message: "audioPath and uploadId are required",
        });
      }

      const result = await musicService.recognizeSong(
        audioPath,
        uploadId
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const musicController = new MusicController();