import { ProviderFactory } from "../../providers/music";
import { recognitionRepository } from "../../repositories/recognition.repository";

export class MusicService {
  private provider = ProviderFactory.getMusicProvider();

  async recognizeSong(audioPath: string, uploadId: string) {
    const result = await this.provider.recognize(audioPath);

    await recognitionRepository.create({
      uploadId,
      provider: result.provider,
      title: result.title,
      artist: result.artist,
      album: result.album,
      confidence: result.confidence,
      rawResponse: result.rawResponse,
    });

    return result;
  }
}

export const musicService = new MusicService();