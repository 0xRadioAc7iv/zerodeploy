import { PutObjectCommand } from "@aws-sdk/client-s3";
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
import { r2 } from "./cloudflare.ts";
import { EMAIL_WORKER_URL, R2_BUCKET_NAME } from "./env.ts";
import { db } from "./db.ts";
import { projectsTable } from "./schema.ts";
import { eq } from "drizzle-orm";

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

      await r2.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
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
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const response = await r2.send(command);
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

export async function sendEmail(
  type: string,
  buildId: string,
  recipient: string
) {
  try {
    await fetch(EMAIL_WORKER_URL, {
      method: "POST",
      body: JSON.stringify({ type, buildId, recipient }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to send email: ", error);
  }
}

export async function updateProjectMetadata(
  projectId: string,
  deployedUrl: string
) {
  try {
    await db
      .update(projectsTable)
      .set({ deployedUrl })
      .where(eq(projectsTable.id, projectId));
    return { error: false };
  } catch (error) {
    console.error("Error creating project: ", error);
    return { error: true, msg: error };
  }
}
