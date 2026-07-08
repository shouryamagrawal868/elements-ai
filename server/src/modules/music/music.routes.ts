import { Router } from "express";
import { musicController } from "./music.controller";

const router = Router();

router.post("/fingerprint", (req, res) => {
  musicController.generateFingerprint(req, res);
});

export default router;