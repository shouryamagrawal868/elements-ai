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