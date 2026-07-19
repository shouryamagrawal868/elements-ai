import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { env } from "../../config/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a video to Cloudinary
 */
export async function uploadVideo(
  filePath: string
): Promise<UploadApiResponse> {
  return await cloudinary.uploader.upload(filePath, {
    resource_type: "video",
    folder: "elements-ai/videos",
    overwrite: false,
  });
}

/**
 * Delete a video from Cloudinary
 */
export async function deleteVideo(publicId: string) {
  return await cloudinary.uploader.destroy(publicId, {
    resource_type: "video",
  });
}

// Default export
export default cloudinary;