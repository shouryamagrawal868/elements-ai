import { Request, Response } from "express";
import { uploadService } from "./upload.service";

export class UploadController {
  // ==========================
  // Upload Video
  // ==========================
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

  // ==========================
  // Get All Uploads
  // ==========================
  async getAllUploads(req: Request, res: Response) {
    try {
      const result = await uploadService.getAllUploads();

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch uploads",
      });
    }
  }

  // ==========================
  // Get Upload By ID
  // ==========================
  async getUploadById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await uploadService.getUploadById(id);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);

      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }
  }

  // ==========================
  // Delete Upload
  // ==========================
  async deleteUpload(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const result = await uploadService.deleteUpload(id);

      return res.status(200).json(result);
    } catch (error) {
      console.error(error);

      return res.status(404).json({
        success: false,
        message: "Upload not found",
      });
    }
  }
}

export const uploadController = new UploadController();