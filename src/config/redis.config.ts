import Redis from "ioredis";
import settings from "./settings";

const redisClient = new Redis({
  host: settings.REDIS_HOST || "localhost",
  port: settings.REDIS_PORT || 6379,
  password: settings.REDIS_PASSWORD,
  retryStrategy: (times) => {
    // Retry connection with exponential backoff
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Redis Client Connected");
});

export default redisClient;
