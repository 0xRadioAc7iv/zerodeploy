import { configDotenv } from "dotenv";
import env from "env-var";

configDotenv();

export const REDIS_HOST_URL = env.get("REDIS_HOST_URL").required().asString();

export const REDIS_PORT = env.get("REDIS_PORT").required().asPortNumber();

export const REDIS_PASSWORD = env.get("REDIS_PASSWORD").required().asString();
