import { SQSClient } from "@aws-sdk/client-sqs";
import {
  AWS_CREDENTIALS_ACCESS_KEY,
  AWS_CREDENTIALS_SECRET_KEY,
  AWS_REGION,
} from "./env.ts";

export const sqs = new SQSClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_CREDENTIALS_ACCESS_KEY,
    secretAccessKey: AWS_CREDENTIALS_SECRET_KEY,
  },
});
