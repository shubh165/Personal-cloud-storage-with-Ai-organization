// import { Redis } from "ioredis";

// export const createRedisConnection = () => {
//   return new Redis({
//     host: "127.0.0.1",
//     port: 6379,
//     maxRetriesPerRequest: null, // required for bullmq
//   });
// };

import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

import { Redis } from "ioredis";

export const createRedisConnection = () => {
  return new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });
};