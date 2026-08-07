import { Router } from "express";
import multer from "multer";
import path from "path";
import { datasetController } from "./dataset.controller";

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
  fileFilter: (req, file, cb) => {
    const allowed = [".mp3", ".wav", ".flac", ".m4a", ".ogg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Upload single song
router.post(
  "/upload",
  upload.single("audio"),
  datasetController.upload.bind(datasetController)
);

// Upload multiple songs at once
router.post(
  "/bulk",
  upload.array("audio", 50),
  datasetController.bulkUpload.bind(datasetController)
);

// Get dataset statistics
router.get(
  "/stats",
  datasetController.getStats.bind(datasetController)
);

export default router;