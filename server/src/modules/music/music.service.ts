import { ProviderFactory } from "../../providers/music";

export class MusicService {
  private provider = ProviderFactory.getMusicProvider();

  async recognizeSong(audioPath: string) {
    return this.provider.recognize(audioPath);
  }
}

export const musicService = new MusicService();