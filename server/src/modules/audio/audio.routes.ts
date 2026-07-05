import { Router } from "express";
import { audioController } from "./audio.controller";

const router = Router();

router.post("/extract", (req, res) => {
  audioController.extract(req, res);
});

export default router;