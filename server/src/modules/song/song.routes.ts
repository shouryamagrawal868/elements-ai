import { Router } from "express";
import { songController } from "./song.controller";

const router = Router();

router.post("/", (req, res) => {
  songController.create(req, res);
});

router.get("/", (req, res) => {
  songController.getAll(req, res);
});

router.get("/:id", (req, res) => {
  songController.getById(req, res);
});

router.delete("/:id", (req, res) => {
  songController.delete(req, res);
});

export default router;