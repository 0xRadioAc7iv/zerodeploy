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

export const AWS_S3_BUCKET_NAME = env
  .get("AWS_S3_BUCKET_NAME")
  .required()
  .asString();

export const AWS_SQS_QUEUE_URL = env
  .get("AWS_SQS_QUEUE_URL")
  .required()
  .asString();
