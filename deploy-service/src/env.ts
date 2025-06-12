import { configDotenv } from "dotenv";
import env from "env-var";

configDotenv();

export const AWS_REGION = env.get("AWS_REGION").required().asString();

export const AWS_CREDENTIALS_ACCESS_KEY = env
  .get("AWS_CREDENTIALS_ACCESS_KEY")
  .required()
  .asString();

export const AWS_CREDENTIALS_SECRET_KEY = env
  .get("AWS_CREDENTIALS_SECRET_KEY")
  .required()
  .asString();

export const AWS_SQS_QUEUE_URL = env
  .get("AWS_SQS_QUEUE_URL")
  .required()
  .asString();

export const CLOUDFLARE_ACCOUNT_ID = env
  .get("CLOUDFLARE_ACCOUNT_ID")
  .required()
  .asString();

export const R2_BUCKET_NAME = env.get("R2_BUCKET_NAME").required().asString();

export const R2_ACCESS_ID = env.get("R2_ACCESS_ID").required().asString();

export const R2_SECRET_ACCESS_KEY = env
  .get("R2_SECRET_ACCESS_KEY")
  .required()
  .asString();

export const REDIS_HOST_URL = env.get("REDIS_HOST_URL").required().asString();

export const REDIS_PORT = env.get("REDIS_PORT").required().asPortNumber();

export const REDIS_PASSWORD = env.get("REDIS_PASSWORD").required().asString();
