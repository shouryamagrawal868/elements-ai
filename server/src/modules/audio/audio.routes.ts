import { Router } from "express";
import { upload } from "../../config/multer";
import { audioController } from "./audio.controller";

const router = Router();

router.post(
  "/",
  upload.single("file"),
  (req, res) => audioController.extract(req, res)
);

export default router;