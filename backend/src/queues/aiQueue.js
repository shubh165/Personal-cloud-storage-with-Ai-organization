import { Queue } from "bullmq";
import { createRedisConnection } from "../config/redis.js";

export const aiQueue = new Queue("ai-processing", {
  connection: createRedisConnection(),
});
