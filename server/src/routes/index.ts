import { Router } from "express";

import healthRoutes from "../modules/health/health.routes";
import uploadRoutes from "../modules/upload/upload.routes";
import { audioRoutes } from "../modules/audio";
import { musicRoutes } from "../modules/music";

const router = Router();

router.use("/health", healthRoutes);
router.use("/api/v1/upload", uploadRoutes);
router.use("/api/v1/audio", audioRoutes);
router.use("/api/v1/music", musicRoutes);

export default router;