import { Request, Response, NextFunction } from "express";
import redisClient from "../config/redis.config";

interface CacheOptions {
  expire?: number; // Time in seconds
  key?: string | ((req: Request) => string);
}

const DEFAULT_EXPIRE = 300; // 5 minutes

export const cacheMiddleware = (options: CacheOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Generate cache key
      const generateKey = () => {
        if (typeof options.key === "function") {
          return options.key(req);
        }
        if (typeof options.key === "string") {
          return options.key;
        }
        return `${req.originalUrl || req.url}`;
      };

      const key = generateKey();
      const cachedResponse = await redisClient.get(key);

      if (cachedResponse) {
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      // Override res.json to cache the response
      const originalJson = res.json;
      res.json = function (body: any) {
        if (res.statusCode === 200) {
          redisClient.setex(
            key,
            options.expire || DEFAULT_EXPIRE,
            JSON.stringify(body)
          );
        }
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

// Helper to clear cache for specific patterns
export const clearCache = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
};
