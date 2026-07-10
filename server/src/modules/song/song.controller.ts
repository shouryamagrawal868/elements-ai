import { Request, Response } from "express";
import { songService } from "./song.service";

class SongController {
  async create(req: Request, res: Response) {
    try {
      const song = await songService.createSong(req.body);

      return res.status(201).json({
        success: true,
        data: song,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const songs = await songService.getSongs();

      return res.status(200).json({
        success: true,
        data: songs,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const song = await songService.getSong(req.params.id);

      if (!song) {
        return res.status(404).json({
          success: false,
          message: "Song not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: song,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await songService.deleteSong(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Song deleted successfully",
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export const songController = new SongController();