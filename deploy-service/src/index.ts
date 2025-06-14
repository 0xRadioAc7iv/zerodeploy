import Fastify from "fastify";
import { sqs } from "./aws.ts";
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";
import { AWS_SQS_QUEUE_URL } from "./env.ts";
import {
  createNewDeployment,
  downloadFile,
  publishLog,
  runCommand,
  sendEmail,
  setBuildStatus,
  unzip,
  updateDeploymentMetadata,
  updateProjectMetadata,
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
        owner,
        repo,
        fileKey,
        defaultBranch,
        installCommand,
        buildCommand,
        outputDirectory,
        buildId,
        rootDirectory,
        userEmail,
        projectId,
      } = JSON.parse(message.Body as string);

      const tmpPath = join(tmpdir(), `repo-${Date.now()}`);
      if (!existsSync(tmpPath)) await mkdir(tmpPath);

      const zipPath = join(tmpPath, `${owner}-${repo}-${defaultBranch}.zip`);

      const start = Date.now();
      let end;

      try {
        await Promise.all([
          createNewDeployment(buildId, projectId),
          setBuildStatus(buildId, "Deploying..."),
        ]);

        publishLog(buildId, `Fetching repository...`);
        await downloadFile(fileKey, zipPath);

        publishLog(buildId, `Preparing files...`);
        await unzip(zipPath, tmpPath);

        const extractedDir = join(tmpPath, `${repo}-${defaultBranch}`);
        const rootDir =
          rootDirectory !== "./"
            ? join(extractedDir, rootDirectory)
            : extractedDir;

        let install = installCommand?.trim();
        let build = buildCommand?.trim();

        const useNpm = existsSync(join(rootDir, "package-lock.json"));
        const useYarn = existsSync(join(rootDir, "yarn.lock"));
        const usePnpm = existsSync(join(rootDir, "pnpm-lock.yaml"));

        publishLog(
          buildId,
          `Detected package manager: ${
            useNpm ? "npm" : useYarn ? "yarn" : usePnpm ? "pnpm" : "unknown"
          }`
        );

        if (!install) {
          if (useNpm) install = "npm install";
          else if (useYarn) install = "yarn install";
          else if (usePnpm) install = "pnpm install";
          else install = "npm install";
        }

        if (!build) {
          if (useNpm) build = "npm run build";
          else if (useYarn) build = "yarn build";
          else if (usePnpm) build = "pnpm run build";
          else build = "npm run build";
        }

        publishLog(buildId, `Installing dependencies...`);
        await runCommand(install, rootDir, buildId);

        publishLog(buildId, `Building project...`);
        await runCommand(
          build + ` -- --base=/builds/${repo}/`,
          rootDir,
          buildId
        );

        await uploadBuiltFolderToS3(join(rootDir, outputDirectory), repo);

        await Promise.all([
          rm(tmpPath, {
            recursive: true,
            force: true,
          }),
          sqs.send(
            new DeleteMessageCommand({
              QueueUrl: AWS_SQS_QUEUE_URL,
              ReceiptHandle: message.ReceiptHandle!,
            })
          ),
        ]);

        publishLog(buildId, "Exiting build process...");

        const deployedUrl = `Deployed:::https://${repo}.zerodeploy.xyz`;

        end = Date.now();

        await Promise.all([
          setBuildStatus(buildId, deployedUrl),
          updateProjectMetadata(projectId, deployedUrl.split(":::")[1]),
          updateDeploymentMetadata(buildId, "success", end - start),
        ]);
      } catch (err) {
        end = Date.now();
        console.error("❌ Build failed:", err);

        await Promise.all([
          setBuildStatus(buildId, `Failed to Deploy`),
          updateDeploymentMetadata(buildId, "failed", end - start),
          sendEmail("deployFailed", buildId, userEmail),
        ]);
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
