import { Router } from "express";

const router = Router();

// Root Route
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to Elements AI API",
    version: "1.0.0",
    status: "Running",
  });
});

// Health Route
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    database: "Connected",
  });
});

// API Version Route
router.get("/api/v1", (req, res) => {
  res.json({
    message: "Elements AI API v1",
  });
});

export default router;