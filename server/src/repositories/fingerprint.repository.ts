import { prisma } from "../config/prisma";

export class FingerprintRepository {
  async create(data: {
    uploadId: string;
    duration: number;
    fingerprint: string;
    algorithm?: string;
    version?: string;
  }) {
    return prisma.fingerprint.create({
      data: {
        uploadId: data.uploadId,
        duration: data.duration,
        fingerprint: data.fingerprint,
        algorithm: data.algorithm ?? "Chromaprint",
        version: data.version ?? "fpcalc-1.6",
      },
    });
  }

  async findByUploadId(uploadId: string) {
    return prisma.fingerprint.findUnique({
      where: {
        uploadId,
      },
    });
  }

  async getAll() {
    return prisma.fingerprint.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export const fingerprintRepository =
  new FingerprintRepository();