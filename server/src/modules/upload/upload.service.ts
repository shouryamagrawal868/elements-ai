import { prisma } from "../../config/prisma";

export class UploadService {
  async upload(file: Express.Multer.File) {
    // Temporary development user.
    // Later this will come from JWT authentication.
    const DEFAULT_USER_ID = "development-user";

    // Check if the development user exists
    let user = await prisma.user.findUnique({
      where: {
        id: DEFAULT_USER_ID,
      },
    });

    // Create the development user if it doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: DEFAULT_USER_ID,
          email: "developer@elementsai.local",
          name: "Development User",
        },
      });
    }

    // Create Upload record
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

    return {
      success: true,
      message: "Video uploaded successfully",
      upload,
    };
  }
}

export const uploadService = new UploadService();