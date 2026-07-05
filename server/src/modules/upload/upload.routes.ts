import { Router } from "express";
import { upload } from "../../config/multer";
import { uploadController } from "./upload.controller";

const router = Router();

router.post("/", upload.single("file"), (req, res) => {
  uploadController.upload(req, res);
});

export default router;