import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  shared: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },

  server: {
    AWS_REGION: z.string(),
    AWS_CREDENTIALS_ACCESS_KEY: z.string(),
    AWS_CREDENTIALS_SECRET_KEY: z.string(),
    AWS_SQS_QUEUE_URL: z.string().url(),

    CLOUDFLARE_ACCOUNT_ID: z.string(),
    R2_BUCKET_NAME: z.string(),
    R2_ACCESS_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    EMAIL_WORKER_URL: z.string().url(),

    DATABASE_URL: z.string().url(),

    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),

    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),

    REDIS_HOST_URL: z.string(),
    REDIS_PORT: z.string(),
    REDIS_PASSWORD: z.string(),

    EDGE_CONFIG: z.string().url(),

    SCREENSHOTONE_ACCESS_KEY: z.string(),
  },

  client: {
    NEXT_PUBLIC_LOG_SERVICE_URL: z.string().url(),
  },

  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_LOG_SERVICE_URL: process.env.NEXT_PUBLIC_LOG_SERVICE_URL,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
