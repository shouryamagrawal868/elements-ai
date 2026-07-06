import { Request, Response } from "express";
import { thumbnailService } from "./thumbnail.service";

class ThumbnailController {
  async generate(req: Request, res: Response) {
    try {
      const { videoPath } = req.body;

      if (!videoPath) {
        return res.status(400).json({
          success: false,
          message: "videoPath is required",
        });
      }

      const thumbnailPath =
        await thumbnailService.generateThumbnail(videoPath);

      return res.status(200).json({
        success: true,
        thumbnailPath,
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

export const thumbnailController =
  new ThumbnailController();