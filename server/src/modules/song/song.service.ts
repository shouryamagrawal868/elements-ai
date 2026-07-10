import { songRepository } from "./song.repository";

class SongService {
  async createSong(data: {
    title: string;
    duration?: number;
    language?: string;
    releaseYear?: number;
    source?: string;
  }) {
    return songRepository.create(data);
  }

  async getSong(id: string) {
    return songRepository.findById(id);
  }

  async searchSong(title: string) {
    return songRepository.findByTitle(title);
  }

  async getSongs() {
    return songRepository.getAll();
  }

  async deleteSong(id: string) {
    return songRepository.delete(id);
  }

  async getOrCreateUnknownSong() {
    const existing = await songRepository.findByTitle("Unknown Song");

    if (existing.length > 0) {
      return existing[0];
    }

    return songRepository.create({
      title: "Unknown Song",
      source: "SYSTEM",
    });
  }
}

export const songService = new SongService();