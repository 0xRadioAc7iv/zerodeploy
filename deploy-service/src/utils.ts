import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./aws.ts";
import { AWS_S3_BUCKET_NAME } from "./env.ts";
import path, { dirname, join } from "path";
import { readdir, readFile } from "fs/promises";
import { pipeline, Readable } from "stream";
import { promisify } from "util";
import { spawn } from "child_process";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import unzipper from "unzipper";
import { redis } from "./redis.ts";
import stripAnsi from "strip-ansi";
import { GetObjectCommand } from "@aws-sdk/client-s3";

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
    }
  }
}

export async function uploadBuiltFolderToS3(
  outputDestination: string,
  repo: string
) {
  const s3Prefix = `builds/${repo}/`; // TODO: ADD USERNAME BEFORE REPO NAME
  await uploadDirectoryToS3(outputDestination, s3Prefix);
}

export async function downloadFile(key: string, destPath: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  const response = await s3.send(command);
  const stream = response.Body as Readable;

  if (!stream || typeof stream.pipe !== "function") {
    throw new Error("S3 response body is not a readable stream");
  }

  const fileStream = createWriteStream(destPath);
  await pipelineAsync(stream, fileStream);
}

export async function unzip(zipPath: string, destPath: string) {
  const directory = await unzipper.Open.file(zipPath);

  await Promise.all(
    directory.files.map(async (file) => {
      const filePath = join(destPath, file.path);

      const dir = dirname(filePath);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

      if (file.type === "Directory") return;

      return new Promise<void>((resolve, reject) => {
        file
          .stream()
          .pipe(createWriteStream(filePath))
          .on("finish", resolve)
          .on("error", reject);
      });
    })
  );
}

export function publishLog(buildId: string, message: string) {
  const cleanMessage = stripAnsi(message);
  redis.xAdd(`logs:${buildId}`, "*", { message: cleanMessage });
}

export async function setBuildStatus(buildId: string, status: string) {
  await redis.set(`buildStatus:${buildId}`, status);
}

export async function runCommand(
  command: string,
  cwd: string,
  buildId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, { cwd, shell: true });

    proc.stdout.on("data", (data) => {
      publishLog(buildId, data.toString());
    });

    proc.stderr.on("data", (data) => {
      publishLog(buildId, `[stderr] ${data.toString()}`);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        publishLog(buildId, `❌ Command failed with code ${code}`);
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}
