import "./jobs/upload.worker";

import app from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";

const PORT = env.PORT;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log("==================================");
      console.log("Elements AI Server is running");
      console.log(`http://localhost:${PORT}`);
      console.log("==================================");
    });
  } catch (error) {
    console.error("Failed to connect to database");
    console.error(error);
    process.exit(1);
  }
}

startServer();