import { Request, Response } from "express";
import { findSimilarSongs } from "../../services/similarityService";
import { mediaService } from "../media";
import fs from "fs";
import path from "path";

class RecognitionController {
  async identify(req: Request, res: Response) {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      console.log("=================================");
      console.log("Recognition Request");
      console.log("File:", file.originalname);
      console.log("Type:", file.mimetype);

      let audioPath = file.path;

      // If video file, extract audio first
      if (file.mimetype.startsWith("video/")) {
        console.log("Video detected — extracting audio...");
        const mediaResult = await mediaService.processVideo(
          file.path
        );
        audioPath = mediaResult.audioPath;
      }

      const databaseUrl = process.env.DATABASE_URL!;

      const result = await findSimilarSongs(
        audioPath,
        databaseUrl
      );

      // Clean up temp files
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        if (audioPath !== file.path && fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      } catch (e) {}

      if (!result) {
        return res.status(500).json({
          success: false,
          message: "Recognition failed",
        });
      }

      if (
        !result.topMatches ||
        result.topMatches.length === 0
      ) {
        return res.json({
          success: true,
          found: false,
          message: "No matching songs found in dataset",
        });
      }

      const bestMatch = result.topMatches[0];

      return res.json({
        success: true,
        found: true,
        bestMatch: {
          title: bestMatch.title,
          artist: bestMatch.artist,
          album: bestMatch.album,
          releaseYear: bestMatch.releaseYear,
          confidence: bestMatch.confidence,
          similarity: bestMatch.similarity,
        },
        allMatches: result.topMatches,
        totalSongsCompared: result.totalSongsCompared,
        queryFeatures: result.queryFeatures,
      });
    } catch (error) {
      console.error("Recognition error:", error);
      return res.status(500).json({
        success: false,
        message: "Recognition failed",
      });
    }
  }
}

export const recognitionController = new RecognitionController();