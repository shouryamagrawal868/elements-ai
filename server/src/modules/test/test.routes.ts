import { Router } from "express";
import { uploadQueue } from "../../jobs";

const router = Router();

router.post("/queue", async (_req, res) => {
  const job = await uploadQueue.add("test-job", {
    message: "BullMQ is working 🚀",
  });

  res.json({
    success: true,
    jobId: job.id,
  });
});

export default router;