import { Router } from "express";

import healthRoutes from "../modules/health/health.routes";
import uploadRoutes from "../modules/upload/upload.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/api/v1/upload", uploadRoutes);

export default router;