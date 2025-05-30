import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./aws.ts";
import { AWS_S3_BUCKET_NAME } from "./env.ts";
import path from "path";
import { readdir, readFile } from "fs/promises";
import { pipeline, Readable } from "stream";
import { promisify } from "util";
import { exec } from "child_process";
import { createReadStream, createWriteStream } from "fs";
import unzipper from "unzipper";

const execAsync = promisify(exec);
const pipelineAsync = promisify(pipeline);

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

export async function uploadBuiltFolderToS3(
  outputDestination: string,
  repo: string
) {
  const s3Prefix = `builds/${repo}/`; // TODO: ADD USERNAME BEFORE REPO NAME

  console.log(
    `Uploading ${outputDestination} → s3://${AWS_S3_BUCKET_NAME}/${s3Prefix}`
  );
  await uploadDirectoryToS3(outputDestination, s3Prefix);
  console.log(`✅ Upload complete for repo ${outputDestination}`);
}

export function parseGitHubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(\.git)?/);
  if (!match) throw new Error("Invalid GitHub URL");
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

export async function downloadFile(url: string, destPath: string) {
  const res = await fetch(url);

  if (!res.ok)
    throw new Error(`Failed to download: ${res.status} ${res.statusText}`);

  const nodeReadable = Readable.fromWeb(res.body as any);
  await pipelineAsync(nodeReadable, createWriteStream(destPath));
}

export async function unzip(zipPath: string, destPath: string) {
  await pipelineAsync(
    createReadStream(zipPath),
    unzipper.Extract({ path: destPath })
  );
}

export async function runCommand(command: string, cwd: string) {
  console.log(`> ${command}`);
  const { stdout, stderr } = await execAsync(command, { cwd });
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
}
