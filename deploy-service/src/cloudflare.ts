import { S3Client } from "@aws-sdk/client-s3";
import { CLOUDFLARE_ACCOUNT_ID } from "./env.ts";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
});
