import { Request, Response } from "express";
import { datasetService } from "./dataset.service";

class DatasetController {
  async upload(req: Request, res: Response) {
    try {
      console.log("=================================");
      console.log("Dataset Upload Request");
      console.log("Body:", req.body);
      console.log("File:", req.file);

      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No audio file uploaded",
        });
      }

      const title = req.body?.title?.trim();
      const artist = req.body?.artist?.trim();
      const album = req.body?.album?.trim();
      const genre = req.body?.genre?.trim();
      const language = req.body?.language?.trim();
      const releaseYear = req.body?.releaseYear;

      if (!title || !artist) {
        return res.status(400).json({
          success: false,
          message: "title and artist are required",
          received: req.body,
        });
      }

      const result = await datasetService.processSong(
        file.path,
        {
          title,
          artist,
          album,
          genre,
          releaseYear: releaseYear
            ? parseInt(releaseYear)
            : undefined,
          language,
        }
      );

      return res.status(201).json(result);
    } catch (error) {
      console.error("Dataset upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to process song",
      });
    }
  }

  async bulkUpload(req: Request, res: Response) {
    try {
      console.log("=================================");
      console.log("Dataset Bulk Upload Request");

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No audio files uploaded",
        });
      }

      console.log("Files received:", files.length);

      const results = [];
      const errors = [];

      for (const file of files) {
        try {
          // Extract title and artist from filename
          // Expected format: "Artist - Title.mp3"
          const nameWithoutExt = file.originalname
            .replace(/\.[^/.]+$/, "")
            .trim();

          let title = nameWithoutExt;
          let artist = "Unknown Artist";

          if (nameWithoutExt.includes(" - ")) {
            const parts = nameWithoutExt.split(" - ");
            artist = parts[0].trim();
            title = parts.slice(1).join(" - ").trim();
          }

          console.log(`Processing: ${artist} - ${title}`);

          const result = await datasetService.processSong(
            file.path,
            { title, artist }
          );

          results.push(result);
        } catch (err) {
          console.error(
            `Failed to process ${file.originalname}:`,
            err
          );
          errors.push({
            fileName: file.originalname,
            error: "Processing failed",
          });
        }
      }

      return res.status(201).json({
        success: true,
        totalFiles: files.length,
        processed: results.length,
        failed: errors.length,
        results,
        errors,
      });
    } catch (error) {
      console.error("Bulk upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Bulk upload failed",
      });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await datasetService.getDatasetStats();
      return res.json({ success: true, ...stats });
    } catch (error) {
      console.error("Dataset stats error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get dataset stats",
      });
    }
  }
}

export const datasetController = new DatasetController();