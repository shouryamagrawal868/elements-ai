import { Router } from "express";
import multer from "multer";
import { uploadController } from "./upload.controller";

const router = Router();

const upload = multer({
  dest: "uploads/",
});

// Upload Video
router.post(
  "/",
  upload.single("file"),
  uploadController.upload.bind(uploadController)
);

// Get All Uploads
router.get(
  "/",
  uploadController.getAllUploads.bind(uploadController)
);

// Get Upload By ID
router.get(
  "/:id",
  uploadController.getUploadById.bind(uploadController)
);

// Delete Upload
router.delete(
  "/:id",
  uploadController.deleteUpload.bind(uploadController)
);

export default router;