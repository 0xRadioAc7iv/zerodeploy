import { PutObjectCommand } from "@aws-sdk/client-s3";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { AWS_S3_BUCKET_NAME, AWS_SQS_QUEUE_URL } from "./env.ts";
import { s3, sqs } from "./aws.ts";
import { z } from "zod";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

export const RequestBody = z.object({
  repositoryUrl: z.string(),
});

const getAllFiles = async (
  dir: string,
  ignoredDirs = [".git"]
): Promise<string[]> => {
  const entries = await readdir(dir, { withFileTypes: true });
  let fileList: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (ignoredDirs.includes(entry.name)) continue;
      const nestedFiles = await getAllFiles(fullPath);
      fileList = fileList.concat(nestedFiles);
    } else {
      fileList.push(fullPath);
    }
  }

  return fileList;
};

const uploadFileToS3 = async (
  id: string,
  localPath: string,
  baseDir: string
) => {
  const fileContent = await readFile(localPath);
  const relativePath = path.relative(baseDir, localPath).replace(/\\/g, "/");

  const s3Key = `user/${id}/${relativePath}`;

  const command = new PutObjectCommand({
    Bucket: AWS_S3_BUCKET_NAME,
    Key: s3Key,
    Body: fileContent,
  });

  await s3.send(command);
};

export const uploadDirectoryToS3 = async (id: string, dir: string) => {
  const files = await getAllFiles(dir);
  for (const file of files) {
    await uploadFileToS3(id, file, dir);
  }
};

export const pushMessageToSQS = async (id: string) => {
  const sendCommand = new SendMessageCommand({
    QueueUrl: AWS_SQS_QUEUE_URL,
    MessageGroupId: "user_id",
    MessageBody: JSON.stringify({ id }),
  });

  sqs.send(sendCommand);
};
