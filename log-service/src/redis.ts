import { createClient } from "redis";
import { REDIS_HOST_URL, REDIS_PASSWORD, REDIS_PORT } from "./env.ts";

export const redis = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST_URL,
    port: REDIS_PORT,
  },
});
