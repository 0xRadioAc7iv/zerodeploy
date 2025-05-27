import { S3Client } from "@aws-sdk/client-s3";
import {
  AWS_CREDENTIALS_ACCESS_KEY,
  AWS_CREDENTIALS_SECRET_KEY,
  AWS_REGION,
} from "./env.ts";

export const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_CREDENTIALS_ACCESS_KEY,
    secretAccessKey: AWS_CREDENTIALS_SECRET_KEY,
  },
});
