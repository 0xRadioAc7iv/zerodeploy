import { SQSClient } from "@aws-sdk/client-sqs";

export const sqs = new SQSClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_CREDENTIALS_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_CREDENTIALS_SECRET_KEY as string,
  },
});
