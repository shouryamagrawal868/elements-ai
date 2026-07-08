import dotenv from "dotenv";
dotenv.config();

import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("5000"),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),

  FFMPEG_PATH: z.string(),
  FFPROBE_PATH: z.string(),
  FPCALC_PATH: z.string(),

  ACOUSTID_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);