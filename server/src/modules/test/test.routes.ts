import { Router } from "express";
import { uploadQueue } from "../../jobs";

const router = Router();

router.post("/queue", async (_req, res) => {
  const job = await uploadQueue.add("process-upload", {
    uploadId: "test-upload-id",
    videoPath: "test-video.mp4",
  });

  res.json({
    success: true,
    jobId: job.id,
  });
});

export default router;