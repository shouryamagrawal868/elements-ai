import { prisma } from "../../config/prisma";
import { ffmpegService } from "../audio/ffmpeg.service";
import { musicService } from "../music/music.service";

export class UploadService {
  async upload(file: Express.Multer.File) {
    const DEFAULT_USER_ID = "development-user";

    let user = await prisma.user.findUnique({
      where: {
        id: DEFAULT_USER_ID,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEFAULT_USER_ID,
          email: "developer@elementsai.local",
          name: "Development User",
        },
      });
    }

    // Save upload
    const upload = await prisma.upload.create({
      data: {
        userId: user.id,
        fileName: file.filename,
        fileSize: file.size,
        fileType: file.mimetype,
        storagePath: file.path,
        status: "UPLOADED",
      },
    });

    // Extract audio
    const audioPath = await ffmpegService.extractAudio(file.path);

    // Save audio path
    const updatedUpload = await prisma.upload.update({
      where: {
        id: upload.id,
      },
      data: {
        audioPath,
        status: "RECOGNIZING",
      },
    });

    // Recognize music
    const recognition = await musicService.recognizeSong(
      audioPath,
      upload.id
    );

    // Update status
    await prisma.upload.update({
      where: {
        id: upload.id,
      },
      data: {
        status: "COMPLETED",
      },
    });

    return {
      success: true,
      upload: updatedUpload,
      recognition,
    };
  }
}

export const uploadService = new UploadService();