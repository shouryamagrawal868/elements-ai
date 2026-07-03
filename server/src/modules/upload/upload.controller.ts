import { Request, Response } from "express";
import { uploadService } from "./upload.service";

export class UploadController {
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await uploadService.upload(req.file);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to upload video",
      });
    }
  }
}

export const uploadController = new UploadController();