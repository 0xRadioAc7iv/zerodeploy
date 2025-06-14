import { env } from "@/env";
import { createClient } from "redis";

export const redis = createClient({
  password: env.REDIS_PASSWORD,
  socket: {
    host: env.REDIS_HOST_URL,
    port: Number(env.REDIS_PORT),
  },
});

await redis.connect();
