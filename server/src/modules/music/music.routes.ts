import { Router } from "express";
import { musicController } from "./music.controller";

const router = Router();

router.post("/recognize", (req, res) => {
  musicController.recognize(req, res);
});

export default router;