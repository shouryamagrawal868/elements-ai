import { acoustIdService } from "../acoustid";

export class MusicService {
  async generateFingerprint(audioPath: string) {
    return await acoustIdService.generateFingerprint(audioPath);
  }
}

export const musicService = new MusicService();