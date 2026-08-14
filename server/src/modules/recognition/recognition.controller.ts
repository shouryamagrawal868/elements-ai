import { Request, Response } from "express";
import { mediaService } from "../media";
import { featureExtractor } from "../ml/featureExtractor";
import { trainingService } from "../ml/training.service";
import { findSimilarSongsNode } from "../../services/similarityEngineNode";
import { prisma } from "../../config/prisma";
import fs from "fs";


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

      // Extract basic audio features
      const features = await featureExtractor.extract(audioPath);

      // Create a temporary upload record for feature storage
      const systemUser = await prisma.user.upsert({
        where: { email: "recognition@elements-ai.internal" },
        update: {},
        create: {
          email: "recognition@elements-ai.internal",
          name: "Recognition Pipeline",
        },
      });

      const tempUpload = await prisma.upload.create({
        data: {
          userId: systemUser.id,
          fileName: file.originalname,
          fileSize: file.size,
          fileType: file.mimetype,
          storagePath: audioPath,
          status: "COMPLETED",
        },
      });

      // Save features
      await trainingService.saveFeatures(tempUpload.id, features);

      // Run Node.js similarity engine
      const result = await findSimilarSongsNode(tempUpload.id);

      // Clean up temp files
      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        if (audioPath !== file.path && fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath);
        }
      } catch (e) {}

      if (!result || result.topMatches.length === 0) {
        return res.json({
          success: true,
          found: false,
          message: "No matching songs found in dataset",
        });
      }

      const bestMatch = result.topMatches[0];

      if (bestMatch.similarity < 0.9) {
        return res.json({
          success: true,
          found: false,
          message: "No confident match found",
          bestAttempt: bestMatch,
        });
      }

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