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
  publishLog,
  runCommand,
  setBuildStatus,
  unzip,
  uploadBuiltFolderToS3,
} from "./utils.ts";
import { mkdir, rm } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { tmpdir } from "os";
import { redis } from "./redis.ts";

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
        defaultBranch,
        installCommand,
        buildCommand,
        outputDirectory,
        buildId,
      } = JSON.parse(message.Body as string);

      const tmpPath = join(tmpdir(), `repo-${Date.now()}`);
      if (!existsSync(tmpPath)) await mkdir(tmpPath);

      await setBuildStatus(buildId, "Deploying...");

      try {
        const { owner, repo } = parseGitHubUrl(repoUrl);
        const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${defaultBranch}.zip`;
        const zipPath = join(tmpPath, `${owner}-${repo}-${defaultBranch}.zip`);

        publishLog(buildId, `Downloading ZIP...`);
        await downloadFile(zipUrl, zipPath);

        publishLog(buildId, `Unzipping files...`);
        await unzip(zipPath, tmpPath);

        const extractedDir = join(tmpPath, `${repo}-${defaultBranch}`);

        publishLog(buildId, `Installing dependencies...`);
        await runCommand(installCommand, extractedDir, buildId);

        publishLog(buildId, `Building project...`);
        await runCommand(
          buildCommand + ` -- --base=/builds/${repo}/`,
          extractedDir,
          buildId
        );

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

        publishLog(buildId, "Exiting build process...");

        await setBuildStatus(
          buildId,
          `Deployed:::https://${repo}.zerodeploy.xyz`
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

app.get("/check", (_, reply) => {
  reply.code(200).send();
});

const start = async () => {
  try {
    await app.listen({ port: 4000, host: "0.0.0.0" });
    await redis.connect();
    console.log("Connected to Redis");
    pollSQSForMessages();
    console.log("Polling for messages now...");
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1);
  }
};

start();
