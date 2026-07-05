import { Router } from "express";

import healthRoutes from "../modules/health/health.routes";
import uploadRoutes from "../modules/upload/upload.routes";
import { audioRoutes } from "../modules/audio";
import { musicRoutes } from "../modules/music";

const router = Router();

// Health Check
router.use("/health", healthRoutes);

// Upload Module
router.use("/api/v1/upload", uploadRoutes);

// Audio Extraction Module
router.use("/api/v1/audio", audioRoutes);

// Music Recognition Module
router.use("/api/v1/music", musicRoutes);

export default router;