import { prisma } from "../../config/prisma";
import { uploadQueue } from "../../jobs";

export class UploadService {
  async upload(file: Express.Multer.File) {
    const DEFAULT_USER_ID = "development-user";

    // Find or create development user
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

    // Create upload record
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

    // Queue background job
    await uploadQueue.add("process-upload", {
      uploadId: upload.id,
      videoPath: file.path,
    });

    return {
      success: true,
      message: "Video uploaded successfully. Processing started.",
      upload,
    };
  }

  // Get upload by ID
  async getUploadById(uploadId: string) {
    const upload = await prisma.upload.findUnique({
      where: {
        id: uploadId,
      },
    });

    if (!upload) {
      throw new Error("Upload not found");
    }

    return {
      success: true,
      upload,
    };
  }
}

export const uploadService = new UploadService();