import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT) || 5000,

  DATABASE_URL: process.env.DATABASE_URL || "",

  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",

  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
};