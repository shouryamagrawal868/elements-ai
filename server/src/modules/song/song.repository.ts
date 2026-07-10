import { prisma } from "../../config/prisma";

class SongRepository {
  async create(data: {
    title: string;
    duration?: number;
    language?: string;
    releaseYear?: number;
    source?: string;
  }) {
    return prisma.song.create({
      data: {
        title: data.title,
        duration: data.duration,
        language: data.language,
        releaseYear: data.releaseYear,
        source: data.source,
      },
    });
  }

  async findById(id: string) {
    return prisma.song.findUnique({
      where: {
        id,
      },
      include: {
        fingerprints: true,
      },
    });
  }

  async findByTitle(title: string) {
    return prisma.song.findMany({
      where: {
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
      include: {
        fingerprints: true,
      },
    });
  }

  async getAll() {
    return prisma.song.findMany({
      include: {
        fingerprints: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async delete(id: string) {
    return prisma.song.delete({
      where: {
        id,
      },
    });
  }
}

export const songRepository = new SongRepository();