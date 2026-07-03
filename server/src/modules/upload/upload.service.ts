import { prisma } from "../../config/prisma";

export class UploadService {
  async upload(file: Express.Multer.File) {
    const video = await prisma.video.create({
      data: {
        fileName: file.filename,
        filePath: file.path,
      },
    });

    return {
      success: true,
      message: "Video uploaded successfully",
      video,
    };
  }
}

export const uploadService = new UploadService();