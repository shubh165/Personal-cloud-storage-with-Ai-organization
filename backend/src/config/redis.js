import { Redis } from "ioredis";

export const createRedisConnection = () => {
  return new Redis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: null, // required for bullmq
  });
};
