import IORedis from "ioredis";
import { env } from "../config/env";

console.log("Redis Host:", env.REDIS_HOST);
console.log("Redis Port:", env.REDIS_PORT);

export const redisConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  tls: {},
  maxRetriesPerRequest: null,
});