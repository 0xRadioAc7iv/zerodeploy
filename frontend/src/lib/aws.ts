import { SQSClient } from "@aws-sdk/client-sqs";
import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";

export const sqs = new SQSClient({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_CREDENTIALS_ACCESS_KEY,
    secretAccessKey: env.AWS_CREDENTIALS_SECRET_KEY,
  },
});

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_CREDENTIALS_ACCESS_KEY,
    secretAccessKey: env.AWS_CREDENTIALS_SECRET_KEY,
  },
});
