import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { s3 } from "./aws.ts";
import { AWS_S3_BUCKET_NAME } from "./env.ts";
import path from "path";
import { __dirname } from "./constants.ts";
import { mkdir, open, readdir, readFile } from "fs/promises";
import { pipeline } from "stream";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);
const streamPipeline = promisify(pipeline);

export async function fetchFilesFromS3(id: string) {
  const { Contents } = await s3.send(
    new ListObjectsV2Command({
      Bucket: AWS_S3_BUCKET_NAME,
      Prefix: `user/${id}`,
    })
  );

  if (!Contents) return;

  for (const file of Contents) {
    const s3Key = file.Key as string;
    const relativePath = s3Key.replace(`user/${id}`, "");
    const localPath = path.join(__dirname, "repo", id, relativePath);
    const dirPath = path.dirname(localPath);

    await mkdir(dirPath, { recursive: true });

    const { Body } = await s3.send(
      new GetObjectCommand({
        Bucket: AWS_S3_BUCKET_NAME,
        Key: s3Key,
      })
    );

    const writeStream = await open(localPath, "w");
    await streamPipeline(
      Body?.transformToWebStream()!,
      writeStream.createWriteStream()
    );
    await writeStream.close();

    console.log(`Downloaded ${s3Key} → ${localPath}`);
  }
}

export async function buildRepo(id: string) {
  const repoPath = path.join(__dirname, "repo", id);

  try {
    console.log(`Installing dependencies in ${repoPath}...`);
    await execAsync("npm install", { cwd: repoPath });

    console.log(`Running build in ${repoPath}...`);
    await execAsync(`npm run build -- --base=/user/builds/${id}/`, {
      cwd: repoPath,
    });

    console.log(`✅ Build complete for repo ${id}`);
  } catch (error) {
    console.error(`❌ Build failed for repo ${id}:`, error);
    throw error;
  }
}

function getContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return (
    {
      ".html": "text/html",
      ".js": "application/javascript",
      ".css": "text/css",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".txt": "text/plain",
      ".webp": "image/webp",
    }[ext] || "application/octet-stream"
  );
}

async function uploadDirectoryToS3(localDir: string, s3Prefix: string) {
  const entries = await readdir(localDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(localDir, entry.name);
    const s3Key = path.join(s3Prefix, entry.name).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      await uploadDirectoryToS3(fullPath, s3Key);
    } else {
      const fileContent = await readFile(fullPath);

      await s3.send(
        new PutObjectCommand({
          Bucket: AWS_S3_BUCKET_NAME,
          Key: s3Key,
          Body: fileContent,
          ContentType: getContentType(entry.name),
        })
      );

      console.log(`Uploaded: ${s3Key}`);
    }
  }
}

export async function uploadBuiltFolderToS3(id: string) {
  const localDistPath = path.join(__dirname, "repo", id, "dist");
  const s3Prefix = `user/builds/${id}/`;

  console.log(
    `Uploading ${localDistPath} → s3://${AWS_S3_BUCKET_NAME}/${s3Prefix}`
  );
  await uploadDirectoryToS3(localDistPath, s3Prefix);
  console.log(`✅ Upload complete for repo ${id}`);
}
