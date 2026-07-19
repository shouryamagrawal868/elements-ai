import IORedis from "ioredis";
import { env } from "../config/env";

console.log("Redis Host:", env.REDIS_HOST);
console.log("Redis Port:", env.REDIS_PORT);

export const redisConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  username: "default",
  password: env.REDIS_PASSWORD,

  tls: {
    servername: env.REDIS_HOST,
  },

  connectTimeout: 15000,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
});

redisConnection.on("connect", () => {
  console.log("Redis Connected");
});

redisConnection.on("ready", () => {
  console.log("Redis Ready");
});

redisConnection.on("error", (error) => {
  console.error("Redis Error:", error.message);
});