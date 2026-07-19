import IORedis from "ioredis";

const redis = new IORedis({
  host: "promoted-feline-163001.upstash.io",
  port: 6379,
  username: "default",
  password: "gQAAAAAAAny5AAIgcDJlMjU2NDBiYmU3ODQ0NmUzOTA0MDNlNzkyNmU0NTU3Zg",
  tls: {
    servername: "promoted-feline-163001.upstash.io",
  },
});

redis.on("ready", () => {
  console.log("Redis Ready");
  process.exit(0);
});

redis.on("error", (err) => {
  console.error(err);
  process.exit(1);
});