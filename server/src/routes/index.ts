import { Router } from "express";

import healthRoutes from "../modules/health/health.routes";
import uploadRoutes from "../modules/upload/upload.routes";
import { audioRoutes } from "../modules/audio";
import { musicRoutes } from "../modules/music";
import { thumbnailRoutes } from "../modules/thumbnail";
import { testRoutes } from "../modules/test";

const router = Router();

// Health
router.use("/health", healthRoutes);

// Upload
router.use("/api/v1/upload", uploadRoutes);

// Audio
router.use("/api/v1/audio", audioRoutes);

// Music Recognition
router.use("/api/v1/music", musicRoutes);

// Thumbnail
router.use("/api/v1/thumbnail", thumbnailRoutes);

// BullMQ Test
router.use("/api/v1/test", testRoutes);

export default router;