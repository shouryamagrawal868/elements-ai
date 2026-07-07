import { Router } from "express";
import { upload } from "../../config/multer";
import { uploadController } from "./upload.controller";

const router = Router();

// Upload video
router.post("/", upload.single("file"), (req, res) => {
  uploadController.upload(req, res);
});

// Get upload by ID
router.get("/:id", (req, res) => {
  uploadController.getUploadById(req, res);
});

export default router;