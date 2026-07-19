import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("5000"),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string(),

  FFMPEG_PATH: z.string(),
  FFPROBE_PATH: z.string(),
  FPCALC_PATH: z.string(),

  ACOUSTID_API_KEY: z.string(),

  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);