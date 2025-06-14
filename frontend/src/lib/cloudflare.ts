import { env } from "@/env";
import { S3Client } from "@aws-sdk/client-s3";

const CF_ACC_ID = env.CLOUDFLARE_ACCOUNT_ID;

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${CF_ACC_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});
