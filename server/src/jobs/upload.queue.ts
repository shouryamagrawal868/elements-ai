import { Queue } from "bullmq";
import { redisConnection } from "./connection";

export interface UploadJobData {
  uploadId: string;
  videoPath: string;
}

export const uploadQueue = new Queue<UploadJobData>(
  "upload-processing",
  {
    connection: redisConnection,
  }
);