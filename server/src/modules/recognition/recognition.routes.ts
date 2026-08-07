import { Router } from "express";
import multer from "multer";
import path from "path";
import { recognitionController } from "./recognition.controller";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Recognize music from video or audio
router.post(
  "/identify",
  upload.single("file"),
  recognitionController.identify.bind(recognitionController)
);

export default router;