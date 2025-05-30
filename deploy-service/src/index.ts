import Fastify from "fastify";
import { sqs } from "./aws.ts";
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";
import { AWS_SQS_QUEUE_URL } from "./env.ts";
import {
  downloadFile,
  parseGitHubUrl,
  runCommand,
  unzip,
  uploadBuiltFolderToS3,
} from "./utils.ts";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { tmpdir } from "os";

const app = Fastify();

async function pollSQSForMessages() {
  while (true) {
    try {
      const sqsResponse = await sqs.send(
        new ReceiveMessageCommand({
          QueueUrl: AWS_SQS_QUEUE_URL,
          WaitTimeSeconds: 5,
        })
      );

      const messages = sqsResponse.Messages;

      if (!messages || messages.length === 0) continue;

      const message = messages[0];

      const {
        repoUrl,
        defaultBranch = "main",
        installCommand,
        buildCommand,
        outputDirectory,
      } = JSON.parse(message.Body as string);

      const tmpPath = join(tmpdir(), `repo-${Date.now()}`);
      if (!existsSync(tmpPath)) await mkdir(tmpPath);

      try {
        const { owner, repo } = parseGitHubUrl(repoUrl);
        const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${defaultBranch}.zip`;
        const zipPath = join(tmpPath, `${owner}-${repo}-${defaultBranch}.zip`);

        console.log(`📥 Downloading ZIP from: ${zipUrl}`);
        await downloadFile(zipUrl, zipPath);

        console.log(`📂 Unzipping to: ${tmpPath}`);
        await unzip(zipPath, tmpPath);

        const extractedDir = join(tmpPath, `${repo}-${defaultBranch}`);

        console.log(`📦 Installing dependencies: ${installCommand}`);
        await runCommand(installCommand, extractedDir);

        console.log(`🏗️ Building project: ${buildCommand}`);
        await runCommand(buildCommand, extractedDir);

        console.log("✅ Build completed successfully");

        await uploadBuiltFolderToS3(join(extractedDir, outputDirectory), repo);

        await rm(tmpPath, {
          recursive: true,
          force: true,
        });

        await sqs.send(
          new DeleteMessageCommand({
            QueueUrl: AWS_SQS_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle!,
          })
        );
      } catch (err) {
        console.error("❌ Build failed:", err);
        return { statusCode: 500, body: "Build failed: " + err };
      }
    } catch (err) {
      console.error("Error polling SQS:", err);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

app.listen({ port: 4000 }, () => pollSQSForMessages());
