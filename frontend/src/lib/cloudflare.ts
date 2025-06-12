import { S3Client } from "@aws-sdk/client-s3";

const CF_ACC_ID = process.env.CLOUDFLARE_ACCOUNT_ID as string;

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${CF_ACC_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});
