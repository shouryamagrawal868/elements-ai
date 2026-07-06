import { Router } from "express";
import { thumbnailController } from "./thumbnail.controller";

const router = Router();

router.post(
  "/generate",
  (req, res) => thumbnailController.generate(req, res)
);

export default router;