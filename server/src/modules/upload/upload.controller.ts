import { Request, Response } from "express";
import { uploadService } from "./upload.service";

export class UploadController {
  async upload(req: Request, res: Response) {
    try {
      console.log("========== DEBUG ==========");
      console.log("req.headers:", req.headers);
      console.log("req.body:", req.body);
      console.log("req.file:", req.file);

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

  async getUploadById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      console.log("========== GET UPLOAD ==========");
      console.log("Upload ID:", id);

      const result = await uploadService.getUploadById(id);

      console.log("Upload Found:");
      console.log(result);

      return res.status(200).json(result);
    } catch (error) {
      console.error("GET Upload Error:");
      console.error(error);

      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }
  }
}

export const uploadController = new UploadController();