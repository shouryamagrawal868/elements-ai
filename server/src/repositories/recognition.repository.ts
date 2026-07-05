import { prisma } from "../config/prisma";

export class RecognitionRepository {
  async create(data: {
    uploadId: string;
    provider: string;
    title?: string;
    artist?: string;
    album?: string;
    confidence?: number;
    rawResponse?: any;
  }) {
    return prisma.recognitionResult.create({
      data: {
        uploadId: data.uploadId,

        trackTitle: data.title,
        artist: data.artist,
        album: data.album,

        confidence: data.confidence,

        rawResponse: data.rawResponse,

        engine:
          data.provider === "AudD"
            ? "AUDD"
            : "CUSTOM_AI",
      },
    });
  }
}

export const recognitionRepository =
  new RecognitionRepository();