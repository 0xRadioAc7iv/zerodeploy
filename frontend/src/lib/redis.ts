import { createClient } from "redis";

export const redis = createClient({
  password: process.env.REDIS_PASSWORD as string,
  socket: {
    host: process.env.REDIS_HOST_URL as string,
    port: Number(process.env.REDIS_PORT as string),
  },
});

await redis.connect();
